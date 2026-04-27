import path from 'node:path'
import type { Element, ElementContent, Root as HastRoot } from 'hast'
import type { Image, Root as MdastRoot } from 'mdast'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkBreaks from 'remark-breaks'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkSmartypants from 'remark-smartypants'
import { unified, type Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import {
  IMAGE_SIZES_ATTR,
  getSourceHash,
  isTransformable,
} from './images'
import { buildPicture, withFingerprint } from './picture'

const ALLOWED_ATTR_KEYS = new Set(['class', 'id', 'width', 'height'])
const ATTR_BLOCK = /^\{([^}]+)\}/

const ASSET_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.mp4', '.webm', '.pdf',
])

type ParsedAssetUrl =
  | { kind: 'asset'; slug: string; asset: string }
  | { kind: 'local-candidate' }
  | { kind: 'external' }

function parseAssetUrl(url: string): ParsedAssetUrl {
  if (url.startsWith('//') || url.startsWith('#') || url.startsWith('?')) return { kind: 'external' }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return { kind: 'external' }

  const stripped = url.replace(/^(?:\.\/|\/)/, '')
  const [pathPart] = stripped.split(/[?#]/)
  const parts = pathPart.split('/')
  const tail = parts[parts.length - 1]
  const ext = path.extname(tail).toLowerCase()
  if (!ASSET_EXTS.has(ext)) return { kind: 'external' }

  if (parts.length !== 2) return { kind: 'local-candidate' }
  const [slug, asset] = parts
  if (!slug || slug === '..' || asset === '..') return { kind: 'local-candidate' }

  return { kind: 'asset', slug, asset }
}

function isAllowedKey(key: string): boolean {
  return ALLOWED_ATTR_KEYS.has(key) || key.startsWith('data-')
}

function isWhitespaceText(node: ElementContent): boolean {
  return node.type === 'text' && /^\s*$/.test(node.value)
}

function findLiftableChild(node: ElementContent): Element | null {
  if (node.type !== 'element') return null
  if (node.tagName === 'img') return node
  if (node.tagName === 'a') {
    const meaningful = node.children.filter((c) => !isWhitespaceText(c))
    if (
      meaningful.length === 1 &&
      meaningful[0].type === 'element' &&
      meaningful[0].tagName === 'img'
    ) {
      return node
    }
  }
  return null
}

const rehypeImageWrapper: Plugin<[], HastRoot> = () => (tree) => {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'img') return
    const props = (node.properties ??= {})
    if (props.loading == null) props.loading = 'lazy'
  })

  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'p' || index == null || parent == null) return
    const meaningful = node.children.filter((c) => !isWhitespaceText(c))
    if (meaningful.length !== 1) return
    const liftable = findLiftableChild(meaningful[0])
    if (liftable == null) return
    const wrapper: Element = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['image-wrapper'] },
      children: [liftable],
    }
    parent.children[index] = wrapper
  })
}

type AssetUrlContext = {
  postSlug: string
  resolveSourcePath: (slug: string, asset: string) => string
}

const rehypeAssetUrls: Plugin<[AssetUrlContext], HastRoot> = (ctx) => async (tree) => {
  const imgs: Element[] = []
  const otherSrcs: Element[] = []
  const anchors: Element[] = []

  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'img') {
      imgs.push(node)
      return
    }
    const props = node.properties
    if (props == null) return
    if (node.tagName === 'a' && typeof props.href === 'string') {
      anchors.push(node)
      return
    }
    if (typeof props.src === 'string') {
      otherSrcs.push(node)
    }
  })

  await Promise.all([
    ...imgs.map((node) => transformImg(node, ctx)),
    ...otherSrcs.map((node) => fingerprintAttr(node, 'src', ctx)),
    ...anchors.map((node) => fingerprintAttr(node, 'href', ctx)),
  ])
}

async function transformImg(node: Element, ctx: AssetUrlContext): Promise<void> {
  const props = node.properties ?? {}
  const src = typeof props.src === 'string' ? props.src : null
  if (src == null) return
  const parsed = parseAssetUrl(src)
  if (parsed.kind === 'external') return
  if (parsed.kind === 'local-candidate') {
    throw new Error(
      `Post "${ctx.postSlug}": <img> src "${src}" did not fingerprint — expected /<slug>/<asset>`,
    )
  }
  const sourcePath = ctx.resolveSourcePath(parsed.slug, parsed.asset)
  const ext = path.extname(parsed.asset).toLowerCase()

  if (!isTransformable(ext)) {
    const hash = await readHash(sourcePath, parsed, ctx)
    node.properties = { ...props, src: withFingerprint(src, hash) }
    return
  }

  const built = await buildPicture(sourcePath, src).catch((err) => {
    if (isFileNotFound(err)) {
      throw new Error(
        `Post "${ctx.postSlug}": asset "${parsed.slug}/${parsed.asset}" referenced but file not found`,
      )
    }
    throw err
  })

  if (built.sources.length === 0) {
    node.properties = { ...props, src: built.fingerprintedSrc }
    return
  }

  const innerImg: Element = {
    type: 'element',
    tagName: 'img',
    properties: { ...props, src: built.fingerprintedSrc },
    children: [],
  }
  if (innerImg.properties!.width == null) innerImg.properties!.width = built.dims.width
  if (innerImg.properties!.height == null) innerImg.properties!.height = built.dims.height

  const sourceNodes: Element[] = built.sources.map((s) => ({
    type: 'element',
    tagName: 'source',
    properties: {
      type: `image/${s.format}`,
      srcSet: s.srcSet,
      sizes: IMAGE_SIZES_ATTR,
    },
    children: [],
  }))

  node.tagName = 'picture'
  node.properties = {}
  node.children = [...sourceNodes, innerImg]
}

async function fingerprintAttr(
  node: Element,
  key: 'src' | 'href',
  ctx: AssetUrlContext,
): Promise<void> {
  const props = node.properties!
  const url = props[key] as string
  const parsed = parseAssetUrl(url)
  if (parsed.kind === 'external') return
  if (parsed.kind === 'local-candidate') {
    throw new Error(
      `Post "${ctx.postSlug}": <${node.tagName} ${key}> "${url}" did not fingerprint — expected /<slug>/<asset>`,
    )
  }
  const sourcePath = ctx.resolveSourcePath(parsed.slug, parsed.asset)
  const hash = await readHash(sourcePath, parsed, ctx)
  props[key] = withFingerprint(url, hash)
}

async function readHash(
  sourcePath: string,
  parsed: { slug: string; asset: string },
  ctx: AssetUrlContext,
): Promise<string> {
  try {
    return await getSourceHash(sourcePath)
  } catch (err) {
    if (isFileNotFound(err)) {
      throw new Error(
        `Post "${ctx.postSlug}": asset "${parsed.slug}/${parsed.asset}" referenced but file not found`,
      )
    }
    throw err
  }
}

function isFileNotFound(err: unknown): boolean {
  if (err == null || typeof err !== 'object') return false
  if ((err as { code?: string }).code === 'ENOENT') return true
  const msg = (err as { message?: unknown }).message
  return typeof msg === 'string' && /input file is missing|ENOENT/i.test(msg)
}

const rehypeVideoWrapper: Plugin<[], HastRoot> = () => (tree) => {
  const targets: Array<{ parent: HastRoot | Element; index: number; node: Element }> = []
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'video' || parent == null || index == null) return
    targets.push({ parent: parent as HastRoot | Element, index, node })
  })
  for (const { parent, index, node } of targets) {
    const wrapper: Element = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['video-wrapper'] },
      children: [node],
    }
    parent.children[index] = wrapper
  }
}

const remarkImageAttrs: Plugin<[], MdastRoot> = () => (tree) => {
  visit(tree, 'image', (node: Image, index, parent) => {
    if (parent == null || index == null) return
    const next = parent.children[index + 1]
    if (next == null || next.type !== 'text') return
    const match = ATTR_BLOCK.exec(next.value)
    if (match == null) return

    const props: Record<string, string> = {}
    for (const part of match[1].split(/\s+/)) {
      if (!part) continue
      const eq = part.indexOf('=')
      if (eq === -1) continue
      const key = part.slice(0, eq).trim()
      let val = part.slice(eq + 1).trim()
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      if (!isAllowedKey(key)) continue
      props[key] = val
    }
    if (Object.keys(props).length === 0) return

    const data = (node.data ??= {})
    const hProps = (data.hProperties ??= {})
    Object.assign(hProps, props)
    next.value = next.value.slice(match[0].length)
  })
}

export function createRenderer(ctx: AssetUrlContext): (source: string) => Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkImageAttrs)
    .use(remarkSmartypants)
    .use(remarkGemoji)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: { className: 'header-anchor', ariaLabel: 'Permalink' },
      content: { type: 'text', value: '§' },
    })
    .use(rehypeImageWrapper)
    .use(rehypeAssetUrls, ctx)
    .use(rehypeVideoWrapper)
    .use(rehypeStringify)

  return async (source) => String(await processor.process(source))
}

const TWITTER_TAG = /\{%\s*twitter\s+(\S+)\s*%\}/g
const YOUTUBE_BARE = /^\s*(https?:\/\/(?:www\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)\S+)\s*$/gm

export function preprocessMarkdown(source: string): string {
  let out = source

  out = out.replace(TWITTER_TAG, (_, url) => {
    return `> [Tweet](${url})`
  })

  out = out.replace(YOUTUBE_BARE, (_match, url) => {
    return `[${url}](${url})`
  })

  return out
}

export const EXCERPT_MARK = '<!-- more -->'

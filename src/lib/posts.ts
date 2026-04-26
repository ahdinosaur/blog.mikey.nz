import crypto from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { convert as htmlToText } from 'html-to-text'
import {
  IMAGE_FORMATS,
  IMAGE_SIZES_ATTR,
  OG_WIDTH,
  enumerateResponsiveVariants,
  getImageDimensions,
  isTransformable,
  variantFilename,
} from './images'
import {
  EXCERPT_MARK,
  createRenderer,
  postprocessHtml,
  preprocessMarkdown,
} from './markdown'

export type PostFrontmatter = {
  title: string
  date: string
  updated?: string
  excerpt?: string
  image?: string
  tags?: string[]
  categories?: string[]
}

export type Post = {
  slug: string
  title: string
  date: string
  updated?: string
  image?: string
  tags: string[]
  categories: string[]
  excerptHtml: string | null
  description: string
  contentHtml: string
}

export type PostListItem = Pick<
  Post,
  'slug' | 'title' | 'date' | 'updated' | 'image' | 'tags' | 'categories' | 'excerptHtml' | 'description'
>

const POSTS_DIR = path.join(process.cwd(), 'src', 'posts')
const RESERVED_SLUGS = new Set(['assets', 'archives', 'atom.xml'])

export function postsDir(): string {
  return POSTS_DIR
}

export async function getAllPosts(): Promise<Post[]> {
  return loadAllPosts()
}

export async function getPostList(): Promise<PostListItem[]> {
  const posts = await getAllPosts()
  return posts.map(({ contentHtml: _ignored, ...rest }) => rest)
}

export async function getPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  return posts.map((p) => p.slug)
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts()
  return posts.find((p) => p.slug === slug)
}

async function loadAllPosts(): Promise<Post[]> {
  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true })
  const markdownFiles = entries.filter(
    (e) => e.isFile() && e.name.endsWith('.md'),
  )

  const hashCache = new Map<string, Promise<string | null>>()
  const posts = await Promise.all(
    markdownFiles.map((file) =>
      loadPost(path.join(POSTS_DIR, file.name), hashCache),
    ),
  )

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return posts
}

async function loadPost(
  filePath: string,
  hashCache: Map<string, Promise<string | null>>,
): Promise<Post> {
  const slug = path.basename(filePath, '.md')
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(`Post slug "${slug}" collides with a reserved route`)
  }
  const raw = await fs.readFile(filePath, 'utf8')
  const { data, content } = matter(normalizeFrontmatter(raw))

  const fm = data as Partial<PostFrontmatter> & { date?: unknown; updated?: unknown }
  const title = typeof fm.title === 'string' ? fm.title : slug
  const date = normalizeDate(fm.date, `${slug}: date`)
  const updated = fm.updated ? normalizeDate(fm.updated, `${slug}: updated`) : undefined
  const image = typeof fm.image === 'string' ? fm.image : undefined
  const tags = normalizeList(fm.tags)
  const categories = normalizeList(fm.categories)

  const render = createRenderer()
  const source = preprocessMarkdown(content)
  const split = source.split(EXCERPT_MARK)
  const excerptSource = split.length > 1 ? split[0] : null
  const fullSource = split.join('\n\n')

  const contentHtml = await rewriteAssets(
    postprocessHtml(await render(fullSource)),
    hashCache,
  )
  const excerptHtml = excerptSource
    ? await rewriteAssets(
        postprocessHtml(await render(excerptSource)),
        hashCache,
      )
    : null

  const description = typeof fm.excerpt === 'string' && fm.excerpt.length > 0
    ? fm.excerpt
    : excerptHtml
      ? htmlToText(excerptHtml, {
          wordwrap: false,
          selectors: [
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'img', format: 'skip' },
          ],
        })
      : ''

  return {
    slug,
    title,
    date,
    updated,
    image,
    tags,
    categories,
    excerptHtml,
    description,
    contentHtml,
  }
}

const ASSET_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.mp4', '.webm', '.pdf',
])

const URL_ATTR = /(?<=\s)(src|href)="([^"]+)"/g
const IMG_TAG = /<img\b([^>]*?)\s*\/?>/gi
const ATTR_RE = /([\w-]+)\s*=\s*"([^"]*)"/g

async function rewriteAssets(
  html: string,
  hashCache: Map<string, Promise<string | null>>,
): Promise<string> {
  const pictureReplacements = new Map<string, string>()

  for (const m of html.matchAll(IMG_TAG)) {
    const fullTag = m[0]
    if (pictureReplacements.has(fullTag)) continue
    const attrs = parseAttrs(m[1])
    const src = attrs.src
    if (!src) continue
    const parsed = parseAssetUrl(src)
    if (!parsed) continue
    const ext = path.extname(parsed.asset).toLowerCase()
    if (!isTransformable(ext)) continue

    const sourcePath = path.join(POSTS_DIR, parsed.slug, parsed.asset)
    const hash = await getAssetHash(parsed.slug, parsed.asset, hashCache)
    if (!hash) continue

    let dims: { width: number; height: number }
    let variants: { width: number; format: 'avif' | 'webp' }[]
    try {
      dims = await getImageDimensions(sourcePath)
      variants = await enumerateResponsiveVariants(sourcePath)
    } catch {
      continue
    }
    if (variants.length === 0) continue

    const baseDir = `/${parsed.slug}`
    const fileBase = parsed.asset.slice(0, parsed.asset.length - ext.length)

    const sourceTags: string[] = []
    for (const fmt of IMAGE_FORMATS) {
      const entries = variants
        .filter((v) => v.format === fmt)
        .map((v) => {
          const file = variantFilename(fileBase, { kind: 'responsive', width: v.width, format: fmt })
          return `${baseDir}/${file}?v=${hash} ${v.width}w`
        })
      if (entries.length === 0) continue
      sourceTags.push(
        `<source type="image/${fmt}" srcset="${entries.join(', ')}" sizes="${IMAGE_SIZES_ATTR}" />`,
      )
    }

    const newAttrs: Record<string, string> = { ...attrs }
    if (newAttrs.width == null) newAttrs.width = String(dims.width)
    if (newAttrs.height == null) newAttrs.height = String(dims.height)
    const newImg = `<img${attrsToString(newAttrs)} />`

    pictureReplacements.set(fullTag, `<picture>${sourceTags.join('')}${newImg}</picture>`)
  }

  let out = html
  if (pictureReplacements.size > 0) {
    out = out.replace(IMG_TAG, (full) => pictureReplacements.get(full) ?? full)
  }

  const urlReplacements = new Map<string, string>()
  for (const m of out.matchAll(URL_ATTR)) {
    const url = m[2]
    if (urlReplacements.has(url)) continue
    const parsed = parseAssetUrl(url)
    if (!parsed) continue
    const hash = await getAssetHash(parsed.slug, parsed.asset, hashCache)
    if (!hash) continue
    urlReplacements.set(url, addVersion(url, hash))
  }
  if (urlReplacements.size === 0) return out
  return out.replace(URL_ATTR, (full, attr, url) => {
    const replaced = urlReplacements.get(url)
    return replaced ? `${attr}="${replaced}"` : full
  })
}

function parseAttrs(attrString: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of attrString.matchAll(ATTR_RE)) {
    out[m[1].toLowerCase()] = m[2]
  }
  return out
}

function attrsToString(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${v.replace(/"/g, '&quot;')}"`)
    .join('')
}

export function ogVariantUrl(image: string | undefined): string | null {
  if (!image) return null
  const stripped = image.replace(/^\/+/, '').split(/[?#]/)[0]
  const parts = stripped.split('/')
  if (parts.length !== 2) return null
  const [slug, file] = parts
  const ext = path.extname(file).toLowerCase()
  if (!isTransformable(ext)) return null
  const base = file.slice(0, file.length - ext.length)
  return `/${slug}/${variantFilename(base, { kind: 'og', width: OG_WIDTH, format: 'jpeg' })}`
}

function parseAssetUrl(url: string): { slug: string; asset: string } | null {
  if (url.startsWith('//') || url.startsWith('#') || url.startsWith('?')) return null
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null

  const stripped = url.replace(/^(?:\.\/|\/)/, '')
  const [pathPart] = stripped.split(/[?#]/)
  const parts = pathPart.split('/')
  if (parts.length !== 2) return null
  const [slug, asset] = parts
  if (!slug || !asset || slug === '..' || asset === '..') return null

  const ext = path.extname(asset).toLowerCase()
  if (!ASSET_EXTS.has(ext)) return null
  return { slug, asset }
}

function getAssetHash(
  slug: string,
  asset: string,
  hashCache: Map<string, Promise<string | null>>,
): Promise<string | null> {
  const key = `${slug}/${asset}`
  const cached = hashCache.get(key)
  if (cached) return cached
  const promise = fs
    .readFile(path.join(POSTS_DIR, slug, asset))
    .then((data) => crypto.createHash('sha256').update(data).digest('hex').slice(0, 8))
    .catch(() => null)
  hashCache.set(key, promise)
  return promise
}

function addVersion(url: string, hash: string): string {
  const fragIdx = url.indexOf('#')
  const base = fragIdx === -1 ? url : url.slice(0, fragIdx)
  const fragment = fragIdx === -1 ? '' : url.slice(fragIdx)
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}v=${hash}${fragment}`
}

function normalizeFrontmatter(raw: string): string {
  const trimmed = raw.replace(/^\s+/, '')
  if (trimmed.startsWith('---')) return trimmed
  const fmEnd = trimmed.indexOf('\n---')
  if (fmEnd === -1) return trimmed
  return `---\n${trimmed}`
}

function normalizeDate(value: unknown, context: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
  }
  throw new Error(`Invalid date for ${context}: ${JSON.stringify(value)}`)
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
  }
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

export function formatPostDate(iso: string, opts: { withDay?: boolean } = {}): string {
  const d = new Date(iso)
  const month = d.toLocaleString('en-US', { month: opts.withDay ? 'long' : 'short', timeZone: 'UTC' })
  const day = String(d.getUTCDate()).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${month} ${day} ${year}`
}

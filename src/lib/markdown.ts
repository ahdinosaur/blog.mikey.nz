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

const ALLOWED_ATTR_KEYS = new Set(['class', 'id', 'width', 'height'])
const ATTR_BLOCK = /^\{([^}]+)\}/

function isAllowedKey(key: string): boolean {
  return ALLOWED_ATTR_KEYS.has(key) || key.startsWith('data-')
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

export function createRenderer(): (source: string) => Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkSmartypants)
    .use(remarkGemoji)
    .use(remarkImageAttrs)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: { className: 'header-anchor', ariaLabel: 'Permalink' },
      content: { type: 'text', value: '§' },
    })
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

const VIDEO_OPEN = /<video([^>]*)>/gi
const IMG_TAG = /<img([^>]*)\/?>/gi

export function postprocessHtml(html: string): string {
  let out = html

  out = out.replace(IMG_TAG, (_match, attrs) => {
    const hasLazy = /loading\s*=/i.test(attrs)
    const next = hasLazy ? attrs : `${attrs} loading="lazy"`
    return `<div class="image-wrapper"><img${next} /></div>`
  })

  out = out.replace(VIDEO_OPEN, (_match, attrs) => {
    return `<div class="video-wrapper"><video${attrs}>`
  })
  out = out.replace(/<\/video>/gi, '</video></div>')

  return out
}

export const EXCERPT_MARK = '<!-- more -->'

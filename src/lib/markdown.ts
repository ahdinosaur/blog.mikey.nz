import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import attrs from 'markdown-it-attrs'
import { full as emoji } from 'markdown-it-emoji'

export function createRenderer() {
  const md = new MarkdownIt({
    html: true,
    xhtmlOut: false,
    breaks: true,
    linkify: true,
    typographer: true,
    quotes: '“”‘’',
    langPrefix: 'language-',
  })

  md.use(attrs, {
    allowedAttributes: ['class', 'id', 'width', 'height', /^data-/],
  })
  md.use(emoji)
  md.use(anchor, {
    level: 1,
    permalink: anchor.permalink.linkAfterHeader({
      style: 'visually-hidden',
      assistiveText: (title) => `Permalink to "${title}"`,
      visuallyHiddenClass: 'visually-hidden',
      wrapper: ['<span class="header-anchor-wrapper">', '</span>'],
      class: 'header-anchor',
      symbol: '§',
    }),
    slugify,
  })

  return md
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
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

import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { convert as htmlToText } from 'html-to-text'
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

  const posts = await Promise.all(
    markdownFiles.map((file) => loadPost(path.join(POSTS_DIR, file.name))),
  )

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return posts
}

async function loadPost(filePath: string): Promise<Post> {
  const slug = path.basename(filePath, '.md')
  const raw = await fs.readFile(filePath, 'utf8')
  const { data, content } = matter(normalizeFrontmatter(raw))

  const fm = data as Partial<PostFrontmatter> & { date?: unknown; updated?: unknown }
  const title = typeof fm.title === 'string' ? fm.title : slug
  const date = normalizeDate(fm.date, `${slug}: date`)
  const updated = fm.updated ? normalizeDate(fm.updated, `${slug}: updated`) : undefined
  const image = typeof fm.image === 'string' ? fm.image : undefined
  const tags = normalizeList(fm.tags)
  const categories = normalizeList(fm.categories)

  const md = createRenderer()
  const source = preprocessMarkdown(content)
  const split = source.split(EXCERPT_MARK)
  const excerptSource = split.length > 1 ? split[0] : null
  const fullSource = split.join('\n\n')

  const contentHtml = postprocessHtml(md.render(fullSource))
  const excerptHtml = excerptSource
    ? postprocessHtml(md.render(excerptSource))
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

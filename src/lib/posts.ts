import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
import matter from 'gray-matter'
import { convert as htmlToText } from 'html-to-text'
import {
  OG_WIDTH,
  isTransformable,
  variantFilename,
} from './images'
import {
  EXCERPT_MARK,
  createRenderer,
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

const POSTS_DIR_OVERRIDE =
  process.env.NODE_ENV !== 'production' ? (process.env.POSTS_DIR ?? null) : null
const RESERVED_SLUGS = new Set(['assets', 'archives', 'atom.xml'])

export function postsPath(...parts: string[]): string {
  if (POSTS_DIR_OVERRIDE != null) {
    return path.join(POSTS_DIR_OVERRIDE, ...parts)
  }
  return path.join(process.cwd(), 'src', 'posts', ...parts)
}

export const getAllPosts = cache((): Promise<Post[]> => loadAllPosts())

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
  const entries = await fs.readdir(postsPath(), { withFileTypes: true })
  const markdownFiles = entries.filter(
    (e) => e.isFile() && e.name.endsWith('.md'),
  )

  const posts = await Promise.all(
    markdownFiles.map((file) => loadPost(postsPath(file.name))),
  )

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return posts
}

async function loadPost(filePath: string): Promise<Post> {
  const slug = path.basename(filePath, '.md')
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(`Post slug "${slug}" collides with a reserved route`)
  }
  const raw = await fs.readFile(filePath, 'utf8')
  const { data, content } = matter(raw)

  const fm = data as Partial<PostFrontmatter> & { date?: unknown; updated?: unknown }
  const title = typeof fm.title === 'string' ? fm.title : slug
  const date = normalizeDate(fm.date, `${slug}: date`)
  const updated = fm.updated ? normalizeDate(fm.updated, `${slug}: updated`) : undefined
  const image =
    typeof fm.image === 'string' && fm.image.length > 0
      ? fm.image.startsWith('/')
        ? fm.image
        : `/${fm.image}`
      : undefined
  const tags = normalizeList(fm.tags)
  const categories = normalizeList(fm.categories)

  const render = createRenderer({
    postSlug: slug,
    resolveSourcePath: (s, a) => postsPath(s, a),
  })
  const source = preprocessMarkdown(content)
  const split = source.split(EXCERPT_MARK)
  const excerptSource = split.length > 1 ? split[0] : null
  const fullSource = split.join('\n\n')

  const contentHtml = await render(fullSource)
  const excerptHtml = excerptSource ? await render(excerptSource) : null

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

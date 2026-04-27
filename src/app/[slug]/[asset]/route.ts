import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import {
  OG_WIDTH,
  enumerateResponsiveVariants,
  getMimeType,
  isTransformable,
  parseVariantFilename,
  transform,
  variantFilename,
} from '@/lib/images'
import { getAllPosts, postsPath } from '@/lib/posts'

const SOURCE_EXT_PRIORITY = ['.jpg', '.jpeg', '.png'] as const

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; asset: string }> },
): Promise<Response> {
  const { slug, asset } = await params
  if (slug.includes('..') || asset.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const variant = parseVariantFilename(asset)
  if (variant && variant.spec.kind !== 'favicon') {
    const sourcePath = await findSource(slug, variant.base)
    if (!sourcePath) return new NextResponse('Not found', { status: 404 })
    try {
      const { data, contentType } = await transform(sourcePath, variant.spec)
      return new NextResponse(new Uint8Array(data), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {
      return new NextResponse('Not found', { status: 404 })
    }
  }

  const ext = path.extname(asset).toLowerCase()
  const contentType = getMimeType(ext)
  if (!contentType) return new NextResponse('Not found', { status: 404 })
  try {
    const data = await fs.readFile(postsPath(slug, asset))
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

export async function generateStaticParams(): Promise<{ slug: string; asset: string }[]> {
  const posts = await getAllPosts()
  const all: { slug: string; asset: string }[] = []

  for (const post of posts) {
    const slug = post.slug
    const dir = postsPath(slug)
    let entries: string[] = []
    try {
      entries = await fs.readdir(dir)
    } catch {
      continue
    }
    for (const name of entries) {
      const ext = path.extname(name).toLowerCase()
      if (!getMimeType(ext)) continue
      all.push({ slug, asset: name })

      if (!isTransformable(ext)) continue
      const sourcePath = path.join(dir, name)
      const base = name.slice(0, name.length - ext.length)
      const variants = await enumerateResponsiveVariants(sourcePath)
      for (const v of variants) {
        all.push({
          slug,
          asset: variantFilename(base, {
            kind: 'responsive',
            width: v.width,
            format: v.format,
          }),
        })
      }
    }
  }

  for (const post of posts) {
    const og = parseSameDirImageRef(post.slug, post.image)
    if (!og) continue
    all.push({
      slug: post.slug,
      asset: variantFilename(og.base, { kind: 'og', width: OG_WIDTH, format: 'jpeg' }),
    })
  }

  return all
}

function parseSameDirImageRef(
  slug: string,
  ref: string | undefined,
): { base: string } | null {
  if (!ref) return null
  const stripped = ref.replace(/^\/+/, '').split(/[?#]/)[0]
  const parts = stripped.split('/')
  if (parts.length !== 2) return null
  const [refSlug, file] = parts
  if (refSlug !== slug) return null
  const ext = path.extname(file).toLowerCase()
  if (!isTransformable(ext)) return null
  const base = file.slice(0, file.length - ext.length)
  return { base }
}

async function findSource(slug: string, base: string): Promise<string | null> {
  for (const ext of SOURCE_EXT_PRIORITY) {
    const candidate = postsPath(slug, `${base}${ext}`)
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // try next
    }
  }
  return null
}

export const dynamicParams = false

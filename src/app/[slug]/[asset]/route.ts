import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getPostSlugs, postsDir } from '@/lib/posts'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; asset: string }> },
): Promise<Response> {
  const { slug, asset } = await params
  if (slug.includes('/') || slug.includes('..') || asset.includes('/') || asset.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = path.extname(asset).toLowerCase()
  if (!(ext in MIME_TYPES)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const filePath = path.join(postsDir(), slug, asset)
  try {
    const data = await fs.readFile(filePath)
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': MIME_TYPES[ext],
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

export async function generateStaticParams(): Promise<{ slug: string; asset: string }[]> {
  const slugs = await getPostSlugs()
  const all: { slug: string; asset: string }[] = []
  for (const slug of slugs) {
    const dir = path.join(postsDir(), slug)
    let entries: string[] = []
    try {
      entries = await fs.readdir(dir)
    } catch {
      continue
    }
    for (const name of entries) {
      const ext = path.extname(name).toLowerCase()
      if (ext in MIME_TYPES) {
        all.push({ slug, asset: name })
      }
    }
  }
  return all
}

export const dynamicParams = false

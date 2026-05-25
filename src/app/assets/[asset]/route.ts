import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import {
  OG_WIDTH,
  enumerateFaviconVariants,
  enumerateResponsiveVariants,
  getMimeType,
  isTransformable,
  parseVariantFilename,
  transform,
  variantFilename,
} from '@/lib/images'

const ASSETS_DIR = path.join(process.cwd(), 'src', 'assets')
const FAVICON_BASE = 'favicon'
const OG_BASES = new Set(['banner'])
const SOURCE_EXT_PRIORITY = ['.jpg', '.jpeg', '.png'] as const

export async function GET(
  req: Request,
  { params }: { params: Promise<{ asset: string }> },
): Promise<Response> {
  const { asset } = await params
  if (asset.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const cacheControl = new URL(req.url).searchParams.has('v')
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=3600'

  const variant = parseVariantFilename(asset)
  if (variant) {
    if (variant.spec.kind === 'favicon' && variant.base !== FAVICON_BASE) {
      return new NextResponse('Not found', { status: 404 })
    }
    const sourcePath = await findSource(variant.base)
    if (!sourcePath) return new NextResponse('Not found', { status: 404 })
    try {
      const { data, contentType } = await transform(sourcePath, variant.spec)
      return new NextResponse(new Uint8Array(data), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
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
    const data = await fs.readFile(path.join(ASSETS_DIR, asset))
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

export async function generateStaticParams(): Promise<{ asset: string }[]> {
  let entries: string[] = []
  try {
    entries = await fs.readdir(ASSETS_DIR)
  } catch {
    return []
  }

  const out: { asset: string }[] = []
  for (const name of entries) {
    const ext = path.extname(name).toLowerCase()
    if (!getMimeType(ext)) continue
    out.push({ asset: name })

    const sourcePath = path.join(ASSETS_DIR, name)
    const base = name.slice(0, name.length - ext.length)

    if (base === FAVICON_BASE && isTransformable(ext)) {
      const sizes = await enumerateFaviconVariants(sourcePath)
      for (const size of sizes) {
        out.push({
          asset: variantFilename(base, { kind: 'favicon', size, format: 'png' }),
        })
      }
      continue
    }

    if (isTransformable(ext)) {
      const variants = await enumerateResponsiveVariants(sourcePath)
      for (const v of variants) {
        out.push({
          asset: variantFilename(base, {
            kind: 'responsive',
            width: v.width,
            format: v.format,
          }),
        })
      }
      if (OG_BASES.has(base)) {
        out.push({
          asset: variantFilename(base, { kind: 'og', width: OG_WIDTH, format: 'jpeg' }),
        })
      }
    }
  }
  return out
}

async function findSource(base: string): Promise<string | null> {
  for (const ext of SOURCE_EXT_PRIORITY) {
    const candidate = path.join(ASSETS_DIR, `${base}${ext}`)
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // try next
    }
  }
  return null
}

export const dynamic = 'force-static'
export const dynamicParams = false

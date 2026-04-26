import crypto from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

export const IMAGE_WIDTHS = [480, 768, 1024, 1536, 1984] as const
export const IMAGE_FORMATS = ['avif', 'webp'] as const
export const OG_WIDTH = 1200
export const FAVICON_SIZES = [16, 32, 48, 180, 192, 512] as const
export const IMAGE_QUALITY = 80
export const IMAGE_SIZES_ATTR = '(min-width: 992px) 992px, 100vw'

export type ResponsiveFormat = (typeof IMAGE_FORMATS)[number]

const TRANSFORMABLE_EXTS = new Set(['.jpg', '.jpeg', '.png'])

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
}

export function getMimeType(ext: string): string | undefined {
  return MIME_TYPES[ext.toLowerCase()]
}

export function isTransformable(ext: string): boolean {
  return TRANSFORMABLE_EXTS.has(ext.toLowerCase())
}

export type TransformSpec =
  | { kind: 'responsive'; width: number; format: ResponsiveFormat }
  | { kind: 'og'; width: number; format: 'jpeg' }
  | { kind: 'favicon'; size: number; format: 'png' }

export type Dimensions = { width: number; height: number }

const dimensionCache = new Map<string, Promise<Dimensions>>()

export function getImageDimensions(filePath: string): Promise<Dimensions> {
  const cached = dimensionCache.get(filePath)
  if (cached) return cached
  const promise = sharp(filePath)
    .metadata()
    .then((m) => {
      const w = m.width ?? 0
      const h = m.height ?? 0
      const orientation = m.orientation ?? 1
      if (orientation >= 5 && orientation <= 8) return { width: h, height: w }
      return { width: w, height: h }
    })
  dimensionCache.set(filePath, promise)
  return promise
}

const hashCache = new Map<string, Promise<string>>()

export function getSourceHash(filePath: string): Promise<string> {
  const cached = hashCache.get(filePath)
  if (cached) return cached
  const promise = fs
    .readFile(filePath)
    .then((data) => crypto.createHash('sha256').update(data).digest('hex').slice(0, 8))
  hashCache.set(filePath, promise)
  return promise
}

const cacheRoot = path.join(process.cwd(), '.next', 'cache', 'images')

function specSlug(spec: TransformSpec): string {
  switch (spec.kind) {
    case 'responsive':
      return `${spec.width}.${spec.format}`
    case 'og':
      return `og.jpg`
    case 'favicon':
      return `${spec.size}.png`
  }
}

function specMime(spec: TransformSpec): string {
  switch (spec.format) {
    case 'avif': return 'image/avif'
    case 'webp': return 'image/webp'
    case 'jpeg': return 'image/jpeg'
    case 'png': return 'image/png'
  }
}

const inFlight = new Map<string, Promise<Buffer>>()

export async function transform(
  sourcePath: string,
  spec: TransformSpec,
): Promise<{ data: Buffer; contentType: string }> {
  const hash = await getSourceHash(sourcePath)
  const cacheDir = path.join(cacheRoot, hash)
  const cacheFile = path.join(cacheDir, specSlug(spec))
  try {
    const data = await fs.readFile(cacheFile)
    return { data, contentType: specMime(spec) }
  } catch {
    // miss: produce
  }
  let pending = inFlight.get(cacheFile)
  if (!pending) {
    pending = (async () => {
      const data = await runSharp(sourcePath, spec)
      await fs.mkdir(cacheDir, { recursive: true })
      const tmp = `${cacheFile}.${process.pid}.${Date.now()}.tmp`
      await fs.writeFile(tmp, data)
      await fs.rename(tmp, cacheFile)
      return data
    })()
    inFlight.set(cacheFile, pending)
    pending.finally(() => {
      if (inFlight.get(cacheFile) === pending) inFlight.delete(cacheFile)
    })
  }
  const data = await pending
  return { data, contentType: specMime(spec) }
}

async function runSharp(sourcePath: string, spec: TransformSpec): Promise<Buffer> {
  let pipe = sharp(sourcePath, { failOn: 'none' }).rotate()
  switch (spec.kind) {
    case 'responsive':
      pipe = pipe.resize({ width: spec.width, withoutEnlargement: true })
      pipe =
        spec.format === 'avif'
          ? pipe.avif({ quality: IMAGE_QUALITY })
          : pipe.webp({ quality: IMAGE_QUALITY })
      break
    case 'og':
      pipe = pipe
        .resize({ width: spec.width, withoutEnlargement: true })
        .jpeg({ quality: IMAGE_QUALITY })
      break
    case 'favicon':
      pipe = pipe
        .resize({ width: spec.size, height: spec.size, fit: 'cover' })
        .png()
      break
  }
  return pipe.toBuffer()
}

export function variantFilename(base: string, spec: TransformSpec): string {
  switch (spec.kind) {
    case 'responsive':
      return `${base}.${spec.width}.${spec.format}`
    case 'og':
      return `${base}.og.jpg`
    case 'favicon':
      return `${base}.${spec.size}.png`
  }
}

const RESPONSIVE_RE = /^(.+)\.(\d+)\.(avif|webp|png)$/i
const OG_RE = /^(.+)\.og\.jpg$/i

export function parseVariantFilename(
  filename: string,
): { base: string; spec: TransformSpec } | null {
  const og = OG_RE.exec(filename)
  if (og) {
    return { base: og[1], spec: { kind: 'og', width: OG_WIDTH, format: 'jpeg' } }
  }
  const m = RESPONSIVE_RE.exec(filename)
  if (!m) return null
  const base = m[1]
  const width = Number(m[2])
  const format = m[3].toLowerCase() as 'avif' | 'webp' | 'png'
  if (format === 'png') {
    if (!(FAVICON_SIZES as readonly number[]).includes(width)) return null
    return { base, spec: { kind: 'favicon', size: width, format: 'png' } }
  }
  if (!(IMAGE_WIDTHS as readonly number[]).includes(width)) return null
  return { base, spec: { kind: 'responsive', width, format } }
}

export async function enumerateResponsiveVariants(
  sourcePath: string,
): Promise<{ width: number; format: ResponsiveFormat }[]> {
  const ext = path.extname(sourcePath).toLowerCase()
  if (!isTransformable(ext)) return []
  const { width: srcW } = await getImageDimensions(sourcePath)
  const out: { width: number; format: ResponsiveFormat }[] = []
  for (const w of IMAGE_WIDTHS) {
    if (w > srcW) continue
    for (const f of IMAGE_FORMATS) {
      out.push({ width: w, format: f })
    }
  }
  return out
}

export async function enumerateFaviconVariants(
  sourcePath: string,
): Promise<number[]> {
  const { width: srcW } = await getImageDimensions(sourcePath)
  return FAVICON_SIZES.filter((s) => s <= srcW)
}

export async function pickResponsiveLargest(
  sourcePath: string,
): Promise<number | null> {
  const variants = await enumerateResponsiveVariants(sourcePath)
  if (variants.length === 0) return null
  return Math.max(...variants.map((v) => v.width))
}

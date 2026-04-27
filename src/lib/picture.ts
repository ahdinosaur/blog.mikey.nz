import {
  type Dimensions,
  IMAGE_FORMATS,
  enumerateResponsiveVariants,
  getImageDimensions,
  getSourceHash,
  variantFilename,
} from './images'

export type PictureSource = { format: string; srcSet: string }

export type BuiltPicture = {
  sources: PictureSource[]
  dims: Dimensions
  hash: string
  fingerprintedSrc: string
}

export async function buildPicture(
  sourcePath: string,
  src: string,
): Promise<BuiltPicture> {
  const [dims, hash, variants] = await Promise.all([
    getImageDimensions(sourcePath),
    getSourceHash(sourcePath),
    enumerateResponsiveVariants(sourcePath),
  ])

  const baseUrl = src.split(/[?#]/)[0]
  const lastSlash = baseUrl.lastIndexOf('/')
  const baseDir = lastSlash === -1 ? '' : baseUrl.slice(0, lastSlash)
  const filename = baseUrl.slice(lastSlash + 1)
  const dot = filename.lastIndexOf('.')
  const fileBase = dot === -1 ? filename : filename.slice(0, dot)

  const sources: PictureSource[] = []
  for (const fmt of IMAGE_FORMATS) {
    const entries = variants
      .filter((v) => v.format === fmt)
      .map((v) => {
        const file = variantFilename(fileBase, { kind: 'responsive', width: v.width, format: fmt })
        return `${baseDir}/${file}?v=${hash} ${v.width}w`
      })
    if (entries.length === 0) continue
    sources.push({ format: fmt, srcSet: entries.join(', ') })
  }

  return {
    sources,
    dims,
    hash,
    fingerprintedSrc: withFingerprint(src, hash),
  }
}

export function withFingerprint(url: string, hash: string): string {
  const fragIdx = url.indexOf('#')
  const base = fragIdx === -1 ? url : url.slice(0, fragIdx)
  const fragment = fragIdx === -1 ? '' : url.slice(fragIdx)
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}v=${hash}${fragment}`
}

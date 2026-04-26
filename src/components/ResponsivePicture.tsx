import path from 'node:path'
import type { CSSProperties } from 'react'
import {
  IMAGE_FORMATS,
  IMAGE_SIZES_ATTR,
  enumerateResponsiveVariants,
  getImageDimensions,
  getSourceHash,
  isTransformable,
  variantFilename,
} from '@/lib/images'

export type ResponsivePictureProps = {
  src: string
  alt: string
  sizes?: string
  className?: string
  imgClassName?: string
  style?: CSSProperties
  imgStyle?: CSSProperties
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export async function ResponsivePicture({
  src,
  alt,
  sizes = IMAGE_SIZES_ATTR,
  className,
  imgClassName,
  style,
  imgStyle,
  loading = 'lazy',
  fetchPriority,
}: ResponsivePictureProps) {
  const sourcePath = urlToSourcePath(src)
  const ext = sourcePath ? path.extname(sourcePath).toLowerCase() : ''
  if (!sourcePath || !isTransformable(ext)) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        className={imgClassName}
        style={imgStyle}
      />
    )
  }

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

  const sources: { format: string; srcSet: string }[] = []
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

  return (
    <picture className={className} style={style}>
      {sources.map(({ format, srcSet }) => (
        <source key={format} type={`image/${format}`} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        src={withFingerprint(src, hash)}
        alt={alt}
        width={dims.width}
        height={dims.height}
        loading={loading}
        fetchPriority={fetchPriority}
        className={imgClassName}
        style={imgStyle}
      />
    </picture>
  )
}

function urlToSourcePath(url: string): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null
  const stripped = url.replace(/^\/+/, '').split(/[?#]/)[0]
  const parts = stripped.split('/')
  if (parts.length !== 2) return null
  const [first, file] = parts
  if (!first || !file || first === '..' || file === '..') return null
  if (first === 'assets') {
    return path.join(process.cwd(), 'src', 'assets', file)
  }
  return path.join(process.cwd(), 'src', 'posts', first, file)
}

function withFingerprint(url: string, hash: string): string {
  const fragIdx = url.indexOf('#')
  const base = fragIdx === -1 ? url : url.slice(0, fragIdx)
  const fragment = fragIdx === -1 ? '' : url.slice(fragIdx)
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}v=${hash}${fragment}`
}

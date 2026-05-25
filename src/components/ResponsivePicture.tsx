import path from 'node:path'
import type { CSSProperties } from 'react'
import { IMAGE_SIZES_ATTR, isTransformable } from '@/lib/images'
import { buildPicture } from '@/lib/picture'

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

  const { sources, dims, fingerprintedSrc } = await buildPicture(sourcePath, src)

  return (
    <picture className={className} style={style}>
      {sources.map(({ format, srcSet }) => (
        <source key={format} type={`image/${format}`} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        src={fingerprintedSrc}
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

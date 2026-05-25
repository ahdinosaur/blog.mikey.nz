'use client'

import { useEffect } from 'react'

const VIMEO_ALLOW = 'autoplay; fullscreen; picture-in-picture'
const YOUTUBE_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'

function load() {
  const els = document.querySelectorAll<HTMLElement>('.video-embed[data-src]')
  els.forEach((v) => {
    if (v.dataset.loaded) return
    const src = v.dataset.src ?? ''
    const title = v.dataset.title ?? ''
    const type = v.dataset.type
    if (type !== 'vimeo' && type !== 'youtube') return

    const iframe = document.createElement('iframe')
    iframe.src = src
    iframe.title = title
    iframe.loading = 'lazy'
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute(
      'allow',
      type === 'vimeo' ? VIMEO_ALLOW : YOUTUBE_ALLOW,
    )
    iframe.setAttribute('allowfullscreen', '')

    v.replaceChildren(iframe)
    v.dataset.loaded = '1'
  })
}

export function VideoEmbedHydrator() {
  useEffect(() => {
    load()
  }, [])
  return null
}

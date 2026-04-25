'use client'

import { useEffect } from 'react'

const VIMEO_ALLOW =
  'autoplay; fullscreen; picture-in-picture'
const YOUTUBE_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'

function load() {
  const els = document.querySelectorAll<HTMLElement>('.video-embed[data-src]')
  els.forEach((v) => {
    if (v.dataset.loaded) return
    const src = v.dataset.src ?? ''
    const title = v.dataset.title ?? ''
    if (v.dataset.type === 'vimeo') {
      v.innerHTML = `<iframe src="${src}" title="${title}" frameborder="0" loading="lazy" allow="${VIMEO_ALLOW}" allowfullscreen></iframe>`
    } else if (v.dataset.type === 'youtube') {
      v.innerHTML = `<iframe src="${src}" title="${title}" frameborder="0" loading="lazy" allow="${YOUTUBE_ALLOW}" allowfullscreen></iframe>`
    }
    v.dataset.loaded = '1'
  })
}

export function VideoEmbedHydrator() {
  useEffect(() => {
    load()
    window.addEventListener('resize', load)
    return () => window.removeEventListener('resize', load)
  }, [])
  return null
}

addEventListener('DOMContentLoaded', loadVideos)
addEventListener('resize', loadVideos)

function loadVideos() {
  loadEmbedVideos()
  loadLocalVideos()
}

function loadEmbedVideos() {
  const videosToLoad = document.querySelectorAll(`.video-embed[data-src]`)
  for (let video of videosToLoad) {
    if (video.dataset.loaded) continue // already loaded
    const { src, title } = video.dataset
    if (video.dataset.type === 'vimeo') {
      video.innerHTML = `
        <iframe
          src="${src}"
          title="${title}"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen 
        >
        </iframe>
      `
    } else if (video.dataset.type === 'youtube') {
      video.innerHTML = `
        <iframe
          src="${src}"
          title="${title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        >
        </iframe>
      `
    }
    video.dataset.loaded = true
  }
}

function loadLocalVideos() {
  const videoSize = getVideoSize()
  const videosToLoad = document.querySelectorAll(`video[data-src]`)
  for (let video of videosToLoad) {
    if (video.dataset.size === String(videoSize)) continue // already loaded
    const src = video.dataset.src
    const isPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2)
    if (isPlaying) continue // don't interrupt video while playing
    video.innerHTML = `
      <source src="${src}-web-${videoSize}.webm" type="video/webm; codecs=vp9,vorbis" />
      <source src="${src}-web-${videoSize}.mp4" type="video/mp4" />
    `
    video.dataset.size = videoSize
  }
} 

function getVideoSize() {
  const screenSize = getScreenSize()
  switch (screenSize) {
    case 'sm': return 480
    case 'md': return 480
    case 'lg': return 720
    case 'xl': return 1080
    case '2xl': return 1080
  }
}

function getScreenSize() {
  const width = document.documentElement.clientWidth
  if (width <= 768) {
    return 'sm'
  } else if (width <= 992) {
    return 'md'
  } else if (width <= 1280) {
    return 'lg'
  } else if (width <= 1536) {
    return 'xl'
  } else {
    return '2xl'
  }
}

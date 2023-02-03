addEventListener('DOMContentLoaded', loadVideos)
addEventListener('resize', loadVideos)

function loadVideos() {
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

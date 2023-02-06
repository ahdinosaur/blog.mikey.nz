addEventListener('DOMContentLoaded', loadVideos)
addEventListener('resize', loadVideos)

function loadVideos() {
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

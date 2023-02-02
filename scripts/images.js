/* global hexo */

'use strict';

hexo.extend.helper.register('create_img_srcset', (src) => {
  const image_version = hexo.extend.helper.get('image_version').bind(hexo)
  const images_config = hexo.config.responsive_images
  const image_config = Array.isArray(images_config) ? images_config[0] : images_config
  const image_sizes = image_config.sizes
  return Object.entries(image_sizes)
    .map(([size, { width }]) => `${image_version(src, { prefix: size })} ${width}w`)
    .join(', ')
})

hexo.extend.filter.register('after_post_render', (data) => {
  const create_img_srcset = hexo.extend.helper.get('create_img_srcset').bind(hexo)
  data.content = data.content.replace(/<img([^>]+)?>/igm, (_, attr) => {
    attr = attr.replace(/src="([^"]+)?"/, (_, src) => {
      if (!(src.endsWith('jpg') || src.endsWith('jpeg') || src.endsWith('png'))) return `src=${src}`
      return `srcset="${create_img_srcset(src)}"`
    })
    return `<img${attr}>`
  })
})

hexo.extend.filter.register('markdown-it:renderer', function(md) {
  md.use(markdownitWrapImages, {
    wrapClass: 'image-wrapper',
  })
})

function markdownitWrapImages (md, config) {
  config = config || {}

  if (md.renderer.rules.image.name !== 'wrapImageRenderer') {
    var defaultImageRenderer = md.renderer.rules.image
    md.renderer.rules.image = wrapImageRenderer
  }

  function wrapImageRenderer(tokens, idx, options, env, self) {
    const wrapAttrs = `class="${config.wrapClass}"`
    const img = defaultImageRenderer(tokens, idx, options, env, self)
    return `<div ${wrapAttrs}>${img}</div>`
  }
}

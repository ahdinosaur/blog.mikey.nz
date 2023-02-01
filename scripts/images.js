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
      if (src.endsWith('svg')) return `src=${src}`
      return `srcset="${create_img_srcset(src)}"`
    })
    return `<img${attr}>`
  })
})

/* global hexo */

'use strict';

hexo.extend.filter.register('after_post_render', (data) => {
  const image_version = hexo.extend.helper.get('image_version')
  const images_config = hexo.config.responsive_images
  const post_image_config = Array.isArray(images_config) ? images_config[0] : images_config
  const post_image_sizes = post_image_config.sizes
  data.content = data.content.replace(/<img([^>]+)?>/igm, (_, attr) => {
    attr = attr.replace(/src="([^"]+)?"/, (_, src) => {
      const srcset = Object.entries(post_image_sizes)
        .map(([size, { width }]) => `${image_version(src, { prefix: size })} ${width}w`)
        .join(', ')
      return `srcset="${srcset}"`
    })
    return `<img${attr}>`
  })
})

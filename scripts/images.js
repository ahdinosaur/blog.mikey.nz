/* global hexo */

'use strict';

hexo.extend.helper.register('create_responsive_img', (src, attrs) => {
  const image_version = hexo.extend.helper.get('image_version').bind(hexo)
  const images_config = hexo.config.responsive_images
  const image_config = Array.isArray(images_config) ? images_config[0] : images_config
  const image_sizes = image_config.sizes

  const img_srcset = Object.entries(image_sizes)
    .map(([size, { width }]) => `${image_version(src, { prefix: size })} ${width}w`)
    .join(', ')

  const image_sizes_length = Object.keys(image_sizes).length
  const image_widths = Object.values(image_sizes)
  let img_sizes = []
  for (let i = 0; i < image_sizes_length; i++) {
    const { width } = image_widths[i]
    if (i === image_sizes_length - 1) {
      img_sizes.push(`${width}px`)
      continue
    }
    img_sizes.push(`(max-width: ${width}px) ${width}px`)
  }
  img_sizes = img_sizes.join(', ')

  const img_attrs = typeof attrs === 'string' ?
    attrs :
    Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(' ')

  return `<img srcset="${img_srcset}" sizes="${img_sizes}" src="${image_version(src, { prefix: 'lg' })}" ${img_attrs} />`
})

hexo.extend.filter.register('after_post_render', (data) => {
  console.log('data.content', data.content)

  // img
  const create_responsive_img = hexo.extend.helper.get('create_responsive_img').bind(hexo)
  data.content = data.content.replace(/<img([^>]+)?>/igms, (_a, attrs) => {
    const [_b, src] = attrs.match(/src="([^"]+)?"/m)
    const image = (!(src.endsWith('jpg') || src.endsWith('jpeg') || src.endsWith('png')))
      ? `<img${attrs} />`
      : create_responsive_img(src, attrs)
    return `<div class="image-wrapper">${image}</div>`
  })

  // video
  data.content = data.content.replace(/<video([^>]+)?>(.*?)<\/video>/igms, (_, attrs, children) => {
    return `<div class="video-wrapper"><video${attrs}>${children}</video></div>`
  })

  // iframe video embed
  /*
  data.content = data.content.replace(/<iframe class="video"([^>]+)?><\/iframe>/igms, (_, attrs) => {
    return `<div class="video-embed-wrapper"><iframe class="video"${attrs}></iframe></div>`
  })
  */
})

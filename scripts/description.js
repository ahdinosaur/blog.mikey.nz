/* global hexo */

// https://github.com/ALiangLiang/hexo-description/blob/master/index.js

const htmlToText = require('html-to-text')

'use strict';

hexo.extend.filter.register('after_post_render', (data) => {
  if (!data.description && data.excerpt) {
    // Coz data.excerpt is HTML. But we only need pure text.
    var excerpt = data.excerpt
    var description = htmlToText.convert(excerpt, {
      wordwrap: false,
      ignoreHref: true,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', options: { format: 'skip' } },
      ]
    })
    data.description = description
  }
}, 20 /* default priority is 10, some excerpt plugin is use default value. */ )

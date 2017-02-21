const { join } = require('path')
const { readFileSync, writeFile } = require('fs')

const content = JSON.parse(readFileSync(process.argv[2]))

content.db[0].data.posts.forEach(post => {
  const markdown = post.markdown
  const isDraft = post.status === 'draft'
  const filename = isDraft
    ? join(__dirname, 'drafts', post.slug)
    : join(__dirname, post.slug)
  const meta = {
    uuid: post.uuid,
    title: post.title,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    publishedAt: post.published_at,
  }
  writeFile(filename + '.md', markdown)
  writeFile(filename + '.json', JSON.stringify(meta, null, 2))
})

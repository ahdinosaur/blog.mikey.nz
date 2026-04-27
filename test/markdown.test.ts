import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const here = path.dirname(fileURLToPath(import.meta.url))
process.env.POSTS_DIR = path.join(here, 'fixtures', 'posts')

test('renders a representative post end-to-end', async () => {
  const { getPost } = await import('../src/lib/posts')
  const post = await getPost('sample-post')
  assert.ok(post, 'fixture post not loaded')

  const snapshotPath = path.join(here, 'fixtures', 'sample-post.expected.html')
  const actual = post.contentHtml.trimEnd() + '\n'

  if (process.env.UPDATE_SNAPSHOT) {
    await fs.writeFile(snapshotPath, actual)
    return
  }
  const expected = await fs.readFile(snapshotPath, 'utf8')
  assert.equal(actual, expected)
})

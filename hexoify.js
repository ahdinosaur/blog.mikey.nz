const { join } = require('path')
const { readFileSync, writeFileSync } = require('fs')

const name = process.argv[2]

/*

const metaName = name.split('.md')[0] + '.json'

const meta = JSON.parse(readFileSync(metaName))
var content = readFileSync(name)

var frontMatter = 'layout: post\n'

frontMatter += `title: ${meta.title}\n`
frontMatter += `published: ${meta.publishedAt}\n`
frontMatter += `updated: ${meta.updatedAt}\n`

content = frontMatter + '---\n' + content

writeFileSync(name, content)

*/

const content = readFileSync(name, 'utf8').split('\n')
var nextContent = []
var inFront = true

content.forEach(line => {
  if (!inFront) {
    nextContent.push(line)
    return
  }
  if (line === '---') {
    inFront = false
    nextContent.push(line)
    return
  }
  if (line.startsWith('published')) {
    var [_, unixTime] = line.split(':')
    unixTime = unixTime.trim()
    if (unixTime == 'null') {
      date = null
    } else {
      date = new Date(Number(unixTime)).toISOString()
    }
    line = `date: ${date}`
  }
  if (line.startsWith('updated')) {
    var [_, unixTime] = line.split(':')
    unixTime = unixTime.trim()
    if (unixTime == 'null') {
      date = null
    } else {
      date = new Date(Number(unixTime)).toISOString()
    }
    line = `updated: ${date}`
  }
  nextContent.push(line)
})

writeFileSync(name, nextContent.join('\n'))

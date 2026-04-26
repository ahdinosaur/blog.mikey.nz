import { Feed } from 'feed'
import { siteConfig } from '@/lib/config'
import { OG_WIDTH, variantFilename } from '@/lib/images'
import { getAllPosts, ogVariantUrl } from '@/lib/posts'

const BANNER_OG_URL = `/assets/${variantFilename('banner', { kind: 'og', width: OG_WIDTH, format: 'jpeg' })}`

export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const posts = await getAllPosts()
  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.subtitle,
    id: `${siteConfig.url}/`,
    link: `${siteConfig.url}/`,
    language: siteConfig.language,
    image: `${siteConfig.url}${BANNER_OG_URL}`,
    favicon: `${siteConfig.url}${siteConfig.favicon}`,
    copyright: `All rights reserved ${new Date().getUTCFullYear()}, ${siteConfig.author}`,
    feedLinks: {
      atom: `${siteConfig.url}/atom.xml`,
    },
    author: {
      name: siteConfig.author,
      email: siteConfig.authorEmail,
      link: siteConfig.homepage,
    },
  })

  for (const post of posts) {
    const url = `${siteConfig.url}/${post.slug}/`
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description || undefined,
      content: post.contentHtml,
      date: new Date(post.date),
      image: post.image
        ? `${siteConfig.url}${ogVariantUrl(post.image) ?? post.image}`
        : undefined,
      author: [
        {
          name: siteConfig.author,
          email: siteConfig.authorEmail,
          link: siteConfig.homepage,
        },
      ],
    })
  }

  return new Response(feed.atom1(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

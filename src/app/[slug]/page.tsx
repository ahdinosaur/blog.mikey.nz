import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Box, Container, Heading, Text } from '@chakra-ui/react'
import { AppFooter } from '@/components/AppFooter'
import { BackToHome } from '@/components/BackToHome'
import { PostContent, VideoEmbedScript } from '@/components/PostContent'
import { Sharing } from '@/components/Sharing'
import { siteConfig } from '@/lib/config'
import { formatPostDate, getPost, getPostSlugs } from '@/lib/posts'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description || undefined,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description || undefined,
      images: post.image ? [`${siteConfig.url}${post.image}`] : undefined,
      url: `${siteConfig.url}/${post.slug}/`,
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  }
}

export const dynamicParams = false

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <>
      <BackToHome />
      <Container as="main" maxW="mainContent" px="15px">
        <Box as="article" pt="45px" lineHeight={1.7}>
          <Heading
            as="h1"
            margin={0}
            textAlign="center"
            textTransform="capitalize"
            paddingTop="30px"
          >
            {post.title}
          </Heading>
          <Box mt="3" textAlign="center">
            <Text
              as="span"
              textTransform="uppercase"
              letterSpacing="2px"
              color="brand.accent"
            >
              {formatPostDate(post.date, { withDay: true })}
            </Text>
          </Box>
          <Box mt="75px">
            <PostContent html={post.contentHtml} />
          </Box>
        </Box>
        <Sharing />
      </Container>
      <AppFooter />
      <VideoEmbedScript />
    </>
  )
}

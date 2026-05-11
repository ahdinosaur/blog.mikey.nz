import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react'
import { AppFooter } from '@/components/AppFooter'
import { AppHeader } from '@/components/AppHeader'
import { AppNav } from '@/components/AppNav'
import { PostContent, VideoEmbedScript } from '@/components/PostContent'
import { ResponsivePicture } from '@/components/ResponsivePicture'
import { RouteLink } from '@/components/RouteLink'
import { formatPostDate, getPostList } from '@/lib/posts'

export default async function HomePage() {
  const posts = await getPostList()

  return (
    <>
      <AppNav activePath="/" />
      <AppHeader />
      <Container as="main" maxW="mainContent" px={4}>
        {posts.map((post) => (
          <Box as="article" key={post.slug} mt={11}>
            <Heading
              as="h2"
              margin={0}
              paddingTop={8}
              textTransform="capitalize"
            >
              <RouteLink href={`/${post.slug}`}>{post.title}</RouteLink>
            </Heading>

            {post.excerptHtml && (
              <Box pt={4} pb={8}>
                <PostContent html={post.excerptHtml} />
              </Box>
            )}

            {post.image && (
              <Flex justify="center" align="center" my="1em">
                <ResponsivePicture
                  src={post.image}
                  alt={post.title}
                  imgStyle={{
                    display: 'block',
                    objectFit: 'contain',
                    width: 'auto',
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '33.33vh',
                  }}
                />
              </Flex>
            )}

            <Box>
              <Text as="span" color="brand.accent">
                {formatPostDate(post.date)}
              </Text>
            </Box>
          </Box>
        ))}
      </Container>
      <AppFooter />
      <VideoEmbedScript />
    </>
  )
}

import { Box, Container, Flex, Heading, Image, Text } from '@chakra-ui/react'
import { AppFooter } from '@/components/AppFooter'
import { AppHeader } from '@/components/AppHeader'
import { AppNav } from '@/components/AppNav'
import { PostContent, VideoEmbedScript } from '@/components/PostContent'
import { RouteLink } from '@/components/RouteLink'
import { formatPostDate, getPostList } from '@/lib/posts'

export default async function HomePage() {
  const posts = await getPostList()

  return (
    <>
      <AppNav activePath="/" />
      <AppHeader />
      <Container as="main" maxW="mainContent" px="15px">
        {posts.map((post) => (
          <Box as="article" key={post.slug} mt="45px">
            <Heading
              as="h1"
              margin={0}
              paddingTop="30px"
              textTransform="capitalize"
            >
              <RouteLink href={`/${post.slug}`}>{post.title}</RouteLink>
            </Heading>

            {post.excerptHtml && (
              <Box pt="15px" pb="30px">
                <PostContent html={post.excerptHtml} />
              </Box>
            )}

            {post.image && (
              <Flex justify="center" align="center" my="1em">
                <Box className="thumbnail">
                  <Image
                    src={post.image}
                    alt={post.title}
                    objectFit="contain"
                    width="auto"
                    maxW="100%"
                    height="auto"
                    maxH="33.33vh"
                    loading="lazy"
                  />
                </Box>
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

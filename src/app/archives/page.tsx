import type { Metadata } from 'next'
import { Box, Container, Flex, Heading, Text, VisuallyHidden } from '@chakra-ui/react'
import { AppFooter } from '@/components/AppFooter'
import { AppNav } from '@/components/AppNav'
import { RouteLink } from '@/components/RouteLink'
import { formatPostDate, getPostList } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Archive',
}

export default async function ArchivePage() {
  const posts = await getPostList()

  return (
    <>
      <AppNav activePath="/archives" />
      <Container as="main" maxW="archiveContent" pt={24} px={4}>
        <VisuallyHidden as="h1">Archive</VisuallyHidden>
        {posts.map((post) => (
          <Flex
            as="article"
            key={post.slug}
            mt={8}
            align="center"
          >
            <Heading
              as="h2"
              flex={1}
              margin={0}
              fontSize="1.2rem"
              textTransform="capitalize"
            >
              <RouteLink href={`/${post.slug}`}>{post.title}</RouteLink>
            </Heading>
            <Box pl={8}>
              <Text as="span" color="brand.accent">
                {formatPostDate(post.date)}
              </Text>
            </Box>
          </Flex>
        ))}
      </Container>
      <AppFooter />
    </>
  )
}

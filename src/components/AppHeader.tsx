import { Box, Flex, Heading, Image, Link, Text } from '@chakra-ui/react'
import { siteConfig } from '@/lib/config'

export function AppHeader() {
  return (
    <Flex as="header" direction="column" align="center" textAlign="center">
      <Image
        src={siteConfig.banner}
        alt="banner"
        width="100%"
        height="50vh"
        objectFit="cover"
      />
      <Flex direction="column" align="center" width="100%">
        <Box mt="-50px">
          <Link href={siteConfig.homepage} display="block">
            <Image
              src={siteConfig.avatar}
              alt="avatar"
              width="100px"
              height="100px"
              borderRadius="50%"
              borderWidth="4px"
              borderStyle="solid"
              borderColor="brand.avatarBorder"
            />
          </Link>
        </Box>
        <Heading
          as="h1"
          fontSize="1.875rem"
          fontWeight={600}
          letterSpacing="1px"
          color="brand.title"
          margin={0}
          padding="15px"
        >
          {siteConfig.title}
        </Heading>
        <Heading
          as="h3"
          fontSize="0.9rem"
          fontWeight="normal"
          letterSpacing="1px"
          color="brand.accent"
          margin={0}
          paddingBottom="15px"
        >
          {siteConfig.subtitle}
        </Heading>
      </Flex>

      <Flex
        as="ul"
        listStyleType="none"
        margin={0}
        marginTop="15px"
        padding={0}
        wrap="wrap"
        justify="center"
      >
        <Box as="li" display="inline">
          <Link href={siteConfig.homepage} px={3} py={2} color="brand.anchor">
            Website
          </Link>
        </Box>
        {Object.entries(siteConfig.social).map(([label, href]) => (
          <Box as="li" display="inline" key={label}>
            <Link href={href} px={3} py={2} color="brand.anchor">
              {label}
            </Link>
          </Box>
        ))}
      </Flex>
    </Flex>
  )
}

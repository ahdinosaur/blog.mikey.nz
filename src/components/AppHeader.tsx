import { Box, Flex, Heading, Link } from '@chakra-ui/react'
import { ResponsivePicture } from '@/components/ResponsivePicture'
import { siteConfig } from '@/lib/config'

export function AppHeader() {
  return (
    <Flex as="header" direction="column" align="center" textAlign="center">
      <ResponsivePicture
        src={siteConfig.banner}
        alt="banner"
        loading="eager"
        fetchPriority="high"
        style={{ display: 'block', width: '100%', lineHeight: 0 }}
        imgStyle={{
          display: 'block',
          width: '100%',
          height: '50vh',
          objectFit: 'cover',
        }}
      />
      <Flex direction="column" align="center" width="100%">
        <Box mt={-12}>
          <Link
            href={siteConfig.homepage}
            display="block"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ResponsivePicture
              src={siteConfig.avatar}
              alt="avatar"
              loading="eager"
              imgStyle={{
                display: 'block',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '4px solid #ffffff',
                objectFit: 'cover',
              }}
            />
          </Link>
        </Box>
        <Heading
          as="h1"
          fontSize="1.875rem"
          fontWeight={600}
          letterSpacing="wide"
          color="brand.title"
          margin={0}
          padding={4}
        >
          {siteConfig.title}
        </Heading>
        <Heading
          as="h3"
          fontSize="0.9rem"
          fontWeight="normal"
          letterSpacing="wider"
          color="brand.accent"
          margin={0}
          paddingBottom={4}
        >
          {siteConfig.subtitle}
        </Heading>
      </Flex>

      <Flex
        as="ul"
        listStyleType="none"
        margin={0}
        marginTop={4}
        padding={0}
        wrap="wrap"
        justify="center"
      >
        <Box as="li" display="inline">
          <Link
            href={siteConfig.homepage}
            px={3}
            py={2}
            color="brand.anchor"
            target="_blank"
            rel="noopener noreferrer"
          >
            Website
          </Link>
        </Box>
        {Object.entries(siteConfig.social).map(([label, href]) => (
          <Box as="li" display="inline" key={label}>
            <Link
              href={href}
              px={3}
              py={2}
              color="brand.anchor"
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </Link>
          </Box>
        ))}
      </Flex>
    </Flex>
  )
}

import { Box, Flex, Text } from '@chakra-ui/react'
import { ResponsivePicture } from '@/components/ResponsivePicture'
import { RouteLink } from '@/components/RouteLink'
import { siteConfig } from '@/lib/config'

export function Sharing() {
  return (
    <Flex
      className="sharing"
      align="center"
      gap={4}
      mt={24}
      mb={24}
      py={4}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="brand.sharingBorder"
    >
      <Flex align="center" gap={3} flex={1}>
        <RouteLink href="/">
          <ResponsivePicture
            src={siteConfig.avatar}
            alt="avatar"
            imgStyle={{
              display: 'block',
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              padding: '1rem',
              boxSizing: 'content-box',
              objectFit: 'cover',
            }}
          />
        </RouteLink>
        <Box flex={1}>
          <RouteLink href="/">
            <Text fontStyle="italic" fontSize="1rem" margin={0}>
              {siteConfig.title}
            </Text>
          </RouteLink>
          <Text
            fontSize="0.8rem"
            fontStyle="italic"
            color="brand.sharingSubtitle"
            margin={0}
            paddingY={1.5}
          >
            {siteConfig.subtitle}
          </Text>
        </Box>
      </Flex>
      <Box>
        <Text
          margin={4}
          color="brand.accent"
          fontStyle="italic"
          textTransform="capitalize"
        >
          share if you like~
        </Text>
      </Box>
    </Flex>
  )
}

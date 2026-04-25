import { Box, Flex, Image, Link, Text } from '@chakra-ui/react'
import { siteConfig } from '@/lib/config'

export function Sharing() {
  return (
    <Flex
      className="sharing"
      align="center"
      gap={4}
      mt="90px"
      mb="90px"
      py="15px"
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="brand.sharingBorder"
    >
      <Flex align="center" gap={3} flex={1}>
        <Link href="/">
          <Image
            src={siteConfig.avatar}
            alt="avatar"
            width="70px"
            height="70px"
            borderRadius="50%"
            padding="15px"
          />
        </Link>
        <Box flex={1}>
          <Link href="/">
            <Text fontStyle="italic" fontSize="1rem" margin={0}>
              {siteConfig.title}
            </Text>
          </Link>
          <Text
            fontSize="0.8rem"
            fontStyle="italic"
            color="brand.sharingSubtitle"
            margin={0}
            paddingY="5px"
          >
            {siteConfig.subtitle}
          </Text>
        </Box>
      </Flex>
      <Box>
        <Text
          margin="15px"
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

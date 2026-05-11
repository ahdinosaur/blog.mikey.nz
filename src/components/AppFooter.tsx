import { Box, Text } from '@chakra-ui/react'
import { siteConfig } from '@/lib/config'

export function AppFooter() {
  const year = new Date().getUTCFullYear()
  return (
    <Box
      as="footer"
      mt={11}
      px={4}
      py={4}
      minH={20}
      textAlign="center"
      color="brand.footerFg"
      fontSize="0.9rem"
      backgroundColor="brand.footerBg"
    >
      <Text margin={0} padding={1} fontStyle="italic">
        © {year} {siteConfig.author}
      </Text>
    </Box>
  )
}

import { Box, Text } from '@chakra-ui/react'
import { siteConfig } from '@/lib/config'

export function AppFooter() {
  const year = new Date().getUTCFullYear()
  return (
    <Box
      as="footer"
      mt="45px"
      px="15px"
      py="15px"
      minH="80px"
      textAlign="center"
      color="brand.footerFg"
      fontSize="0.9rem"
      backgroundColor="brand.footerBg"
    >
      <Text margin={0} padding="3px" fontStyle="italic">
        © {year} {siteConfig.author}
      </Text>
    </Box>
  )
}

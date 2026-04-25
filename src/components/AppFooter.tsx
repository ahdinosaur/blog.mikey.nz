import { Box, Link, Text } from '@chakra-ui/react'

export function AppFooter() {
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
        Powered by{' '}
        <Link href="https://nextjs.org" color="brand.footerFg">
          Next.js
        </Link>{' '}
        and{' '}
        <Link href="https://chakra-ui.com" color="brand.footerFg">
          Chakra UI
        </Link>
      </Text>
    </Box>
  )
}

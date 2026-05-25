import { RouteLink } from '@/components/RouteLink'

export function BackToHome() {
  return (
    <RouteLink
      href="/"
      title="Back to home"
      position="absolute"
      top={0}
      right={0}
      m={4}
      px={3}
      py={2}
      backgroundColor="brand.anchor"
      color="white"
      textAlign="center"
      fontSize="0.9rem"
      zIndex={2}
    >
      Home
    </RouteLink>
  )
}

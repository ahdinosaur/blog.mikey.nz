import { RouteLink } from '@/components/RouteLink'

export function BackToHome() {
  return (
    <RouteLink
      href="/"
      title="Back to home"
      position="absolute"
      top={0}
      right={0}
      m="15px"
      px="12px"
      py="8px"
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

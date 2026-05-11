import { Box, HStack } from '@chakra-ui/react'
import { RouteLink } from '@/components/RouteLink'

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'home', href: '/' },
  { label: 'archive', href: '/archives' },
  { label: 'rss', href: '/atom.xml' },
]

export function AppNav({ activePath }: { activePath: string }) {
  return (
    <Box as="nav" position="absolute" top={0} right={0} m={4} zIndex={2}>
      <HStack gap={1}>
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = activePath === href
          return (
            <RouteLink
              key={href}
              href={href}
              px={2.5}
              py={1.5}
              textTransform="capitalize"
              color={isActive ? 'white' : 'brand.anchor'}
              backgroundColor={isActive ? 'brand.anchor' : 'brand.bg'}
              borderWidth={isActive ? '1px' : 0}
              borderColor="brand.bg"
              fontSize="0.95rem"
            >
              {label}
            </RouteLink>
          )
        })}
      </HStack>
    </Box>
  )
}

'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { system } from '@/lib/theme'
import { EmotionRegistry } from './emotion-registry'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </EmotionRegistry>
  )
}

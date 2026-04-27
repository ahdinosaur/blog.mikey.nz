import type { Metadata } from 'next'
import Script from 'next/script'
import path from 'node:path'
import { ReactNode } from 'react'
import { siteConfig } from '@/lib/config'
import {
  OG_WIDTH,
  enumerateFaviconVariants,
  variantFilename,
} from '@/lib/images'
import { Providers } from './providers'

const FAVICON_SOURCE = path.join(process.cwd(), 'src', 'assets', 'favicon.png')
const BANNER_OG_URL = `/assets/${variantFilename('banner', { kind: 'og', width: OG_WIDTH, format: 'jpeg' })}`

export async function generateMetadata(): Promise<Metadata> {
  const faviconSizes = await enumerateFaviconVariants(FAVICON_SOURCE)
  const iconLinks = faviconSizes.map((size) => ({
    url: `/assets/${variantFilename('favicon', { kind: 'favicon', size, format: 'png' })}`,
    sizes: `${size}x${size}`,
    type: 'image/png',
  }))
  const appleIcon = faviconSizes.includes(180)
    ? {
        url: `/assets/${variantFilename('favicon', { kind: 'favicon', size: 180, format: 'png' })}`,
        sizes: '180x180',
        type: 'image/png',
      }
    : undefined

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.title}`,
    },
    description: siteConfig.description,
    icons: {
      icon: iconLinks,
      apple: appleIcon,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      siteName: siteConfig.title,
      title: siteConfig.title,
      description: siteConfig.subtitle,
      images: [BANNER_OG_URL],
    },
    alternates: {
      types: {
        'application/atom+xml': '/atom.xml',
      },
    },
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Script id="matomo" strategy="afterInteractive">
          {`var _paq=window._paq=window._paq||[];_paq.push(['trackPageView']);_paq.push(['enableLinkTracking']);(function(){var u='${siteConfig.matomo.url}/';_paq.push(['setTrackerUrl',u+'matomo.php']);_paq.push(['setSiteId','${siteConfig.matomo.siteId}']);var d=document,g=d.createElement('script'),s=d.getElementsByTagName('script')[0];g.async=true;g.src=u+'matomo.js';s.parentNode.insertBefore(g,s);})();`}
        </Script>
      </body>
    </html>
  )
}

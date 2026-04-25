import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { siteConfig } from '@/lib/config'
import { Providers } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  icons: {
    icon: siteConfig.favicon,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.subtitle,
    images: [siteConfig.banner],
  },
  alternates: {
    types: {
      'application/atom+xml': '/atom.xml',
    },
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <head>
        {siteConfig.matomo && (
          <script
            dangerouslySetInnerHTML={{
              __html: `var _paq=window._paq=window._paq||[];_paq.push(['trackPageView']);_paq.push(['enableLinkTracking']);(function(){var u='${siteConfig.matomo.url}/';_paq.push(['setTrackerUrl',u+'matomo.php']);_paq.push(['setSiteId','${siteConfig.matomo.siteId}']);var d=document,g=d.createElement('script'),s=d.getElementsByTagName('script')[0];g.async=true;g.src=u+'matomo.js';s.parentNode.insertBefore(g,s);})();`,
            }}
          />
        )}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

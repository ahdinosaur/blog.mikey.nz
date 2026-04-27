import Script from 'next/script'

export function MatomoScript({ url, siteId }: { url: string; siteId: string }) {
  return (
    <Script id="matomo" strategy="afterInteractive">
      {`
        var _paq = (window._paq = window._paq || [])
        _paq.push(['trackPageView'])
        _paq.push(['enableLinkTracking'])
        ;(function () {
          var u = ${JSON.stringify(`${url}/`)}
          _paq.push(['setTrackerUrl', u + 'matomo.php'])
          _paq.push(['setSiteId', ${JSON.stringify(siteId)}])
          var d = document
          var g = d.createElement('script')
          var s = d.getElementsByTagName('script')[0]
          g.async = true
          g.src = u + 'matomo.js'
          s.parentNode.insertBefore(g, s)
        })()
      `}
    </Script>
  )
}

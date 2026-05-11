import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const systemFontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
const monoFontStack =
  'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

const config = defineConfig({
  cssVarsPrefix: 'mikey',
  globalCss: {
    'html, body': {
      height: '100%',
      width: '100%',
    },
    html: {
      fontSize: '16px',
      backgroundColor: 'bg.canvas',
      color: 'fg.body',
    },
    body: {
      margin: 0,
      fontFamily: 'body',
    },
    a: {
      textDecoration: 'none',
      color: 'inherit',
    },
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: 'heading',
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          bg: { value: '#f4f0fb' },
          text: { value: '#003333' },
          title: { value: '#004c4c' },
          accent: { value: '#EB298C' },
          anchor: { value: '#49386d' },
          footerBg: { value: '#f4f0fb' },
          footerFg: { value: '#666666' },
          quote: { value: '#595959' },
          quoteBorder: { value: '#aaaaaa' },
          codeBg: { value: 'rgba(0,0,0,0.07)' },
          codeBlockBg: { value: '#2d2d2d' },
          codeBlockFg: { value: '#cccccc' },
          sharingBorder: { value: '#dddddd' },
          sharingSubtitle: { value: '#999999' },
          avatarBorder: { value: '#ffffff' },
          tableBorder: { value: '#cccccc' },
          tableCellBorder: { value: '#dddddd' },
          tableRowBg: { value: '#ffffff' },
        },
      },
      fonts: {
        body: { value: systemFontStack },
        heading: { value: systemFontStack },
        mono: { value: monoFontStack },
      },
      sizes: {
        mainContent: { value: '992px' },
        archiveContent: { value: '500px' },
        avatar: { value: '100px' },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          canvas: { value: '{colors.brand.bg}' },
        },
        fg: {
          body: { value: '{colors.brand.text}' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

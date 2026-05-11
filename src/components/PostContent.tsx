import { Box, BoxProps } from '@chakra-ui/react'

const sx = {
  lineHeight: 1.7,
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    fontFamily: 'heading',
    marginBottom: '1rem',
  },
  '& > h2': { marginTop: '3rem' },
  '& > h3': { marginTop: '2rem' },
  '& > h4': { marginTop: '1.5rem' },
  '& a': { color: 'brand.anchor' },
  '& a.header-anchor': {
    marginLeft: '0.5rem',
    display: 'none',
  },
  '& > h1:hover .header-anchor, & > h2:hover .header-anchor, & > h3:hover .header-anchor, & > h4:hover .header-anchor, & > h5:hover .header-anchor, & > h6:hover .header-anchor':
    {
      display: 'inline',
    },
  '& .visually-hidden': {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  '& p': {
    marginBottom: '1rem',
  },
  '& ul, & ol': {
    paddingLeft: '1.5rem',
    marginBottom: '1rem',
  },
  '& li': {
    marginBottom: '0.25rem',
  },
  '& code': {
    fontFamily: 'mono',
    background: 'brand.codeBg',
    color: 'brand.accent',
    padding: '0.125rem 0.25rem',
    borderRadius: '0.125rem',
  },
  '& pre': {
    fontFamily: 'mono',
    background: 'brand.codeBlockBg',
    color: 'brand.codeBlockFg',
    margin: '1.6rem 0',
    padding: '3rem 1.8rem',
    borderTopWidth: '1px',
    borderBottomWidth: '1px',
    borderColor: 'brand.codeBlockBg',
    overflow: 'auto',
    lineHeight: '1.25rem',
  },
  '& pre code': {
    background: 'none',
    color: 'inherit',
    padding: 0,
    textShadow: 'none',
  },
  '& blockquote': {
    color: 'brand.quote',
    margin: '2.5rem 1rem',
    padding: '0 0 0 2rem',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'brand.quoteBorder',
  },
  '& blockquote p': {
    margin: 0,
  },
  '& table': {
    margin: '1rem 0',
    borderCollapse: 'collapse',
  },
  '& tr': {
    borderTopWidth: '1px',
    borderColor: 'brand.tableBorder',
    backgroundColor: 'brand.tableRowBg',
  },
  '& th, & td': {
    borderWidth: '1px',
    borderColor: 'brand.tableCellBorder',
    padding: '0.375rem 0.75rem',
  },
  '& .image-wrapper, & .video-wrapper, & .video-embed': {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1em',
    marginBottom: '1em',
  },
  '& .image-wrapper img, & .video-wrapper video, & .video-embed iframe': {
    objectFit: 'contain',
    width: 'auto',
    maxWidth: '100%',
    height: 'auto',
    maxHeight: '66.66vh',
  },
  '& .video-embed': {
    position: 'relative',
  },
  '& .video-embed[data-ratio="16:9"]': {
    paddingTop: '56.25%',
  },
  '& .video-embed[data-ratio="16:9"] iframe': {
    maxHeight: 'unset',
  },
  '& .video-embed[data-ratio="9:16"], & .video-embed[data-ratio="2:3"]': {
    height: '66.66vh',
  },
  '& .video-embed iframe': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  '& details': {
    margin: '1rem 0',
    padding: '0.5rem 1rem',
    borderWidth: '1px',
    borderColor: 'brand.sharingBorder',
  },
  '& summary': {
    cursor: 'pointer',
    fontWeight: 600,
  },
  '& hr': {
    margin: '2rem 0',
    borderTopWidth: '1px',
    borderColor: 'brand.sharingBorder',
  },
} as const

export function PostContent({
  html,
  className,
  ...rest
}: { html: string; className?: string } & Omit<BoxProps, 'children'>) {
  return (
    <Box
      className={className ?? 'article-entry'}
      css={sx}
      // Trusted: html is produced by our remark/rehype pipeline in src/lib/markdown.ts.
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  )
}

export { VideoEmbedHydrator as VideoEmbedScript } from './VideoEmbedHydrator'

declare module 'markdown-it-attrs' {
  import type { PluginWithOptions } from 'markdown-it'
  const plugin: PluginWithOptions<{
    leftDelimiter?: string
    rightDelimiter?: string
    allowedAttributes?: Array<string | RegExp>
  }>
  export default plugin
}

declare module 'markdown-it-emoji' {
  import type { PluginWithOptions } from 'markdown-it'
  type Options = {
    defs?: Record<string, string>
    enabled?: string[]
    shortcuts?: Record<string, string | string[]>
  }
  export const full: PluginWithOptions<Options>
  export const light: PluginWithOptions<Options>
  export const bare: PluginWithOptions<Options>
}

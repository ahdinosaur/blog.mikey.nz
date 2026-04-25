export const siteConfig = {
  title: 'Life as a solarpunk hacker',
  subtitle: 'Patterns of consciousness in a sea of matter',
  description: 'A personal blog exploring life as a solarpunk hacker.',
  author: 'Mikey (@ahdinosaur)',
  authorEmail: 'mikey@mikey.nz',
  language: 'en',
  url: 'https://blog.mikey.nz',
  homepage: 'https://mikey.nz',
  favicon: '/images/favicon.ico',
  avatar: '/images/avatar.jpg',
  banner: '/images/banner.jpg',
  social: {
    GitHub: 'https://github.com/ahdinosaur',
    Mastodon: 'https://cloudisland.nz/@dinosaur',
    Bluesky: 'https://bsky.app/profile/mikey.nz',
    Scuttlebutt: 'https://dinosaur.butt.nz/',
  } as Record<string, string>,
  matomo: {
    url: 'https://analytics.mikey.nz',
    siteId: '11',
  },
} as const

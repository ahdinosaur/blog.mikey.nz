---
title: First look at Blinksy
date: 2025-05-02 09:49:15
tags:
---

As a continuation of my LED pixels journey, I made [Blinksy](https://github.com/ahdinosaur/blinksy)

> A Rust no-std no-alloc LED control library for 1D, 2D, and 3D layouts

## Backstory

Using my learnings from personal journey with LED pixels:

- [PIXELS FOR THE PIXEL GOD](https://blog.mikey.nz/pixels-for-the-pixel-god/)
- [A Burn Dance](https://blog.mikey.nz/a-burn-dance/)
- [Polyledra V1: LED Tetrahedron](https://blog.mikey.nz/polyledra-v1-led-tetrahedron/)
- [Polyledra V2: LED Tensegrity](https://blog.mikey.nz/polyledra-v2-led-tensegrity/)

And new learnings with [advanced generics for no-std no-alloc embedded Rust](https://blog.mikey.nz/how-to-dance-with-embedded-rust-generics/),

I wanted to make a LED control library that could do the following:

- Like [FastLED](https://fastled.io/), support all the most common LED pixel chipsets such as WS2812, APA1012, and more.
- Like [WLED](https://kno.wled.ge), have a library of beautiful visual patterns.
- Unlike anything before, support not just strips and grids, but any 1D, 2D, or even 3D layout.

To understand what I mean about 3D layouts, look back at my [LED tetrahedron](https://blog.mikey.nz/polyledra-v1-led-tetrahedron/):

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796157718?h=008898648a&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-10-02) Polyledra v1: Demo"></div>

Each pixel has a position in 3D space. Unlike most 2D or 3D projection mappings, which take a 2D raster (pixels from an image or video) and project onto a 2D or 3D surface, the LED tetrahedron is more like a graphics shader, where for each pixel (which has a 3D position), and given the current time, you calculate the color. So we aren't mapping 2D pixels onto a 3D surface, we're directly calculating the animation for each pixel in 3D space.

As a comparison, we can look at my next project, an [LED tensegrity](https://blog.mikey.nz/polyledra-v2-led-tensegrity/).

In this case, I used [WLED](https://kno.wled.ge), which at the time only supported multiple segments of 1D strips, now supports 2D grids. I made a segments for every strut of the tensegrity.

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544673?h=de776782f6&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2021-01-31) Polyledra v2: Kiwiburn"></div>

In another example, we can see people who are using [WLED](https://kno.wled.ge) to make 3D cubes. By mapping the faces of the cube onto 2D grids, like so

It's possible to approximate a 3D surface. However, there will always be seams, where the 2D mapping can't match the 3D.

That is all to say, animating 3D pixels directly is way cool, and I want to see more of this, so I used what I've learned in Rust to make [Blinksy](https://github.com/ahdinosaur/blinksy).

## Blinksy

1. Setup your LED layout
2. Setup your LED driver
3. Choose a pattern from the library, or create your own

## But what about 3d?

Yeah I haven't actually implemented 3D, because I wanted to ship Blinksy.

The architecture is ready, stay tuned.

If you want to support the project, please:

- Star the project on GitHub: [ahdinosaur/blinksy](https://github.com/ahdinosaur/blinksy)
- Subscribe to me on YouTube, where I'll start sharing me live-coding the future of Blinksy
- Sponsor me on GitHub: [@ahdinosaur]()

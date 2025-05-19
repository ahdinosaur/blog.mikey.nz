---
title: Using Blinksy To Animate a 3D Cube
date: 2025-05-19 11:38:00
tags:
---

As a continuation of my LED pixels journey, I made [Blinksy](https://github.com/ahdinosaur/blinksy):

> A Rust no-std no-alloc LED control library for 1D, 2D, and 3D layouts

## Backstory

This post is a continuation from ["First Look At Blinksy"](/first-look-at-blinksy):

> Using my learnings from personal journey with LED pixels:
>
> - [PIXELS FOR THE PIXEL GOD](/pixels-for-the-pixel-god/)
> - [A Burn Dance](/a-burn-dance/)
> - [Polyledra V1: LED Tetrahedron](/polyledra-v1-led-tetrahedron/)
> - [Polyledra V2: LED Tensegrity](/polyledra-v2-led-tensegrity/)
>
> And new learnings with [advanced generics for no-std no-alloc embedded Rust](/how-to-dance-with-embedded-rust-generics/),
>
> I wanted to make a LED control library that could do the following:
>
> - Like [FastLED](https://fastled.io/), support all the most common LED pixel chipsets such as WS2812, APA1012, and more.
> - Like [WLED](https://kno.wled.ge), have a library of beautiful visual patterns.
> - Unlike anything before, support not just strips and grids, but any 1D, 2D, or even 3D layout.

Now focused on 3D layouts and animation.

### 3D Tetrahedron

To understand what I mean about 3D layouts, look back at my [LED tetrahedron](/polyledra-v1-led-tetrahedron/):

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796157718?h=008898648a&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-10-02) Polyledra v1: Demo"></div>

Each pixel has a position in 3D space. Unlike most 2D or 3D projection mappings, which take a 2D raster (pixels from an image or video) and project onto a 2D or 3D surface, the LED tetrahedron is more like a graphics shader, where for each pixel (which has a 3D position), and given the current time, you calculate the color. So we aren't mapping 2D pixels onto a 3D surface, we're directly calculating the animation for each pixel in 3D space.

### 1D to 3D Tensegrity

As a comparison, we can look at my next project, an [LED tensegrity](/polyledra-v2-led-tensegrity/).

In this case, I used [WLED](https://kno.wled.ge), which at the time only supported multiple 1D segments of 1D strips, now supports 2D grids. I made a 1D segment for every strut of the tensegrity.

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544673?h=de776782f6&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2021-01-31) Polyledra v2: Kiwiburn"></div>

While this still looks good, it's missing the same spatial feel, each strut more or less looks the same.

### 2D to 3D Cube

In another example, we can see people who are using [WLED](https://kno.wled.ge) to make 3D cubes.

<blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="546"><a href="https://www.reddit.com/r/WLED/comments/1e5fji2/wled_16x16_cube/">WLED 16x16 Cube</a><br> by<a href="https://www.reddit.com/user/SkirtPuzzleheaded586/">u/SkirtPuzzleheaded586</a> in<a href="https://www.reddit.com/r/WLED/">WLED</a></blockquote><script async="" src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>

By mapping the faces of the cube onto 2D grids, like so:

<a href="https://www.reddit.com/r/WLED/comments/1e5fji2/comment/ldmyza8/">
  <img src="/using-blinksy-to-animate-a-3d-cube/wled-cube-mapping.webp" alt="WLED cube mapping" style="max-height: min(400px, 66.66dvh);" />
</a>

It's possible to approximate a 3D cube. However, we can see from the faces of the cube in 2D, this means the 3D mapping will have discontinuous seams.

Again, no question this looks good, but can it be better?

### 2D to 3D Sphere

As a final example, we see someone building a replica of the Las Vegas MSG Sphere.

<iframe width="853" height="480" src="//www.youtube-nocookie.com/embed/_ZtewjbFXoA?start=416" frameborder="0" allowfullscreen></iframe>

Without a doubt, this is incredible.

Earlier in the video, a "problem" with spherical displays:

> If we just fold a matrix around a ball, we'd have a bunch of pixels bunched together at the top and bottom.
>
> But at the equator, the pixels would be too spread out.

<iframe width="853" height="480" src="//www.youtube-nocookie.com/embed/_ZtewjbFXoA?start=42" frameborder="0" allowfullscreen></iframe>

While this is true that in the naive sphere design, the spacing between pixels will be variable, this is only an issue because their goal is to map a 2d matrix onto a 3d surface.

So even in the best mappings, these are still 2D screens wrapped around a 3D surface, which means limitations.

What if we animated the pixels using a 3D-native approach?

## Blinksy


## Contributing

If you want to help, the best thing to do is use Blinksy for your own LED project, and share about your adventures.

If you want to contribute code, please:

- Help port a visual pattern from FastLED or WLED to Blinksy
- Write your own visual pattern
- Help support a new LED chipset

If you want to otherwise support the project, please:

- Star the project on GitHub: [ahdinosaur/blinksy](https://github.com/ahdinosaur/blinksy)
- Subscribe to me on YouTube, where I want to start live-coding the future of Blinksy
- Sponsor me on GitHub: [@ahdinosaur]()

Thanks for giving me your attention. Have a good one.

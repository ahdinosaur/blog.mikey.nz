---
title: First look at Blinksy
date: 2025-05-02 09:49:15
tags:
---

As a continuation of my LED pixels journey, I made [Blinksy](https://github.com/ahdinosaur/blinksy):

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

### 3D Tetrahedron

To understand what I mean about 3D layouts, look back at my [LED tetrahedron](https://blog.mikey.nz/polyledra-v1-led-tetrahedron/):

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796157718?h=008898648a&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-10-02) Polyledra v1: Demo"></div>

Each pixel has a position in 3D space. Unlike most 2D or 3D projection mappings, which take a 2D raster (pixels from an image or video) and project onto a 2D or 3D surface, the LED tetrahedron is more like a graphics shader, where for each pixel (which has a 3D position), and given the current time, you calculate the color. So we aren't mapping 2D pixels onto a 3D surface, we're directly calculating the animation for each pixel in 3D space.

### 1D to 3D Tensegrity

As a comparison, we can look at my next project, an [LED tensegrity](https://blog.mikey.nz/polyledra-v2-led-tensegrity/).

In this case, I used [WLED](https://kno.wled.ge), which at the time only supported multiple 1D segments of 1D strips, now supports 2D grids. I made a 1D segment for every strut of the tensegrity.

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544673?h=de776782f6&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2021-01-31) Polyledra v2: Kiwiburn"></div>

While this still looks good, it's missing the same spatial feel, each strut more or less looks the same.

### 2D to 3D Cube

In another example, we can see people who are using [WLED](https://kno.wled.ge) to make 3D cubes.

<blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="546"><a href="https://www.reddit.com/r/WLED/comments/1e5fji2/wled_16x16_cube/">WLED 16x16 Cube</a><br> by<a href="https://www.reddit.com/user/SkirtPuzzleheaded586/">u/SkirtPuzzleheaded586</a> in<a href="https://www.reddit.com/r/WLED/">WLED</a></blockquote><script async="" src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>

By mapping the faces of the cube onto 2D grids, like so:

<a href="https://www.reddit.com/r/WLED/comments/1e5fji2/comment/ldmyza8/">
  <img src="/first-look-at-blinksy/wled-cube-mapping.webp" alt="WLED cube mapping" style="max-height: min(400px, 66.66dvh);" />
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

Blinksy is my LED control library for 1D, 2D, and especially 3D layouts.

### Examples

#### 1d

#### 2d

#### 3d

## How to get started with Blinksy

1. [Define your LED layout](#define-your-led-layout)
2. [Create your visual pattern](#create-your-visual-pattern)
3. [Setup your LED driver](#setup-your-led-driver)

### Define your LED layout

First you define the arrangement of your LEDs in space, with a struct that implements either the [`Layout1d`](https://docs.rs/blinksy/0.1.0/blinksy/layout/trait.Layout1d.html), [`Layout2d`](https://docs.rs/blinksy/0.1.0/blinksy/layout/trait.Layout2d.html), or [`Layout3d`](https://docs.rs/blinksy/0.1.0/blinksy/layout/trait.Layout13d.html) traits. To make this easy, we use either the [`layout1d`](https://docs.rs/blinksy/0.1.0/blinksy/macro.layout1d.html), [`layout2d`](https://docs.rs/blinksy/0.1.0/blinksy/macro.layout2d.html), or [`layout3d`](https://docs.rs/blinksy/0.1.0/blinksy/macro.layout3d.html) macro, respectively.

These traits provide a `PIXEL_COUNT` constant, which is the number of LEDs, and a `.points()` method, which maps each LED pixel into a 1D, 2D, or 3D space between -1.0 and 1.0.

#### 1D layouts

For a 1D layout, this is very simple, as a 1D shape only has a length.

Here is a layout for an LED strip with 60 pixels.

```rust
layout1d!(Layout, 60);
```

For our 1D space, the first LED pixel will be at -1.0 and the last LED pixel will be at 1.0.

#### 2D layouts

For a 2D layout, you need to define your 2D shapes: points, lines, grids, arcs, etc.

For our 2D space, we can think of:

- `(-1.0, -1.0)` as the bottom left
- `(1.0, -1.0)` as the bottom right
- `(-1.0, 1.0)` as the top left
- `(1.0, 1.0)` as the top right

Here is a layout for a basic 16x16 LED grid panel to span our 2D space:

```rust
layout2d!(
    Layout,
    [Shape2d::Grid {
        start: Vec2::new(-1., -1.),
        row_end: Vec2::new(1., -1.),
        col_end: Vec2::new(-1., 1.),
        row_pixel_count: 16,
        col_pixel_count: 16,
        serpentine: true,
    }]
);
```

#### 3D layouts

For a 3D layout, you need to define your 3D shapes: points, lines, grids, arcs, splines, etc.

TODO

### Create your visual pattern

Finally, we define the visual pattern we want to display, using the [`Pattern`](https://docs.rs/blinksy/0.1.0/blinksy/pattern/index.html) trait.

```rust
pub trait Pattern<Dim, Layout>
where
    Layout: LayoutForDim<Dim>,
{
    type Params;
    type Color;

    // Required methods
    fn new(params: Self::Params) -> Self;
    fn tick(&self, time_in_ms: u64) -> impl Iterator<Item = Self::Color>;
}
```

While there is one `Pattern` trait, it may be implemented for any dimension, using a [dimension marker](https://docs.rs/blinksy/0.1.0/blinksy/dimension/index.html): `Dim1d`, `Dim2d`, or `Dim3d`. The dimension marker will then contrain the `Layout` generic provided, to implement either `Layout1d`, `Layout2d`, or `Layout3d`, respectively.

On initialization, the pattern is given configuration parameters.

On every update, the pattern is given the current time in milliseconds, and must return an iterator that provides a color for every LED in the layout.

The [color types](https://docs.rs/blinksy/0.1.0/blinksy/color/index.html) are expected to be from the [`palette`](https://docs.rs/palette/latest/palette/) crate, where they implement [`FromColor`](https://docs.rs/blinksy/0.1.0/blinksy/color/trait.FromColor.html) and [`IntoColor`](https://docs.rs/blinksy/0.1.0/blinksy/color/trait.IntoColor.html). A good color type is [`Hsv`](https://docs.rs/blinksy/0.1.0/blinksy/color/struct.Hsv.html).

To use a pattern, we can either choose from the built-in library or we create our own.

We have two visual patterns to start, each implementing `Pattern` for 1d, 2d, and 3d dimensions.

- Rainbow: A basic scrolling rainbow.
- Noise: A flow through random noise functions.

Or feel free to make your own. Better yet, help contribute to our library!

### Setup your LED driver

Finally we setup our LED driver.

The LED driver is what interfaces with the LED chipset over some protocol.

To define an LED driver, we must implement the [`LedDriver`](https://docs.rs/blinksy/0.1.0/blinksy/driver/trait.LedDriver.html) trait:

```rust
pub trait LedDriver {
    type Error;
    type Color;

    // Required method
    fn write<I, C>(
        &mut self,
        pixels: I,
        brightness: f32,
    ) -> Result<(), Self::Error>
       where I: IntoIterator<Item = C>,
             Self::Color: FromColor<C>;
}
```

The LED driver will be given colors from the visual pattern, then converting them into a new color type more suitable to what the LED hardware understands.

To make implementing `LedDriver` easier for the various LED chipsets, we have generic support for the two main types of LED protocols:

- [`clocked`](https://docs.rs/blinksy/0.1.0/blinksy/driver/clocked/index.html): Protocols that are based on [SPI](https://en.wikipedia.org/wiki/Serial_Peripheral_Interface), where chipsets have a data line and a clock line.
  - To defined a clocked LED chipset, you define the [`ClockedLed`](https://docs.rs/blinksy/0.1.0/blinksy/driver/clocked/trait.ClockedLed.html) trait.
- [`clockless`](https://docs.rs/blinksy/0.1.0/blinksy/driver/clockless/index.html): Protocols based on specific timing periods, where chipsets have only a single data line.
  - To defined a clocked LED chipset, you define the [`ClocklessLed`](https://docs.rs/blinksy/0.1.0/blinksy/driver/clocked/trait.ClocklessLed.html) trait.

For each generic LED protocol type, we have specific protocols to drive those types of LEDs:

- By bit-banging over GPIO pins, using a delay timer.
- Or by using an SPI peripheral.

For clockless protocols on ESP devices, we can also use the RMT peripheral.

Then, we have specific implementations for each LED chipset.

So adding this together, for APA102 LEDs, aka DotStar, we have:

- [Apa102Led](https://docs.rs/blinksy/0.1.0/blinksy/drivers/struct.Apa102Led.html), which implements the [`ClockedLed`](https://docs.rs/blinksy/0.1.0/blinksy/driver/clocked/trait.ClockedLed.html) trait to describe the specific details of the APA102 chipset as a clocked LED.
- [Apa102Delay](https://docs.rs/blinksy/0.1.0/blinksy/drivers/type.Apa102Delay.html), which drives APA102 LEDs using GPIO bit-banging with delay timing.
- [Apa102Spi](https://docs.rs/blinksy/0.1.0/blinksy/drivers/type.Apa102Spi.html), which drives APA102 LEDs using an SPI peripheral.

And for WS2812 LEDs, aka NeoPixel, we have:

- [Ws2812Led](https://docs.rs/blinksy/0.1.0/blinksy/drivers/struct.Ws2812Led.html), which implements the [`ClocklessLed`](https://docs.rs/blinksy/0.1.0/blinksy/driver/clocked/trait.Clockless.html) trait to describe the specific details of the WS2812 chipset as a clockless LED.
- [Ws2812Delay](https://docs.rs/blinksy/0.1.0/blinksy/drivers/type.Ws2812Delay.html), which drives WS2812 LEDs using GPIO bit-banging with delay timing. Note: This will not work unless your delay timer is able to handle microsecond precision, which, as far as I understand, most microcontrollers cannot do.
- [Ws2812Spi](https://docs.rs/blinksy/0.1.0/blinksy/drivers/type.Ws2812Spi.html), which drives WS2812 LEDs using an SPI peripheral.

And for WS2812 LEDs on ESP boards, we have [`Ws2812Rmt`](https://docs.rs/blinksy-esp/0.1.0/blinksy-esp/drivers/type.Ws2812Rmt.html)

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

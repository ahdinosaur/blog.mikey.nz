---
title: First look at Blinksy
date: 2025-05-02 09:49:15
tags:
---

As a continuation of my LED pixels journey, I made [Blinksy](https://github.com/ahdinosaur/blinksy) 🟥🟩🟦 :

> A Rust no-std no-alloc LED control library for 1D, 2D, and 3D layouts

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/1085561394?h=dc7b29a099&autoplay=1&loop=1&autopause=0&muted=1" data-title="Blinksy: 2D APA102 Grid with Noise Pattern"></div>

## Backstory

Using my learnings from personal journey with LED pixels:

- [PIXELS FOR THE PIXEL GOD](/pixels-for-the-pixel-god/)
- [A Burn Dance](/a-burn-dance/)
- [Polyledra V1: LED Tetrahedron](/polyledra-v1-led-tetrahedron/)
- [Polyledra V2: LED Tensegrity](/polyledra-v2-led-tensegrity/)

And new learnings with [advanced generics for no-std no-alloc embedded Rust](/how-to-dance-with-embedded-rust-generics/),

I wanted to make a LED control library that could do the following:

- Like [FastLED](https://fastled.io/), support all the most common LED pixel chipsets such as WS2812, APA1012, and more.
- Like [WLED](https://kno.wled.ge), have a library of beautiful visual patterns.
- Unlike anything before, support not just strips and grids, but any 1D, 2D, or even 3D layout.

## Blinksy

Blinksy is a new LED control library for 1D, 2D, and soon 3D layouts\*.

_\* 3D layouts are coming soon, because I want native 3D LED animations!_

### Examples

#### Desktop Simulation: 2D Grid with Noise Pattern

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/1085562226?h=dc7b29a099&autoplay=1&loop=1&autopause=0&muted=1" data-title="Blinksy: 2D APA102 Grid with Noise Pattern"></div>

<details>
<summary>
    Click to see code
</summary>

```rust
use blinksy::{
    layout::{Shape2d, Vec2},
    layout2d,
    patterns::noise::{noise_fns, Noise2d, NoiseParams},
    ControlBuilder,
};
use blinksy_desktop::{
    driver::{Desktop, DesktopError},
    time::elapsed_in_ms,
};
use std::{thread::sleep, time::Duration};

fn main() {
    layout2d!(
        Layout,
        [Shape2d::Grid {
            start: Vec2::new(-1., -1.),
            row_end: Vec2::new(-1., 1.),
            col_end: Vec2::new(1., -1.),
            row_pixel_count: 16,
            col_pixel_count: 16,
            serpentine: true,
        }]
    );
    let mut control = ControlBuilder::new_2d()
        .with_layout::<Layout>()
        .with_pattern::<Noise2d<noise_fns::Perlin>>(NoiseParams {
            ..Default::default()
        })
        .with_driver(Desktop::new_2d::<Layout>())
        .build();

    loop {
        if let Err(DesktopError::WindowClosed) = control.tick(elapsed_in_ms()) {
            break;
        }

        sleep(Duration::from_millis(16));
    }
}
```
</details>

### Embedded: 2D APA102 Grid with Noise Pattern

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/1085561112?h=dc7b29a099&autoplay=1&loop=1&autopause=0&muted=1" data-title="Blinksy: 2D APA102 Grid with Noise Pattern"></div>

<details>
<summary>
    Click to see code
</summary>

```rust
#![no_std]
#![no_main]

use blinksy::{
    layout::{Shape2d, Vec2},
    layout2d,
    patterns::noise::{noise_fns, Noise2d, NoiseParams},
    ControlBuilder,
};
use gledopto::{apa102, board, elapsed, main};

#[main]
fn main() -> ! {
    let p = board!();

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
    let mut control = ControlBuilder::new_2d()
        .with_layout::<Layout>()
        .with_pattern::<Noise2d<noise_fns::Perlin>>(NoiseParams {
            ..Default::default()
        })
        .with_driver(apa102!(p))
        .build();

    control.set_brightness(0.1);

    loop {
        let elapsed_in_ms = elapsed().as_millis();
        control.tick(elapsed_in_ms).unwrap();
    }
}
```

</details>

#### Embedded: 1D WS2812 Strip with Rainbow Pattern

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/1085561502?h=dc7b29a099&autoplay=1&loop=1&autopause=0&muted=1" data-title="Blinksy: 2D APA102 Grid with Noise Pattern"></div>

<details>
<summary>
    Click to see code
</summary>

```rust
#![no_std]
#![no_main]

use blinksy::{
    layout::Layout1d,
    layout1d,
    patterns::rainbow::{Rainbow, RainbowParams},
    ControlBuilder,
};
use gledopto::{board, elapsed, main, ws2812};

#[main]
fn main() -> ! {
    let p = board!();

    layout1d!(Layout, 60 * 5);

    let mut control = ControlBuilder::new_1d()
        .with_layout::<Layout>()
        .with_pattern::<Rainbow>(RainbowParams {
            ..Default::default()
        })
        .with_driver(ws2812!(p, Layout::PIXEL_COUNT))
        .build();

    control.set_brightness(0.2);

    loop {
        let elapsed_in_ms = elapsed().as_millis();
        control.tick(elapsed_in_ms).unwrap();
    }
}
```

</details>

## How to get started with Blinksy

1. [Define your LED layout](#Define-your-LED-layout)
2. [Create your visual pattern](#Create-your-visual-pattern)
3. [Setup your LED driver](#Setup-your-LED-driver)

### Define your LED layout

First you define the [layout][layout] of your LEDs in space, with a struct that implements either the [`Layout1d`][Layout1d], [`Layout2d`][Layout2d], and soon `Layout3d` traits.

To make this easy, we use either the [`layout1d`][layout1d], [`layout2d`][layout2d], or soon `layout3d` macro, respectively.

These traits provide a `PIXEL_COUNT` constant, which is the number of LEDs, and a `.points()` method, which maps each LED pixel into a 1D, 2D, or 3D space between -1.0 and 1.0.

[layout]: https://docs.rs/blinksy/0.1.0/blinksy/layout/index.html
[Layout1d]: https://docs.rs/blinksy/0.1.0/blinksy/layout/trait.Layout1d.html
[Layout2d]: https://docs.rs/blinksy/0.1.0/blinksy/layout/trait.Layout2d.html
[layout1d]: https://docs.rs/blinksy/0.1.0/blinksy/macro.layout1d.html
[layout2d]: https://docs.rs/blinksy/0.1.0/blinksy/macro.layout2d.html

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

### Create your visual pattern

Finally, we define the visual pattern we want to display, using the [`Pattern`][Pattern] trait.

[Pattern]: https://docs.rs/blinksy/0.1.0/blinksy/pattern/index.html

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

## Other topics:

- HSI
- How to convert a color from sRGB to linear RGB to LED RGB.
    - Gamma correction
    - Color correction

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

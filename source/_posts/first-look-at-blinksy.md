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

_\* 3D layouts are coming soon, because I want an LED cube like [this](https://makerworld.com/en/models/1085530-16x16-ws2812-wled-cube) with native 3D animations!_

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

[layout]: https://docs.rs/blinksy/0.3/blinksy/layout/index.html
[Layout1d]: https://docs.rs/blinksy/0.3/blinksy/layout/trait.Layout1d.html
[Layout2d]: https://docs.rs/blinksy/0.3/blinksy/layout/trait.Layout2d.html
[layout1d]: https://docs.rs/blinksy/0.3/blinksy/macro.layout1d.html
[layout2d]: https://docs.rs/blinksy/0.3/blinksy/macro.layout2d.html

#### 1D layouts

For a 1D layout, this is very simple, as a 1D shape only has a length.

Here is a layout for an LED strip with 60 pixels.

```rust
layout1d!(Layout, 60);
```

For our 1D space, the first LED pixel will be at -1.0 and the last LED pixel will be at 1.0.

<div style="text-align: center">
  <img src="/first-look-at-blinksy/layout-1d-points.svg" alt="Layout 1d points" width="100%" />
</div>

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

<div style="text-align: center">
  <img src="/first-look-at-blinksy/layout-2d-points.svg" alt="Layout 2d points" width="100%" />
</div>

### Create your visual pattern

Finally, we define the visual pattern we want to display, using the [`Pattern`][Pattern] trait.

```rust
/// # Type Parameters
///
/// * `Dim` - The dimension marker (Dim1d or Dim2d)
/// * `Layout` - The specific layout type
pub trait Pattern<Dim, Layout>
where
    Layout: LayoutForDim<Dim>,
{
    /// The configuration parameters type for this pattern.
    type Params;

    /// The color type produced by this pattern.
    type Color;

    /// Creates a new pattern instance with the specified parameters.
    fn new(params: Self::Params) -> Self;

    /// Generates colors for all LEDs in the layout at the given time.
    ///
    /// # Arguments
    ///
    /// * `time_in_ms` - The current time in milliseconds
    ///
    /// # Returns
    ///
    /// An iterator yielding one color per LED in the layout
    fn tick(&self, time_in_ms: u64) -> impl Iterator<Item = Self::Color>;
}
```

While there is one [`Pattern`][Pattern] trait, it may be implemented for any dimension, using a [dimension marker](https://docs.rs/blinksy/0.3/blinksy/dimension/index.html): [`Dim1d`][Dim1d], [`Dim2d`][Dim2d], or soon `Dim3d`. The dimension marker will then constrain the `Layout` generic provided, to implement either [`Layout1d`][Layout1d], [`Layout2d`][Layout2d], or soon `Layout3d`, respectively.

[Pattern]: https://docs.rs/blinksy/0.3/blinksy/pattern/trait.Pattern.html
[Dim1d]: https://docs.rs/blinksy/0.3/blinksy/dimension/struct.Dim1d.html
[Dim2d]: https://docs.rs/blinksy/0.3/blinksy/dimension/struct.Dim2d.html
[Layout1d]: https://docs.rs/blinksy/0.3/blinksy/layout/trait.Layout1d.html
[Layout2d]: https://docs.rs/blinksy/0.3/blinksy/layout/trait.Layout2d.html

On initialization, the pattern is given configuration parameters.

On every update, the pattern is given the current time in milliseconds, and must return an iterator that provides a color for every LED in the layout.

The [color types][color types] in Blinksy are inspired by the [`palette`][palette] crate, where they implement [`FromColor`][FromColor] and [`IntoColor`][IntoColor]. Like FastLED we have [`Hsv`][Hsv] (which uses [FastLED's rainbow hues][FastLED HSV]), or for a [more modern][more modern] color space we have [`Okhsv`][Okhsv].

[color types]: https://docs.rs/blinksy/0.3/blinksy/color/index.html
[palette]: https://docs.rs/palette/0.7/palette/
[FromColor]: https://docs.rs/blinksy/0.3/blinksy/color/trait.FromColor.html
[IntoColor]: https://docs.rs/blinksy/0.3/blinksy/color/trait.IntoColor.html
[Hsv]: https://docs.rs/blinksy/0.3/blinksy/color/struct.Hsv.html
[FastLED HSV]: https://github.com/FastLED/FastLED/wiki/FastLED-HSV-Colors
[more modern]: https://bottosson.github.io/posts/colorpicker/
[Okhsv]: https://docs.rs/blinksy/0.3/blinksy/color/struct.Okhsv.html

To use a pattern, we can either choose from the built-in library or we create our own.

We have two visual [patterns][patterns] to start, each implementing [`Pattern`][Pattern] for 1D, 2D, and soon 3D dimensions.

- [Rainbow][rainbow]: A basic scrolling rainbow.
- [Noise][noise]: A flow through random noise functions.

[patterns]: https://docs.rs/blinksy/0.3/blinksy/patterns/index.html
[Pattern]: https://docs.rs/blinksy/0.3/blinksy/pattern/trait.Pattern.html
[rainbow]: https://docs.rs/blinksy/0.3/blinksy/patterns/rainbow/index.html
[noise]: https://docs.rs/blinksy/0.3/blinksy/patterns/noise/index.html

Or feel free to make your own. Better yet, help contribute to our library!

### Setup your LED driver

Finally we setup our LED driver.

The driver is what tells the LED hardware how to be the colors you want.

To define an LED driver, we must implement the [`Driver`][Driver] trait:

```rust
pub trait Driver {
    /// The error type that may be returned by the driver.
    type Error;

    /// The color type accepted by the driver.
    type Color;

    /// Writes a sequence of colors to the LED hardware.
    ///
    /// # Arguments
    ///
    /// * `pixels` - Iterator over colors
    /// * `brightness` - Global brightness scaling factor (0.0 to 1.0)
    /// * `correction` - Color correction factors
    ///
    /// # Returns
    ///
    /// Result indicating success or an error
    fn write<I, C>(
        &mut self,
        pixels: I,
        brightness: f32,
        correction: ColorCorrection,
    ) -> Result<(), Self::Error>
    where
        I: IntoIterator<Item = C>,
        Self::Color: FromColor<C>;
}
```

#### What colors do an LED understand?

The LED driver will be given colors from the visual pattern, then convert them into a new color type more suitable to what the LED hardware understands.

LEDs are generally 3 smaller LEDs, red + green + blue, each controlled via [pulse-width modulation (PWM)][PWM]. If you tell an LED to be 100% bright, it will be on for 100% of the time. If you tell an LED to be 50% bright, it will be on for 50% of the time. And so on. Our eyes don't notice the flicker on and off.

Therefore, we use [`LinearSrgb`][LinearSrgb] when thinking about LEDs, since linear color values correspond to the intensity of light, i.e. how many photons should be emitted. However, what we actually perceive in a linear change in photons is not linear. Per evolution, we are much more sensitive to changes in dim light than we are to changes in bright light. If you double the amount of photons, we don't see double the brightness.

This mismatch between physics and perception is why we generally think in other color systems. The "RGB" you think you know is actually [gamma-encoded `sRGB`][sRGB].

[PWM]: https://en.wikipedia.org/wiki/Pulse-width_modulation#Duty_cycle
[LinearSrgb]: https://docs.rs/blinksy/0.3/blinksy/color/struct.LinearSrgb.html
[sRGB]: https://docs.rs/blinksy/0.3/blinksy/color/struct.Srgb.html

#### How do we talk to LEDs?

To make implementing [`Driver`][Driver] easier for the various LED chipsets, we have generic support for the two main types of LED protocols:

[Driver]: https://docs.rs/blinksy/0.3/blinksy/driver/trait.Driver.html

- [`clocked`][clocked]: Protocols that are based on [SPI][spi], where chipsets have a data line and a clock line.
  - To defined a clocked LED chipset, you define the [`ClockedLed`][ClockedLed] trait.
- [`clockless`][clockless]: Protocols based on specific timing periods, where chipsets have only a single data line.
  - To defined a clocked LED chipset, you define the [`ClocklessLed`][ClocklessLed] trait.

[clocked]: https://docs.rs/blinksy/0.3/blinksy/driver/clocked/index.html
[spi]: https://en.wikipedia.org/wiki/Serial_Peripheral_Interface
[ClockedLed]: https://docs.rs/blinksy/0.3/blinksy/driver/clocked/trait.ClockedLed.html
[clockless]: https://docs.rs/blinksy/0.3/blinksy/driver/clockless/index.html
[ClocklessLed]: https://docs.rs/blinksy/0.3/blinksy/driver/clocked/trait.ClocklessLed.html

For each generic LED protocol type, we have specific protocols to drive those types of LEDs:

- By bit-banging over GPIO pins, using a delay timer.
- Or by using an SPI peripheral.

For clockless protocols on ESP devices, we can also use the [RMT peripheral][RMT peripheral].

[RMT peripheral]: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/rmt.html

Then, we have specific implementations for each LED chipset.

#### What LEDs can we talk to?

So adding this together, for APA102 LEDs, aka DotStar, we have:

- [Apa102Led], which implements the [ClockedLed] trait to describe the specific details of the APA102 chipset as a clocked LED.
- [Apa102Delay], which drives APA102 LEDs using GPIO bit-banging with delay timing.
- [Apa102Spi], which drives APA102 LEDs using an SPI peripheral.

[Apa102Led]: https://docs.rs/blinksy/0.3/blinksy/drivers/struct.Apa102Led.html
[ClockedLed]: https://docs.rs/blinksy/0.3/blinksy/driver/clocked/trait.ClockedLed.html
[Apa102Delay]: https://docs.rs/blinksy/0.3/blinksy/drivers/type.Apa102Delay.html
[Apa102Spi]: https://docs.rs/blinksy/0.3/blinksy/drivers/type.Apa102Spi.html

And for WS2812 LEDs, aka NeoPixel, we have:

- [Ws2812Led], which implements the [ClocklessLed] trait to describe the specific details of the WS2812 chipset as a clockless LED.
- [Ws2812Delay], which drives WS2812 LEDs using GPIO bit-banging with delay timing. Note: This will not work unless your delay timer is able to handle microsecond precision, which, as far as I understand, most microcontrollers cannot do.

[Ws2812Led]: https://docs.rs/blinksy/0.3/blinksy/drivers/struct.Ws2812Led.html
[ClocklessLed]: https://docs.rs/blinksy/0.3/blinksy/driver/clocked/trait.Clockless.html
[Ws2812Delay]: https://docs.rs/blinksy/0.3/blinksy/drivers/type.Ws2812Delay.html

And for WS2812 LEDs on ESP boards, we have [Ws2812Rmt].

[Ws2812Rmt]: https://docs.rs/blinksy-esp/0.3/blinksy-esp/drivers/type.Ws2812Rmt.html

(Note: We will later implement a way to drive clockless LEDs using an SPI peripheral. For now I'm happy with my ESP32's RMT peripheral. If you want this, maybe you can help?)

## Get started with a Gledopto

Okay, so now you want to get started?

I found a great LED controller available on AliExpress: [Gledopto GL-C-016WL-D][gl-c-016wl-d].

[![Gledopto GL-C-016WL-D](/first-look-at-blinksy/gledopto-gl-c-016wl-d.jpg)][gl-c-016wl-d]

I made a board support crate: [`gledopto`][gledopto].

Now you just need to add LEDs, and away you go.

If you need a LED supplier recommendation, I've only had success with "BTF-Lighting", found both on AliExpress, Amazon, and on their own website.

If you need more help, look at [QuinLED's helpful guides][quinled-guides]

(Note: I will later add support for [QuinLED][quinled] boards, since they are the best. Unfortunately, shipping to New Zealand was too expensive, so am using a friend to deliver when they visit.)

[gl-c-016wl-d]: https://www.aliexpress.com/item/1005008707989546.html
[gledopto]: https://docs.rs/gledopto/0.3/gledopto/index.html
[quinled-guides]: https://quinled.info/addressable-digital-leds/
[quinled]: https://quinled.info

## Thanks

If you want to help, the best thing to do is use Blinksy for your own LED project, and share about your adventures.

If you want to contribute code, please:

- Help port a visual pattern from FastLED or WLED to Blinksy
- Write your own visual pattern
- Help support a new LED chipset

If you want to otherwise support the project, please:

- Star the project on GitHub: [ahdinosaur/blinksy](https://github.com/ahdinosaur/blinksy)
- Subscribe to me on YouTube, where I want to start live-coding the future of Blinksy
- Sponsor me on GitHub: [@ahdinosaur](https://github.com/sponsors/ahdinosaur)

Thanks for giving me your attention. Have a good one.

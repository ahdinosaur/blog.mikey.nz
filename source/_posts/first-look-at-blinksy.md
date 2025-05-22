---
title: First look at Blinksy
date: 2025-05-02 09:49:15
tags:
---

Oops I went down a rabbit hole and discovered this: [Blinksy](https://github.com/ahdinosaur/blinksy) 🟥🟩🟦

> A **Rust** _no-std_ _no-alloc_ LED control library for 1D, 2D, and soon 3D layouts

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

## How Blinksy works

- Define your LED [`layout`][layout] in 1D, 2D, or soon 3D space
- Create your visual [`pattern`][pattern] (effect), or choose from our built-in [`patterns`][patterns] library
  - The pattern will compute colors for each LED based on its position
- Setup a [`driver`][driver] to send each frame of colors to your LEDs, using our built-in [`drivers`][drivers] library.

[layout]: https://docs.rs/blinksy/0.3/blinksy/layout/index.html
[pattern]: https://docs.rs/blinksy/0.3/blinksy/pattern/index.html
[patterns]: https://docs.rs/blinksy/0.3/blinksy/patterns/index.html
[driver]: https://docs.rs/blinksy/0.3/blinksy/driver/index.html
[drivers]: https://docs.rs/blinksy/0.3/blinksy/drivers/index.html

### Define your LED layout

A [layout][layout] defines the physical or logical positions of the LEDs in your setup, as arrangements in 1D, 2D, and 3D space.

[layout]: https://docs.rs/blinksy/0.3/blinksy/layout/index.html

To define a layout, we must define a struct that implement either the [`Layout1d`][Layout1d], [`Layout2d`][Layout2d], or soon `Layout3d` traits.

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

A [pattern][pattern], most similar to [a WLED effect][a WLED effect], generates colors for LEDs based on time and position.

[pattern]: https://docs.rs/blinksy/0.3/blinksy/pattern/index.html
[a WLED effect]: https://kno.wled.ge/features/effects/

We define this as a struct that implements the [`Pattern`][Pattern] trait.

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

To use a pattern, we can either choose from the [built-in library][patterns] or create our own.

We have two visual [patterns][patterns] to start, each implementing [`Pattern`][Pattern] for 1D, 2D, and soon 3D.

- [Rainbow][rainbow]: A basic scrolling rainbow.
- [Noise][noise]: A flow through random noise functions.

[patterns]: https://docs.rs/blinksy/0.3/blinksy/patterns/index.html
[Pattern]: https://docs.rs/blinksy/0.3/blinksy/pattern/trait.Pattern.html
[rainbow]: https://docs.rs/blinksy/0.3/blinksy/patterns/rainbow/index.html
[noise]: https://docs.rs/blinksy/0.3/blinksy/patterns/noise/index.html

Or feel free to make your own. Better yet, help contribute to our library!

### Setup your LED driver

Now for the final step.

The driver is what tells the LED hardware how to be the colors you want.

To define an driver, we must implement the [`Driver`][Driver] trait:

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

The driver says what type of error it might return and what type of color it wants to receive.

When you write to a driver, you provide an iterator of colors (in your own color type), plus a global brightness and color correction.

#### What colors do an LED understand?

The LED driver will be given colors from the visual pattern, then convert them into a new color type more suitable to what the LED hardware understands.

LEDs are generally 3 smaller LEDs, red + green + blue, each controlled via [pulse-width modulation (PWM)][PWM]. If you tell an LED to be 100% bright, it will be on for 100% of the time. If you tell an LED to be 50% bright, it will be on for 50% of the time. And so on. Our eyes don't notice the flicker on and off.

![LED PWM](/first-look-at-blinksy/led-pwm.svg)

Therefore, we use [`LinearSrgb`][LinearSrgb] when thinking about LEDs, since linear color values correspond to the intensity of light, i.e. how many photons should be emitted. However, what we actually perceive in a linear change in photons is not linear. For our evolutionary survival, we are much more sensitive to changes in dim light than we are to changes in bright light. If you double the amount of photons, we don't see double the brightness.

![LED PWM](/first-look-at-blinksy/linear-vs-gamma-perception.svg)

This mismatch between physics and perception is why the "RGB" you think you know is actually [gamma-encoded `sRGB`][sRGB]. But also, if you start mixing RGB's, make sure to do so in the linear space.

So anyways, why red, green, and blue? These correspond to the 3 light receptors in our eyes. What we perceive as color is some combination of these receptors being trigged. As in, we don't see color as we might think.

But there's more. We say RGB, but what red, what green, what blue? Is the color in our color system the same as the color being output by our LEDs?

I could go on, but to do so I need another blog post.

[PWM]: https://en.wikipedia.org/wiki/Pulse-width_modulation#Duty_cycle
[LinearSrgb]: https://docs.rs/blinksy/0.3/blinksy/color/struct.LinearSrgb.html
[sRGB]: https://en.wikipedia.org/wiki/SRGB

#### What protocols do an LED understand?

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

[Apa102Led]: https://docs.rs/blinksy/0.3/blinksy/drivers/apa102/struct.Apa102Led.html
[ClockedLed]: https://docs.rs/blinksy/0.3/blinksy/driver/clocked/trait.ClockedLed.html
[Apa102Delay]: https://docs.rs/blinksy/0.3/blinksy/drivers/apa102/type.Apa102Delay.html
[Apa102Spi]: https://docs.rs/blinksy/0.3/blinksy/drivers/apa102/type.Apa102Spi.html

And for WS2812 LEDs, aka NeoPixel, we have:

- [Ws2812Led], which implements the [ClocklessLed] trait to describe the specific details of the WS2812 chipset as a clockless LED.
- [Ws2812Delay], which drives WS2812 LEDs using GPIO bit-banging with delay timing. Note: This will not work unless your delay timer is able to handle microsecond precision, which, as far as I understand, most microcontrollers cannot do.

[Ws2812Led]: https://docs.rs/blinksy/0.3/blinksy/drivers/ws2812/struct.Ws2812Led.html
[ClocklessLed]: https://docs.rs/blinksy/0.3/blinksy/driver/clocked/trait.Clockless.html
[Ws2812Delay]: https://docs.rs/blinksy/0.3/blinksy/drivers/ws2812/type.Ws2812Delay.html

And for WS2812 LEDs on ESP boards, we have [Ws2812Rmt], which drives WS2812 LEDs using the [RMT peripheral][RMT peripheral].

[RMT peripheral]: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/rmt.html
[Ws2812Rmt]: https://docs.rs/blinksy-esp/0.3/blinksy_esp/type.Ws2812Rmt.html

(Note: We will later implement a way to drive clockless LEDs using an SPI peripheral. For now I'm happy with my ESP32's RMT peripheral. If you want this, maybe you can help?)

By the way, props to [`smart-leds`][smart-leds] for paving the way on addressable LEDs in Rust.

[smart-leds]: https://github.com/smart-leds-rs/smart-leds

## Get started

### Put everything together

Okay, now that we've learned about [layout][layout], a [pattern][pattern], and [driver][driver] – let's put them together.

[layout]: #Define-your-LED-layout
[pattern]: #Create-your-visual-pattern
[driver]: #Setup-your-LED-driver

We use a [`ControlBuilder`][ControlBuilder] to build a [`Control`][Control].

For 1D:

```rust
let mut control = ControlBuilder::new_1d()
    .with_layout::< /* layout type */ >()
    .with_pattern::< /* pattern type */ >(/* pattern params */)
    .with_driver(/* driver */)
    .build();
```

For 2D:

```rust
let mut control = ControlBuilder::new_2d()
    .with_layout::< /* layout type */ >()
    .with_pattern::< /* pattern type */ >(/* pattern params */)
    .with_driver(/* driver */)
    .build();
```

[`ControlBuilder`][ControlBuilder] means we don't have to think about all generic types involved in a [`Control`][Control], we can add each part one at a time.

From here we can set a global brightness or color correction.

Then we run our main loop, calling [`.tick()`][Control.tick] with the current time in milliseconds.

```rust
loop {
    control.tick(/* current time in milliseconds */).unwrap();
}
```

[ControlBuilder]: https://docs.rs/blinksy/0.3/blinksy/control/struct.ControlBuilder.html
[Control]: https://docs.rs/blinksy/0.3/blinksy/control/struct.Control.html
[Control.tick]: https://docs.rs/blinksy/0.3/blinksy/control/struct.Control.html#method.tick

### Get running on a microcontroller

While you can plug LEDs directly into microcontroller pins, I do recommend using an LED controller that does things properly.

I found a decent LED controller available on AliExpress: [Gledopto GL-C-016WL-D][gl-c-016wl-d].

[![Gledopto GL-C-016WL-D](/first-look-at-blinksy/gledopto-gl-c-016wl-d.jpg)][gl-c-016wl-d]

For this, I made a board support crate: [`gledopto`][gledopto].

The board support crate provides a few macros to make your life easy, such as a `board!` macro to setup your board, or a `ws2812!` macro that sets up a WS2812 driver using the specific pins for that controller.

**To make even easier, I made a quickstart project template: [`blinksy-quickstart-gledopto`][blinksy-quickstart-gledopto]**

[gl-c-016wl-d]: https://www.aliexpress.com/item/1005008707989546.html
[gledopto]: https://docs.rs/gledopto/0.3/gledopto/index.html
[board!]: https://docs.rs/gledopto/0.3/gledopto/macro.board.html
[ws2812!]: https://docs.rs/gledopto/0.3/gledopto/macro.ws2812.html
[blinksy-quickstart-gledopto]: https://github.com/ahdinosaur/blinksy-quickstart-gledopto

### LEDs

Now you just need to add LEDs, and away you go.

If you need a LED supplier recommendation, I've only had success with "BTF-Lighting". You can find them on [AliExpress](https://btf-lighting.aliexpress.com/), [Amazon](https://www.amazon.com/stores/BTF-LIGHTING/BTF-LIGHTING/page/0FF60378-45DE-44E7-B0D7-8F5CD6478971), or on [their own website](https://www.btf-lighting.com/).

If you need more help, look at [QuinLED's helpful guides][quinled-guides].

(Note: I will later add support for [QuinLED][quinled] boards, since they are the best and want to support them. Unfortunately, shipping to New Zealand was too expensive, so I will receive once a friend travels over the Pacific.)

[quinled-guides]: https://quinled.info/addressable-digital-leds/
[quinled]: https://quinled.info

### Hello LEDs

Now, here is our hello world of LEDs:

A strip of WS2812 LEDs with a scrolling rainbow.

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

Or, to show some more:

A grid of APA102 LEDs with a noise function.

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


### Simulate on your desktop

Okay, but let's say you just want to start now, without a microcontroller, without any LEDs.

Blinksy also has a way to simulate on your desktop: [`blinksy-desktop`][blinksy-desktop].

This provides [a driver][blinksy-desktop-driver] (using [miniquad][miniquad]) and [an elapsed time function][blinksy-desktop-time].

[blinksy-desktop]: https://docs.rs/blinksy-desktop/0.3/blinksy_desktop/
[blinksy-desktop-driver]: https://docs.rs/blinksy-desktop/0.3/blinksy_desktop/driver/index.html
[miniquad]: https://github.com/not-fl3/miniquad
[blinksy-desktop-time]: https://docs.rs/blinksy-desktop/0.3/blinksy_desktop/time/index.html

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

### Quickstart a project

So wanna jump in now and start your own project?

**I made a quickstart project template: [`blinksy-quickstart-gledopto`][blinksy-quickstart-gledopto]**

[blinksy-quickstart-gledopto]: https://github.com/ahdinosaur/blinksy-quickstart-gledopto

You can even simulate on the desktop while your controller and LEDs arrive.

## Thanks

If you want to help, the best thing to do is use [Blinksy][blinksy] for your own LED project, and share about your adventures.

If you want to say something about this post, discuss this [on GitHub](https://github.com/ahdinosaur/meta/issues/3).

If you want to [contribute code][blinksy], please:

[blinksy]: https://github.com/ahdinosaur/blinksy

- Help port a visual pattern from FastLED or WLED to Blinksy
- Write your own visual pattern
- Help support a new LED chipset
- Help support a new LED controller

If you want to otherwise support the project, please:

- Star the project on GitHub: [ahdinosaur/blinksy](https://github.com/ahdinosaur/blinksy)
- Sponsor me on GitHub: [@ahdinosaur](https://github.com/sponsors/ahdinosaur)
- Subscribe to me on YouTube, to encourage me to live-code Blinksy: [@Make_with_Mikey](https://www.youtube.com/channel/UCRNri_xZGzROcxGcAYkOhpA)

Thanks for sharing your attention with me. Have a good one. 💜

---
title: 'Polyledra v2: LED tensegrity'
date: 2021-01-31
categories:
  - projects
tags:
  - project
  - led
---

(For v1, see [Polyledra v1: LED tetrahedron](/polyledra-v1-led-tetrahedron/))

## Inspiration

> A tensegrity is a structural principle based on a system of isolated components under _compression_ inside a network of continous _tension_, and arranged in such a way that the compressed members (struts) do not touch each other while the prestressed tensioned members (tendons) delineate the system spatially.
>
> <br />
>
> The term was coined by [Buckminster Fuller](https://en.wikipedia.org/wiki/Buckminster_Fuller) in the 1960s as a portmanteau of "tensional integrity"
>
> - [Tensegrity @ Wikipedia](https://en.wikipedia.org/wiki/Tensegrity)

![](./polyledra-v2-led-tensegrity/tensegrity010.jpg)

![](./polyledra-v2-led-tensegrity/tensegrity001.jpg)

![](./polyledra-v2-led-tensegrity/tensegrity016.jpg)

## Tensegrity prototype

![](./polyledra-v2-led-tensegrity/tensegrity-prototype-1.jpg)

![](./polyledra-v2-led-tensegrity/tensegrity-prototype-2.jpg)

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544440?h=dc7b29a099&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2020-10-04) Polyledra v2: Tensegrity prototype"></div>

## Controller

This time I wanted to use more "off-the-shelf" LED software and hardware.

- Software: [WLED](https://kno.wled.ge/)
- Hardware: [QuinLED-Dig-Uno](https://quinled.info/pre-assembled-quinled-dig-uno/)

## Strut design

Bill of materials:

- aluminium extruded round tube (12.7mm outer diameter, 0.9mm thickness)
- acrylic round tube (40mm outer diameter)
- 4x 3d printed spacers
- 2x 3d printed end links
- 2x 3d printed end caps
- XT60 connectors (power)
- 2 pin electrical cable (power)
- WS2811 LED strips (White PCB, 5m 60 LEDs IP65)
- 3 pin 0.5mm^2 20AWG waterproof electrical cable (LED)
- 3 pin "small size" waterproof IP65 LED connector (LED)

Benefits of aluminium tube inner:

- Acts as heatsink for LEDs
- Can feed power cable through tube to other side

Since I couldn't find acrylic tubes long enough, I "welded" multiple tubes together with solvent cement.

## Strut assembly

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796544501?h=f2a3973a72&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2020-12-13) Polyledra v2: 3D printing spacers"></div>

![](./polyledra-v2-led-tensegrity/printing-spacers.jpg)

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796544455?h=675491f3ca&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2020-12-11) Polyledra v2: LED prototype"></div>

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544480?h=2fc9288ae1&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2020-12-11) Polyledra v2: LED prototype"></div>

The acrylic tubes are sanded to achieve a diffuser effect.

![](./polyledra-v2-led-tensegrity/sanding-acrylic-tubes.jpg)

![](./polyledra-v2-led-tensegrity/diffuser-test.jpg)

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544524?h=d556bd9d33&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2020-12-17) Polyledra v2: Diffuser test"></div>

## Tensegrity design

Bill of materials:

- 6x LED struts
- 3x 6x Tendons
  - Shock cord
  - Shock cord end hooks

Each strut connects with:

- The neighbor struts at the top
- The neighbor struts at the bottom
- The neighbor struts from top to bottom

![tensegrity.gif](./polyledra-v2-led-tensegrity/tensegrity.gif)

## Tensegrity assembly

![](./polyledra-v2-led-tensegrity/soldered-edge.jpg)

![](./polyledra-v2-led-tensegrity/assembly-test-1.jpg)

![](./polyledra-v2-led-tensegrity/assembly-test-2.jpg)

![](./polyledra-v2-led-tensegrity/assembly-test-3.jpg)

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544568?h=5507016050&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2021-01-12) Polyledra v2: Tensegrity test"></div>

## Ignition

![](./polyledra-v2-led-tensegrity/ignition.jpg)

## Kiwiburn

![](./polyledra-v2-led-tensegrity/kiwiburn-1.jpg)

![](./polyledra-v2-led-tensegrity/kiwiburn-2.jpg)

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544606?h=e36ece3c4e&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2021-01-29) Polyledra v2: Kiwiburn"></div>

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544637?h=03a12ba226&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2021-01-29) Polyledra v2: Kiwiburn"></div>

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796544673?h=de776782f6&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2021-01-31) Polyledra v2: Kiwiburn"></div>

---
title: PIXELS FOR THE PIXEL GOD
date: 2017-12-31
image: /pixels-for-the-pixel-god/portable-rainbows.jpg
categories:
  - projects
tags:
  - project
  - led
---

As a break from my other open source projects, have decided to start spending my [Art~Hack](https://arthack.nz) evenings on my next (3rd?) generation of modular LED pixels that beat to music.

<!-- more -->

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796536263?h=36d25c00bf&background=1" data-title="(2015) Scrolling Rainbow"></div>

## First generation

First generation: [beatpixels](https://github.com/ahdinosaur/beatpixels)

- uses WS2801 pixels (pre-soldered to inject power every 2 or 4 meters?)
- uses an Arduino Uno micro-controller to control the pixels using a custom message protocol over serial
- uses an laptop running Pure Data to send messages to the Arduino
- learning: it's difficult to be expressive in the C language

![Cloyne pixel board](/pixels-for-the-pixel-god/cloyne-pixel-board.jpg)

## Second generation

The second (and maybe second-second) generation: [pixelbeat](https://github.com/ahdinosaur/pixelbeat/tree/reactive) / [mood-light](https://github.com/ahdinosaur/mood-light).

- used a BeagleBone Black / Green computer, later just used my laptop with a usb-to-ftdi-to-spi controller
- used WS2012 / APA102C pixels, manually split strips to inject power every 2 meters
  - friend Gordon ([Fre3formd](https://www.facebook.com/Fre3formD)) made a custom 3d-printed enclosure for power injection connections to reduce failure during setup and teardown
- created and used module ecosystems around [ndarray](https://github.com/scijs/ndarray): [ndpixels](https://github.com/livejs/ndpixels), [ndsamples](https://github.com/ahdinosaur/ndsamples)
- eventually learned to make modules be simple functions, like [pixels-apa102](https://github.com/livejs/pixels-apa102), in order to better collaborate with others like Matt
- experimented with BeagleBone booting directly to an electron app as the window manager: [boot-to-electron](https://github.com/ahdinosaur/boot-to-electron)
- learnings
  - computer operating systems are fragile
  - JavaScript garbage collection is bad for real-time
  - BeagleBones don't have enough juice to power a smooth audio-reactive visual set
  - manually injecting power into strips takes too much time to setup

![pixel beat at Art~Hack](/pixels-for-the-pixel-god/art-hack-pixelbeat.jpg)

![pixel beat at Art~Hack](/pixels-for-the-pixel-god/art-hack-pixelbeat-2.jpg)

![mood light](/pixels-for-the-pixel-god/mood-light.jpg)

gigs:

- [inky waves](https://twitter.com/MattMcKegg/status/713915311389421568) (using Matt's [audio-splatter](https://github.com/mmckegg/audio-splatter))
- [campjs](https://www.youtube.com/watch?v=tehrxPaI4hk) (using Matt's [Loop Drop](http://loopjs.com))
- ... a few others that I'm too lazy to find.

## Third generation ???

Third generation: [pj (pixel jockey)](https://github.com/ahdinosaur/pj) !

- use WiFi-enabled micro-controller ([ESP32](http://esp32.net/)) to control the pixels using [Open Pixel Control](http://openpixelcontrol.org)
- create a desktop and mobile app to send messages to the micro-controller over WiFi
- either have 4 meter strips, or find a way to get 4 meter strips pre-soldered for injection. use either separate AC->DC units per injection, or find a way to get clean connectors to a larger unit.
- if at a gig and you want to minimize latency, have an option to connect over Ethernet
- have clean enclosures and connectors, or don't even bother wasting time

### It begins

As always, it begins with a [scrolling rainbow](https://github.com/ahdinosaur/rainbow-pixels) 🌈

(Using an electron app to simulate the hardware in JavaScript before I commit to anything.)

![scrolling rainbow](/pixels-for-the-pixel-god/scrolling-rainbow-2.png)

- published [pull-opc@1](https://github.com/ahdinosaur/pull-opc) to send and receive Open Pixel Control messages using pull streams
- published [pixels-opc@4](https://github.com/livejs/pixels-opc) to send [ndpixels](https://github.com/livejs/ndpixels)
- scaffolded a follower simulator using electron
- follower broadcasts up over mdns
- scaffold a leader that sends rainbow pixels to any up followers

## LED power requirements and connectors

From [Pololu's page on the APA102C LEDS](https://www.pololu.com/product/2554):

> Each RGB LED draws approximately 50 mA when it is set to full brightness and powered at 5 V. This means that for every 30 LEDs you turn on, your LED strip could be drawing as much as 1.5 A.
>
> Multiple LED strips can be chained together by connecting input connectors to output connectors. When strips are chained this way, they can be controlled and powered as one continuous strip. Please note, however, that as chains get longer, the ends will get dimmer and redder due to the voltage drop across the strip
>
> We recommend chains of LEDs powered from a single supply not exceed 180 total RGB LEDs. It is fine to make longer chains with connected data lines, but you should power each 180-LED section separately. If you are powering each section from a different power supply, you should cut the power wires between the sections so you do not short the output of two different power supplies together.

I'm using 60-LED per-meter strips, and due to my own calculations decided to split the strips every 2 meters. Now I'd rather do 3 meters (as recommended above) or 4 meters (since I almost never display at full brightness anyways).

To split the strips, I cut the strips with a wire cutter and soldered on [4-pin JST connectors](http://www.jst-mfg.com/product/pdf/eng/eSM.pdf) at each end, using [Sugru](https://sugru.com/) to re-create a protective cover over the silicon sheath on the LEDs to the wires.

Then I used the [SEEED AllPixel Power Tap Kit](http://www.seeedstudio.com/depot/AllPixel-Power-Tap-Kit-p-2380.html) to connect in between the strips and re-inject the power using a large-ish 5V power supply and some custom soldered wires.

But this setup would break anytime I transported the LEDs to and from [Art~Hack](https://arthack.nz) or a gig. Specifically the wires connecting to the Power Tap between the LED strips.

So I received the support from my friend Gordon of [Fre3formD](https://www.facebook.com/Fre3formD/) to design and 3d print a custom enclosure for the Power Tap so that the pressure on the wires wouldn't cause them to break.

![power 1](/pixels-for-the-pixel-god/power-1.jpg)
![power 2](/pixels-for-the-pixel-god/power-2.jpg)

Since then I've also started using small 5V power supplies per injection, since it's much easier to run normal AC power extensions and it's much more flexible to accommodate any venue. But I also haven't run more than 12 meters of LED strips at a time yet, nor any permanent installations using this recent setup.

## A new play with portable rainbows

Have a working prototype using the esp32, some rotary encoders, a button, and an apa102 led strip:

https://github.com/ahdinosaur/aburndance

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796509004?h=3253ba78be&background=1" data-title="(2017) PIXELS FOR THE PIXEL GOD"></div>

You click the button to cycle through "modes" (currently have rainbow mode, star field mode, and convergence mode). Each mode can use params from the first 3 rotary encoders, 4th rotary encoder is always used for global brightness.

![rainbow breadboard](/pixels-for-the-pixel-god/rainbow-breadboard-1.jpg)

Today ported my setup from a breadboard to a protoboard, plus found some fancy knobs lying around the space!

![rainbow breadboard](/pixels-for-the-pixel-god/rainbow-breadboard-2.jpg)

🎈

### Off-grid new years'

Portable rainbows and me for off-grid new years' 🎊

![portable rainbows](/pixels-for-the-pixel-god/portable-rainbows.jpg)

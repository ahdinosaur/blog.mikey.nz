---
title: A burn dance
date: 2018-08-18
tags:
---

Playing around with rainbows LEDs i can dance with!  🌈💃⚡️💖

In the classic shape of suspenders and a belt.

<!-- more -->

<div class="video-embed" data-ratio="2:3" data-type="vimeo" data-src="https://player.vimeo.com/video/795074597?h=fa397d5ebc" data-title="(2018) A Burn Dance: Walkthrough"></div>

Continuing from [PIXELS FOR THE PIXEL GOD](/pixels-for-the-pixel-god/)

Source: [`ahdinosaur/aburndance`](https://github.com/ahdinosaur/aburndance)

![](./a-burn-dance/IMG_20180817_202947.jpg)

## BOM

Bill of materials:

- led strips: [apa102](https://www.adafruit.com/product/2239?length=2)
  - [connector](https://www.amazon.com/gp/product/B0777BQC1P/)
- controller: [Adafruit HUZZAH32 – ESP32 Feather Board](https://www.adafruit.com/product/3405)
  - [Feather proto board](https://www.adafruit.com/product/2884)
  - [rotary encoder](https://www.adafruit.com/product/377)
  - [tactile button](https://www.adafruit.com/product/367)
- usb power source: [Anker PowerCore 26800](https://www.amazon.com/dp/B01JIWQPMW)
- shoulder straps (suspenders): [etsy](https://www.etsy.com/nz/listing/456446760/handmade-usa-blackbrowntan-leather-clip)
- waist strap (belt): [etsy](https://www.etsy.com/nz/listing/114576723/handmade-thick-leather-belt-mens-womens)

## User interface design

Controller has a current mode and current param.

The current mode is being rendered with all the params for that mode.

Here are the available ways to interface with the controller:

- press 1st button for previous mode
- press 2nd button for next mode
- press 3rd button for previous param
- press 4th button for next param
- turn the rotary encoder to change the current param
- hold 1st button until white then turn rotary encoder to change brightness
- hold 2nd button until white then turn rotary encoder to change color temperature

## Showcase

![](./a-burn-dance/IMG_20180817_141408.jpg)
![](./a-burn-dance/IMG_20180817_141417.jpg)
![](./a-burn-dance/IMG_20180817_144718.jpg)
![](./a-burn-dance/IMG_20180817_163534.jpg)
![](./a-burn-dance/IMG_20180817_195256.jpg)
![](./a-burn-dance/IMG_20180819_152242.jpg)

<div class="video-embed" data-ratio="2:3" data-type="vimeo" data-src="https://player.vimeo.com/video/795749915?h=768bef89b0" data-title="(2018) A Burn Dance: Demo"></div>

## Resources

- [Adafruit ESP32 learning resources](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather)
  - [ESP32 pinouts](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather/pinouts)
  - [ESP32 guide to installing the Arduino IDE](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather/using-with-arduino-ide).
- [arduino-esp32/.../examples/.../RepeatTimer.ino](https://github.com/espressif/arduino-esp32/blob/master/libraries/ESP32/examples/Timer/RepeatTimer/RepeatTimer.ino)

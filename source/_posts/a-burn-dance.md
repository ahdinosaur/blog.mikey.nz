---
title: A burn dance
date: 2018-08-18
tags:
---

playing around with rainbows LEDs i can dance with!  🌈💃⚡️💖

in the classic shape of suspenders and a belt.

<iframe class="video" src="https://player.vimeo.com/video/795074597?h=fa397d5ebc" width="640" height="960" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="(2018) A Burn Dance: Walkthrough"></iframe>

continuing from [PIXELS FOR THE PIXEL GOD](/pixels-for-the-pixel-god/)

source: https://github.com/ahdinosaur/aburndance

![](./a-burn-dance/IMG_20180817_202947.jpg)

## bom

bill of materials:

- led strips: [apa102](https://www.adafruit.com/product/2239?length=2)
  - [connector](https://www.amazon.com/gp/product/B0777BQC1P/)
- controller: [Adafruit HUZZAH32 – ESP32 Feather Board](https://www.adafruit.com/product/3405)
  - [Feather proto board](https://www.adafruit.com/product/2884)
  - [rotary encoder](https://www.adafruit.com/product/377)
  - [tactile button](https://www.adafruit.com/product/367)
- usb power source: [Anker PowerCore 26800](https://www.amazon.com/dp/B01JIWQPMW)
- shoulder straps (suspenders): [etsy](https://www.etsy.com/nz/listing/456446760/handmade-usa-blackbrowntan-leather-clip)
- waist strap (belt): [etsy](https://www.etsy.com/nz/listing/114576723/handmade-thick-leather-belt-mens-womens)

## user interface design

controller has a current mode and current param.

the current mode is being rendered with all the params for that mode.

here are the available ways to interface with the controller:

- press 1st button for previous mode
- press 2nd button for next mode
- press 3rd button for previous param
- press 4th button for next param
- turn the rotary encoder to change the current param
- hold 1st button until white then turn rotary encoder to change brightness
- hold 2nd button until white then turn rotary encoder to change color temperature

## showcase

![](./a-burn-dance/IMG_20180817_141408.jpg)
![](./a-burn-dance/IMG_20180817_141417.jpg)
![](./a-burn-dance/IMG_20180817_144718.jpg)
![](./a-burn-dance/IMG_20180817_163534.jpg)
![](./a-burn-dance/IMG_20180817_195256.jpg)
![](./a-burn-dance/IMG_20180819_152242.jpg)

<iframe class="video" src="https://player.vimeo.com/video/795749915?h=768bef89b0" width="480" height="720" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="(2018) A Burn Dance: Demo"></iframe>

## resources

- [Adafruit ESP32 learning resources](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather)
  - [ESP32 pinouts](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather/pinouts)
  - [ESP32 guide to installing the Arduino IDE](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather/using-with-arduino-ide).
- [arduino-esp32/.../examples/.../RepeatTimer.ino](https://github.com/espressif/arduino-esp32/blob/master/libraries/ESP32/examples/Timer/RepeatTimer/RepeatTimer.ino)

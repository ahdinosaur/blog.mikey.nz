---
title: Solar charging station
date: 2018-01-23
tags:
---

## beginnings

as i need power for my [portable rainbows](/pixels-for-the-pixel-god), and i think i over-discharged the lithium battery i used over New Years' (oops!)...

i got a new portable 120w solar panel and a used 85Ah flooded lead acid battery, gonna make a 5v usb charging station to bring to Kiwiburn in 1.5 weeks! i'm keen for this to be my first step into learning about practical solar and battery power, even if i live day-to-day on-grid.

here's me testing what i have in the sun this morning:

![solar battery beginnings](./solar-charging-station/solar-stairs.jpg)

worked with Piet last night at [Art~Hack](https://arthack.nz) to understand how to control a battery's discharge.

![battery discharger](./solar-charging-station/solar-battery-discharge.jpg)

then Ben informed us that solar charge controllers already do this, they will shut off the "load" output when the battery is low.

if so, making a 5v usb charging station should be really easy, just get a step down buck converter and convert 12v to 5v, then fan out this power to many usb connectors.

stretch goal will be to make a nice display of the current power level, with maybe some playful messages as the power charges or discharges.

🌈 ☀

## documentation

source: https://github.com/ahdinosaur/solarmonk

### components

#### solar panel (with built-in charge controller)

[120w maxray folding solar panel](http://maxray.com.au/folding-solar-panel/)

- Max Power: 120W
- Maximum Power Tolerance: ±3%
- Open-Circuit Voltage/Voc（V): 17.5V
- Short-Circuit Current/lsc（A): 9.42
- Max Power Voltage/Vmp（V): 14.0
- Max Power Current/lmp（A): 8.57
- Power Spectications at STC: 1000w/㎡，AM1.5,CELL25℃
- Max System Voltage（V) 1000
- Max Over Current Protecting Rating（A): 15
- Weight: 12.6kg

#### battery

[12v - 85Ah deep cycle flooded lead acid battery](https://www.trademe.co.nz/Browse/Listing.aspx?id=1506593644)

> _voltage must not drop below 11v_

[guide to lead-acid batteries](http://www.itacanet.org/eng/elec/battery/battery.pdf)

> fully charged is 12.6v to 12.8v

State of Charge (approx.) | 12 Volt Battery | Volts per Cell
--- | --- | ---
100% | 12.70 | 2.12
90% | 12.50 | 2.08
80% | 12.42 | 2.07
70% | 12.32 | 2.05
60% | 12.20 | 2.03
50% | 12.06 | 2.01
40% | 11.90 | 1.98
30% | 11.75 | 1.96
20% | 11.58 | 1.93
10% | 11.31 | 1.89
0 | 10.50 | 1.75

#### battery charge reader

- BTE14-04 betamcu.cn Arduino Uno R3 Compatible
- "DF Robot" LCD Keypad Shield
- R1 resistor = 10k ohms
- R2 resistor = 820 ohms
- ceramic capacitor = 100nF
- [schottky diode](https://en.wikipedia.org/wiki/Schottky_diode)

```

12v  5v            5v
 │    │             |
R1    ⏄         ┌───┴───┐
 │    │         │       │
 ├────┼────┬────┤A1     │
 │    │    │    │       │
R2    ⏄    ═    │arduino│
 │    │    │    └───────┘
 ⏚    ⏚    ⏚

```

#### battery discharge controller

to ensure the battery is never over-discharged, we should cut off extra power when the battery reaches a low enough voltage.

#### 12v to 5v step-down (buck) converter

[step down dc-dc 9A converter (constant volts or constant amps), 5\~40v input & 1.5\~35v out](https://www.trademe.co.nz/Browse/Listing.aspx?id=1521227419)

### calculations

#### [resistive divider](https://en.wikipedia.org/wiki/Voltage_divider#Resistive_divider)

to measure the battery voltage on the microcontroller, we divide the voltage using resistors:

given

- adc input impedence =  10k ohms
  - https://electronics.stackexchange.com/a/67172
- adc reference voltage = 1.1V
  - https://www.arduino.cc/reference/en/language/functions/analog-io/analogreference/
- max battery voltage = 14V + wiggle room = ~15V

so R1 = adc input impedence = 10k ohms

(want to be as high as possible to reduce current)

calculate

```
R2 = R1 * (1 / ((Vin / Vout) - 1))
   = Rinput_impedence * (1 / ((Vmax_bat / Vref) - 1))
   = 10e3 * (1 / ((15 / 1.1) - 1))
   = 791.37
  ~= 820 ohms
```

## battery charge reading

Piet let me borrow his power supply and multimeter so i could make sense of this.

![battery charge reader](./solar-charging-station/batter-charge-reader-2.jpg)

got it working on a breadboard, then soldered to a protoboard. threw up some code to run on the Arduino with the screen.

![battery charge reader](./solar-charging-station/batter-charge-reader.jpg)

there’s a problem where the voltage being read by the Arduino is quite a bit off, i hope at least it’s consistent so i can calibrate against it. i learned that this might could be improved by investing in a good reference voltage, oh well for meow.

i also learned that batteries have wildly different voltages when charging, at rest, and discharging. in the worst case i’ll be conservative, bring a multimeter to the festival, and manually ensure that we never discharge too much power.

next up will be to put all the bits and bobs in an enclosure and at least get the 12v to 5v conversion working reliably, with 2.1mm barrel connector and usb outputs.

## ready or not, here i come!

spent the last few days detached from reality flowing like hot solder.

now have:

- 1x ["solarmonk"](https://github.com/ahdinosaur/solarmonk/tree/4f3642644c616c7b21d5efa27d84254ad5430460) controller
  - input is 12v with xt60 male connector
  - outputs
    - 5x 5v with 2.1mm dc female mount
    - 2x 5v usb female connector
- 1x ["aburndance"](https://github.com/ahdinosaur/aburndance/tree/8e14a3e7a250569f8a8f7b0db3fe1ba77b426a84) controller
  - outputs for APA102 leds
- 5x 7.5A 2.1mm male-to-male cables (of varying lengths from 2m to 15m) to re-inject power to the led strips
- 3x 25A xt60 male-to-female extensions (1x 8m and 2x 4m ish)

(apologies for using human gender terms to describe hardware connectors, is there a better alternative?)

at one point it had an arduino with a display showing the connected battery voltage and current amperage draw, _but_ last night when i should have been sleeping, i connected everything up and it didn't work. without a load, everything checked out on the multimeter great, but then with a working load (the led strips), it buggered out. since the buck converter does both constant voltage _and_ constant current, i thought maybe i had set the constant current the wrong way. so i set it all the way to one side. but it still didn't work, so i checked the voltage: 3v. when it was 5v without a load.

then i made a terrible mistake, i increased the voltage, eventually to the point where i burned the led strips _and_ the arduino. i stopped being silly and went to sleep. today i checked everything with a clear head, luckily the most important part, the buck converter, was not affected by the damage. with some debugging, i realized the voltage had dropped because the constant current was set to the lowest setting. now i _think_ everything is working for real at 5v?

here's a picture so i can say, at some point something worked:

![at some point something worked](./solar-charging-station/at-some-point-something-worked.jpg)

remains to be seen if anything will work on the paddock. ☀🔋🌈

i've learned so much! i'm learning how to do hardware in a way that is reliable and so doesn't suck when you want to play with software.

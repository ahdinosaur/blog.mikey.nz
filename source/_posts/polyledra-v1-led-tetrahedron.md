---
title: 'Polyledra V1: LED Tetrahedron'
date: 2023-02-02 11:17:34
tags:
---

a [light-emitting](https://en.wikipedia.org/wiki/Light-emitting_diode) [polyhedron](https://en.wikipedia.org/wiki/Polyhedron) [chandelier](https://en.wikipedia.org/wiki/Chandelier)

## background

after playing with [my portable rainbows](/pixels-for-the-pixel-god/), i thought about my learning objectives for the next stage of portable rainbow exploration:

- i want to go [back to the BeagleBone](https://github.com/ahdinosaur/pixelbeat/tree/bbb), but this time using Rust instead of JavaScript
- i want to get [back into 3d printing](https://github.com/ahdinosaur/prusa-mendel) for enclosures and structures
- i want to upgrade from breadboards to protoboards to custom pcb circuits, out-source soldering!
- i want to play with graphics code

i was sitting on a hill listening to music at a gathering in the forest last weekend, when i saw a 20-sided shape hanging over a stage, with fairy lights strung around the edges. ✨

i thought "what if i did the same with leds"? 🌈

i then continued to spend the rest of the festival obsessing about the shape, leds, and rust interfaces, which led to here. 🐱

## shapes

### design constraints

to simplify production, we want:

- MUST HAVE uniform length edges (easy for buying led strip channels)
- COULD HAVE uniform angle patterns  (easier for making 3d printed joints)

### [icosahedron](https://en.wikipedia.org/wiki/Regular_icosahedron)

the original gansta shape from the festival!

an icosahedron is a 20-sided shape which regular angle patterns and uniform length edges.

it's also a gyroelgonated pentagonal dipryamid (my original understanding of the shape): on the top and bottom is a [pentagonal pyramid](http://mathworld.wolfram.com/PentagonalPyramid.html), in the middle is an [pentagonal antiprism](https://en.wikipedia.org/wiki/Pentagonal_antiprism)

![icosahedron.png](./polyledra-v1-led-tetrahedron/shape-icosahedron.png)

### [octahedron](https://en.wikipedia.org/wiki/Octahedron)

![octahedron.png](./polyledra-v1-led-tetrahedron/shape-octahedron.png)

### [tetrahedron](https://en.wikipedia.org/wiki/Tetrahedron)

![tetrahedron.png](./polyledra-v1-led-tetrahedron/shape-tetrahedron.png)

### star

led strips that start a single center point and explode outwards

### candle

wrap led matrix (grids) into a cylinder

### loops

many concentric circles, like a visualization of an atom: protons in the center, electrons around

### vines

hang led strips from the top, maybe uniform to form a 3d space

## initial controller dive

### a Rust-y adventure

wow, rust is legit!

really enjoying how the compiler is so helpful.

had my first fight with the borrow checker, still am on easy mode though. had my first “spend hours writing a heap of rust code, finally compiles, and omg what it works!?”

![rusty tetrahedron](./polyledra-v1-led-tetrahedron/rusty-tetrahedron.png)

i setup a basic multi-threaded message-passing architecture based on a conversation with Matt, thanks!

i wrote some code to derive pixel positions from an abstract shape, then on each clock tick it runs a function for each pixel that receives the position and returns the color, which are then all displayed in a 3d renderer.

i think the hard part of this project for me will be the graphics part, i find graphics code sooo confusing! at the moment was able to find a library that let me create shapes in 3d space without having to dive too deep. but i’m really keen to learn how to do proper graphics code, i forgot to mention that in my learning objectives above.

### more Rust-y learnings

been making heaps of progress, yay learning rust!

![rusty tetrahedron](./polyledra-v1-led-tetrahedron/chandeledra-02-19-18.png)

- in the simulator, render points instead of cubes for performance (until [i do my own gl](https://github.com/ahdinosaur/chandeledra/issues/1))
- play with simple animated rgb scene
- learn how non-blocking doesn't make sense without an event loop
- create a scene manager to handle switching between many scenes
- hook up simulator window events so 'left' and 'right' switch previous and next scenes, respectively
- support hsl colors
- add simple rainbow scene
- support scenes to return generic iterators, to auto-convert colors without intermediate vecs

### shape walker

had a long battle with the rust borrow checker, ended up on top! 😅

then moved on to the puzzle of how to implement a shape walker. 🌈

![rainbow tetrahedron](./polyledra-v1-led-tetrahedron/rainbow-tetrahedron.gif)

### from software to 3d modeling

moving from software to 3d modeling! 📐 🚥 🔆 🌈

first going to build a [tetrahedron](https://en.wikipedia.org/wiki/Tetrahedron), so i bought 20 aluminum led strip channels, each 0.5m long.

here are the dimensions of each aluminum channel (except 500mm long):

![aluminum-channel.jpeg](&Xh5uOB4syfvrAFlRMQOsqXLlHp8C3C2n4Lt8xwbO3u8=.sha256)

the idea is to have 3 led strip channels per edge of the tetrahedron so the edges will be lit from all angles. i had this idea before but was going to start with a single channel per edge, until i talked to my friend: she noticed that since the shapes will be regular, the best effects will come from seeing the other side of the shape _through_ the shape!

with help from [@jack](@xu1rUyblTsI4ezffDlUsFiH4lrXj1vbiNqwJS0ecu0g=.ed25519), i made a 3d model of the tetrahedron connectors! 

https://github.com/ahdinosaur/chandeledra/tree/master/edge-connectors

![Screenshot_20180303_154737.png](&VW3GCekh70txZVsHYvg2tmM4VqGAlRwiY5wlVJk+CXo=.sha256) 

## getting ready for Winter Expo

![sleeping hermies](&FT0Klmzl45VThvWQIuIhmGwPoQISP+tZTduu/5frHk4=.sha256)

i guess i haven't updated the dev diary in a while... here we go! :smile_cat:

[@mix](@ye+QM09iPcDJD6YvQYjoQc7sLF/IFhmNbEqgdzQo3lQ=.ed25519) helped me with the tetrahedron angles math, my last edge connector was so wrong :triangular_ruler:

![chandeledra-vertex-structure-math.jpg](&svq2KFMCQcY30R9Sfol8hFszfJgEz7Mpx3H7eiwg+/E=.sha256)

 then i completely re-structured the vertex structure, so can fit wires inside and round the back

([scad](https://github.com/ahdinosaur/chandeledra/blob/6d7f562fed9a5393606230402887901394d0b97c/vertex-structure/cad/tetrahedron.scad), [viewable stl](https://github.com/ahdinosaur/chandeledra/blob/6d7f562fed9a5393606230402887901394d0b97c/vertex-structure/stl/tetrahedron.stl))

![chandeledra-vertex-structure-scad.png](&QiqjSn+JA6LGp+saDfFAXDUNITgoBbnr9t97/ZquBZs=.sha256)

then i made a new controller scene :sparkler:

([rs](https://github.com/ahdinosaur/chandeledra/blob/6d7f562fed9a5393606230402887901394d0b97c/controller-app/src/scene/spark.rs))

![chandeledra-spark-loop.gif](&bZKy3PJtaFB6p1Ri0mqN4QOC9JvdC7ImpP22t84OEqw=.sha256)

then i got my code running on the [Pocket Beagle](https://beagleboard.org/pocket). i love rust where i can write code on my laptop (which doesn't have access to an spi interface necessary to control the leds), then once i had it compile on my laptop (without ever running the code) there was only a small configuration change to make it actually work on the Pocket, yay compile-time type and borrow checking!

so this weekend i got the controller rust code running on the Pocket Beagle displaying on some real led hardware, with help from [@piet](@U5GvOKP/YUza9k53DSXxT0mk3PIrnyAmessvNfZl5E0=.ed25519) who introduced me to [japaric/cross](https://github.com/japaric/cross), omg so great.

![video:chandeledra-triangle.webm](&ngCyxkmqj+W5uyEXIeNSsodvVrlGTXEkoe5CsLmQh7Q=.sha256)

now i've prepared 15/18 led strips in aluminium channels, made an easy deploy script from my computer to the Pocket, setup the controller binary to run automatically when the Pocket starts, and fixed the code so it outputs pixel data for 3 "arms" per tetrahedron edge (3 arms per edge * 6 edges = 18 total arms).

![chandeledra-arms.jpg](&I1vjM2K1QB9zauXgkqRT4lyth5HKckMQyycp4oP7+u4=.sha256)

next up:

- setup power injections at regular intervals across the shape (at least 3, for 180 leds per injection)
- test the current vertex structure print actually works, tune until good

fun learning: using rust's `--release` flag led to a 10x performance increase, wow! :star2:  

keen to get this ready for the [Art~Hack Wellington Winter Expo](%ddJ1Ycp2kGz8PUVPsOWKTADL42dgYBBvPaxdCXYhKtg=.sha256). :sweat_smile: 

## continued

yesterday fixed up the edge connector model based on feedback from my friend [@jack](@xu1rUyblTsI4ezffDlUsFiH4lrXj1vbiNqwJS0ecu0g=.ed25519) who generously did a print some time ago. then played around with a new scene using noise functions, doesn't look good yet but is pretty fun to play with. :ocean:

today soldered up the [power injectors](https://www.seeedstudio.com/AllPixel-Power-Tap-Kit-p-2380.html) (had these leftover from a previous project, they connect perfectly here!) and powered up all the leds, but turns out i had an off-by-one error! notice the center point is no longer in the center. the reason was float math, `0.999996` when expecting `1`, solution was to round by a decimal place.

![chandeledra-off-by-one.jpg](&i/W5tDd3Qz6BLRZswTt1uUkv6XL5QcohOd697K+uOhw=.sha256)

then based on a tip from [@piet](@U5GvOKP/YUza9k53DSXxT0mk3PIrnyAmessvNfZl5E0=.ed25519), i sprayed the strips down with [circuit board lacquer](https://www.jaycar.co.nz/circuit-board-lacquer-spray-can/p/NA1002) so they will be less likely to short (the aluminum is anodized, but scratch under the surface and you have a conductive metal touching the copper on the strips).

then put on the diffusers and connected everything again, organized the "arms" by edge, even though it's not yet in the shape of a tetrahedron. goodness, i've never had a project be this clean and maybe even _legit_!

![video:chandeledra-pillars.webm](&XhDLMW/lpMzS9acryj+ckbStbqRi+D4dAeAh37/iICE=.sha256)

and all powered by this cute linux computer! :dog:

(and some other things, see [complete bill of materials](https://github.com/ahdinosaur/chandeledra/blob/de8ad2b9137e729acb819ddc46ce12246a832355/BOM.md))

![chandeledra-cute-pocket-beagle.jpg](&23fphbCnqRcgpA6puHBlS4A6cyrip9TKPbUvRnEa9u4=.sha256)

## more updates!

![hermies firehose](&k4CnqbWMRHuVZP3Lk8RlysuobL2BdG2U440PIUqRtaI=.sha256)

here's my new scene using 4-dimensional noise to determine colors! (`[x, y, z, time]` where time oscillates back and forth on each "beat" (TODO), slowly steps forward), got some help from Jack at #art~hack.

![video:chandeledra-glow.webm](&ONyQWVfH0NaDTs6Pp/86ZdjurI8a5FAOAei+wPSP7tI=.sha256)

then added a button to change modes, except since i didn't have an actual button i just tap the wires together. :smile_cat:

![video:chandeledra-button.webm](&dgpXMC4ZoF1ToMLH0w/7x33ZK2BEacPvb6aHQEf4Nvg=.sha256)

yesterday, thanks to the other [@jack](@xu1rUyblTsI4ezffDlUsFiH4lrXj1vbiNqwJS0ecu0g=.ed25519), got the third print of the vertex structure, third time's a charm! (actually this design needed changes, the 4th print looks good so far.)

![chandeledra-vertex-structure-print-3.jpg](&sDaUQUjaBc+V6vrYJradBOC/7EaH9PBq1Sx8Be7UNG4=.sha256)

[@mix](@ye+QM09iPcDJD6YvQYjoQc7sLF/IFhmNbEqgdzQo3lQ=.ed25519) helped me shape out the tetrahedron

![chandeledra-mix-structure.jpg](&TxESYVFUSRgIv2sR/wqB61azxBODTJFs299mF85BCi0=.sha256)

then soldered some wires and used the 4th print to assemble a partial tetrahedron, it's almost a thing!

![chandeledra-bright-in-progress.jpg](&ycBYvKH7Y4qjmMKRF7N2WRkliccfQ+QK0ExZOG2DaqY=.sha256)

in motion!

![video:chandeledra-bright-progress.webm](&w5X/+yN5lf8jw9kH8okp3X/OZpLWNuv0VCxORCGCXhU=.sha256)

i'm still in awe that any of this is working, it's more beautiful than i deserve. :sparkling_heart: 

## another splash of updates

another splash of updates! :whale2:

i disassembled the tetrahedron and brought it with me to California. :sunny: a bunch of wires soldered to the led strips broke when "unplugging" the led channels from the connector. so to make future dis-assembly and re-assembly less painful, i tried a new idea: what if the 3 led strips for a given edge connected to a edge part, and then 3 edge parts connected to a vertex part.

here's my first plug and socket design:

![chandeledra-edge-plug-v1.png](&CCpA51Me4+aBEw1JYmBCBPOYSWu6L4oTBMAmbN4fnY0=.sha256)
![chandeledra-vertex-socket-v1.png](&Cwp0wDo8aM7DthSpeC2uiS9NBvw9twn9aJSwkk2F7ag=.sha256)

the "plug" design here was especially bad because a 3d printed part gets strength from horizontal, not vertical. so while i could connected the "plug" into the "socket", given the lack of tolerance i pushed them tightly together and *snap* the "plug" broke off.

and then i realized, this is what threaded bolts :nut_and_bolt: are for:

![chandeledra-edge-plug-v2.png](&yQ5CvP/vRX+7JwTkIi1OcD96L1RrciK64bQmHx8ZBrI=.sha256)
![chandeledra-vertex-socket-v2.png](&ujpnDxVb6SkhEIA18A0K7eP07i6Qgz+HdVrmtdRPuKU=.sha256)

with this design, the edges are meant to be portable as units, so i discovered hot glue on both sides to prevent the wire connection from breaking and to keep out dust. :rainbow:

![chandeledra-reassembly.jpg](&is3Heka2cpUmatC1Q1FONDzXK3Kd9Lc5kqaUBgqHPo0=.sha256)

then to bring to Burning Man, i found a bag and added 2 portable usb power packs, :battery:

![chandeledra-usb-battery-pack.jpg](&395hxjPeyhuklfBVFs6a/6IWnfPGTITuOmsaWfPoWIU=.sha256)

added copious amounts of tape, to robustify the setup in danger of my lack of repair tooling,

and hung the polyledra as a chandelier from rope :snake:

![chandeledra-hanging.jpg](&RQLZA8M9wTgHWJVjcZZF+mMhAxnIwbFUKODN7AGx2/A=.sha256)

and later at the burn, tied to my bike :bike:

![chandeledra-bike.jpg](&u5gwfb3+Cts2dlyyJ55489803nMKfUJYGJH0nDcLhG8=.sha256)

this all landed swimmingly,

- nothing went wrong at the burn
- the batteries lasted all night, no problem
- one vertex part broke, but the tape kept everything together, as if nothing happened
- worked well
  - hanging from rope at our home camp
  - dancing with me and flowing around
  - riding on a bike

yay! :dancer:

then dis-assembled to bring back to New Zealand (during which time another two vertex parts broke), got replacements vertex parts printed at [National Library Wellington](https://natlib.govt.nz/visiting/wellington/3d-printing), and re-assembled again for [Art~Hack Spring Expo / Maker Faire Wellington](%6Ilk4nnK2vwjcU7LR24D6Uzh+gJcpfBSYo4qHc6QJsU=.sha256).

now to get ready for [I-Can't-Believe-It's-Not-Kiwiburn](%vSOvb4370qJ+ANrEk69mFJM2tIBd+5Xoq+3PLcA6cYU=.sha256):

- replace the wires with custom pcbs
  - 1 per vertex
  - 2 per edge (one on each side)
- fix the strength of the vertex part (by splitting the angle into a separate part which is printed sideways)
- make it waterproof (ready for the New Zealand outdoors)
- more frequent power injection (something goes wrong at higher power)

to be continued... :ghost: 

## rambles to share

gosh this diary is always behind my actual progress, anyways, here's a heap of rambles to share! :gift_heart:

i figured that printing a custom PCB was highest priority, because the time between iterations could be up to a month, if i needed to have something printed overseas.

okay, i played with KiCad before, i liked what it was doing but i didn't like using the graphical interface, i wanted to think in terms of math (code). i was used to using OpenSCAD for my 3d modelling, i was used to writing code for physical objects, why not code for circuits?

i quickly realized KiCad used [S-expressions](https://en.wikipedia.org/wiki/S-expression) to represent PCB components and boards. what if i wrote JavaScript which a read JavaScript config to generate a Kicad file?

so yeah: i made [`jseda`](https://github.com/ahdinosaur/jseda) & [`sexprs`](https://github.com/ahdinosaur/sexprs) :heart_eyes_cat:

and made my first circuit with code:

![first-jseda-polyledra-edge-a.png](&0IJR+X+rO2UiKBoXdeSBv1zPUj+/o2ckxNUIoLDoDd8=.sha256)

which later became refined to the 4 circuits i need:

_edge, side a_:

![polyledra-jseda-circuit-edge-a.png](&pIQcm3TIhgNOcY3Yz4mSpazWcieEjtB0IVMvOwL8fUw=.sha256)

_edge, side b_:

![polyledra-jseda-circuit-edge-b.png](&Adw/XpM/oEmzH17h3bLK+44s9uvGV6Kfr6sE6T6RePM=.sha256)

_tetrahedron vertex_:

![polyledra-jseda-circuit-tetrahedron-vertex.png](&hoXArQDUaH2RHl1BeJ8tv1UJIsILqZ8gDlF+mRCQtPA=.sha256)

_octahedron vertex_:

![polyledra-jseda-circuit-octahedron-vertex.png](&ks0RDIPCU6wIm/aMZ8dtS1jgFsje+NNqgZpFisIROEA=.sha256)

in this time i discovered that my whole time in Wellington (~4 years), during which time i lamented the lack of a local hackerspace, there has been a publicly-available Fab Lab: [Fab Lab Wgtn](https://fablabwgtn.co.nz/), complete with 3D printers, laser cutters, multiple CNC machines, a PCB mill, and more. :yum:

so i was hoping to prototype my circuits on the mill, even got help from [@Craig](@MMSZRtM4HGcRsF/lIJBWLN95Lvl+sIuFeh9ulkIndbY=.ed25519) to use the mill. i ended up procrastinating on that front, so while the clock was ticking and the festivals approaching i decided to place my bets on my design and get my circuits made from [Seeed Studios](https://seeedstudio.com/).

today the circuits arrived, along with 3D prints i outsourced to be printed with PETG (stronger and more weatherproof than PLA)!

![polyledra-circuits.jpg](&YYVUQucJox2F9u50VvHQhIuWSWqGZ7YGpK6G2dfJDGQ=.sha256)

so far everything looks sweet as, i'm very excited. :blush: if everything checks out, i'll be able to make a few more tetrahedrons, maybe an octahedron, with far better structural and electrical reliability than my current prototype, yay! :dancer:

## 3d printers are happy

before i learned about Fab Lab Wgtn, i bought a 3D printer, which took a few months to arrive but finally did, it's amaze. back in the day i built a [Prusa Mendel](https://reprap.org/wiki/Prusa_Mendel) from a kit, which at the time i knew meant that my time and energy would be focused on the 3D printer itself. these days i wanted to focus on 3D printing, and Josef Prusa made a company selling their printers, so i bought a pre-assembled [Prusa i3 MK3](https://shop.prusa3d.com/en/17-3d-printers), i couldn't be happier. :nut_and_bolt:

![dinosaur-prusa-i3-mk3-3d-printer.jpg](&Vx8U+ITziXbBCInY7MWweOx2L9L6s5Nrwfv8D0BpRf8=.sha256)

meanwhile, i had a new idea to fix the vertex part, again keeping in the mind that the strength in a 3d printed part is printed layer by layer:

https://youtu.be/SyXvFngkf1Q

![video:cubic-prusa-slic3r-infill.mp4](&S12O3lmenWRQI3nrOhK8S40EYDck6051NZj0+TcrDqs=.sha256)

instead of printing the angles of the vertex part as one, i made a separate part with the angle, to be printed on the side, maximizing strength. :muscle:

![polyledra-structure-vertex-angle.png](&/FjmSbT1Rc0ROnAu+iaYOtAC0xv4UHq2cB4icNM3ciQ=.sha256)

it worked, but meant i'd have another 3 sets of connectors to keep everything together. after some time exploring this new approach, i went back to the old approach and while not perfect i think it's stronger than my last design and good enough for my purposes.

![polyledra-structure-vertex-angle.png](&s3i13FcMV8pnqJ/Te0ibR4Lw70IzY2t1VFpleCKkifo=.sha256)

while i've been printing away, i ended up with PLA prototypes, wondering what to do with them. PLA is technically compostable and recyclable, but in practice you need a industrial composter (which is not available here in Wellington) and most recycling systems don't accept PLA. despite this reality, PLA is commonly used by your eco-friendly cafes as "compostable" coffee lids. anyways, i've started re-using my PLA prototypes to make party jewelry, which has been working really well because my 3D designs are very symmetric and have appealing features (like the edge connector can look like a few faces, depending on how you angle it).

during this time, i also discovered an [OpenSCAD library for polyhedra](https://github.com/benjamin-edward-morgan/openscad-polyhedra), which let me visualize the entire tetrahedron, with all the parts put together:
 
![polyledra-tetrahedron.png](&fN88/5rqMx9lAa64xojWxbcGzZn4na0BxqxqfTR5J8Q=.sha256)

oh, also i went down a side quest in the search for waterproofing, discovered the magic of o-rings and how they are used everywhere, i had no idea! i played around with making custom o-rings from making 3d models of molds to fill with rubber, haven't given this a hoon yet though.

![polyledra-o-gon.png](&tuy3e0A7M625f0Jc1H+/w1GVfO49rj/BbiezlghaQKM=.sha256)

alright, that's all i have to share meow. :smiley_cat:    

## next iteration

so far the next iteration of the tetrahedron is going well! :rainbow:

(not pictured: all the time spent making a mess in the empty office while assembling and listening to drum & bass, or when i soldered things backwards and had to unsolder everything, or when twice i plugged the power plugs backwards (+5V into GND and vise versa) causing the wires to rapidly melt and burn)

![polyledra-two-edges.jpg](&Mo1yqrtazpZfvhWA4VUCiys8aRRqB0ISrNvpjexr2XI=.sha256)

![polyledra-tetrahedron-circuits.jpg](&XhpQfO0IBSh4wZcs9hQWB0diNM6pZvmH9Hx10s0rKWM=.sha256)

![polyledra-edges.jpg](&QfSEknd23zpTSztLaTJgHXIP/1ZC9bMHFXRZThfnBrc=.sha256)

![polyledra-partial-tetrahedron.jpg](&bjSOg0N/8+RRCy5wr9AokGx7MLhrGfo62NuUHH1fAv0=.sha256)

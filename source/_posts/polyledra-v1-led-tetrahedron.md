---
title: 'Polyledra V1: LED Tetrahedron'
date: 2023-02-02 11:17:34
categories:
  - projects
tags:
  - project
  - led
---

a [light-emitting](https://en.wikipedia.org/wiki/Light-emitting_diode) [polyhedron](https://en.wikipedia.org/wiki/Polyhedron) [chandelier](https://en.wikipedia.org/wiki/Chandelier)

source: [`ahdinosaur/polyledra-v1`](https://github.com/ahdinosaur/polyledra-v1)

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

![aluminium-channel.jpg](./polyledra-v1-led-tetrahedron/aluminium-channel.jpg)

the idea is to have 3 led strip channels per edge of the tetrahedron so the edges will be lit from all angles. i had this idea before but was going to start with a single channel per edge, until i talked to my friend: she noticed that since the shapes will be regular, the best effects will come from seeing the other side of the shape _through_ the shape!

with help from Jack, i made a 3d model of the tetrahedron connectors! 

![Screenshot_20180303_154737.png](./polyledra-v1-led-tetrahedron/Screenshot_20180303_154737.png) 

## getting ready for Winter Expo

i guess i haven't updated the dev diary in a while... here we go! :smile_cat:

Mix helped me with the tetrahedron angles math, my last edge connector was so wrong 📐

![chandeledra-vertex-structure-math.jpg](./polyledra-v1-led-tetrahedron/chandeledra-vertex-structure-math.jpg)

 then i completely re-structured the vertex structure, so can fit wires inside and round the back

([scad](https://github.com/ahdinosaur/polyledra-v1/blob/6d7f562fed9a5393606230402887901394d0b97c/vertex-structure/cad/tetrahedron.scad), [viewable stl](https://github.com/ahdinosaur/polyledra-v1/blob/6d7f562fed9a5393606230402887901394d0b97c/vertex-structure/stl/tetrahedron.stl))

![chandeledra-vertex-structure-scad.png](./polyledra-v1-led-tetrahedron/chandeledra-vertex-structure-scad.png)

then i made a new controller scene 🎇

([rs](https://github.com/ahdinosaur/chandeledra/blob/6d7f562fed9a5393606230402887901394d0b97c/controller-app/src/scene/spark.rs))

![chandeledra-spark-loop.gif](./polyledra-v1-led-tetrahedron/chandeledra-spark-loop.gif)

then i got my code running on the [Pocket Beagle](https://beagleboard.org/pocket). i love Rust where i can write code on my laptop (which doesn't have access to an spi interface necessary to control the leds), then once i had it compile on my laptop (without ever running the code) there was only a small configuration change to make it actually work on the Pocket, yay compile-time type and borrow checking!

so this weekend i got the controller rust code running on the Pocket Beagle displaying on some real led hardware, with help from Piet who introduced me to [japaric/cross](https://github.com/japaric/cross), omg so great.

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795754043?h=d35915c222" data-title="(2018-06-02) Polyledra v1: Work In Progress"></div>

now i've prepared 15/18 led strips in aluminium channels, made an easy deploy script from my computer to the Pocket, setup the controller binary to run automatically when the Pocket starts, and fixed the code so it outputs pixel data for 3 "arms" per tetrahedron edge (3 arms per edge * 6 edges = 18 total arms).

![chandeledra arms](./polyledra-v1-led-tetrahedron/chandeledra-arms.jpg)

next up:

- setup power injections at regular intervals across the shape (at least 3, for 180 leds per injection)
- test the current vertex structure print actually works, tune until good

fun learning: using rust's `--release` flag led to a 10x performance increase, wow! 🌟

keen to get this ready for the [Art~Hack Wellington Winter Expo](https://tube.arthack.nz/videos/watch/752e1176-8854-47b5-8055-ca861b1b6fe0). 😅

## continued

yesterday fixed up the edge connector model based on feedback from my friend Jack who generously did a print some time ago. then played around with a new scene using noise functions, doesn't look good yet but is pretty fun to play with.  🌊

today soldered up the [power injectors](https://www.seeedstudio.com/AllPixel-Power-Tap-Kit-p-2380.html) (had these leftover from a previous project, they connect perfectly here!) and powered up all the leds, but turns out i had an off-by-one error! notice the center point is no longer in the center. the reason was float math, `0.999996` when expecting `1`, solution was to round by a decimal place.

![chandeledra off by one](./polyledra-v1-led-tetrahedron/chandeledra-off-by-one.jpg)

then based on a tip from Piet, i sprayed the strips down with [circuit board lacquer](https://www.jaycar.co.nz/circuit-board-lacquer-spray-can/p/NA1002) so they will be less likely to short (the aluminum is anodized, but scratch under the surface and you have a conductive metal touching the copper on the strips).

then put on the diffusers and connected everything again, organized the "arms" by edge, even though it's not yet in the shape of a tetrahedron. goodness, i've never had a project be this clean and maybe even _legit_!

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795754074?h=b4f0cc9d77" data-title="(2018-06-04) Polyledra v1: Work In Progress"></div>

and all powered by this cute linux computer! 🐶

(and some other things, see [complete bill of materials](https://github.com/ahdinosaur/chandeledra/blob/de8ad2b9137e729acb819ddc46ce12246a832355/BOM.md))

![chandeledra cute pocket beagle](./polyledra-v1-led-tetrahedron/chandeledra-cute-pocket-beagle.jpg)

## more updates!

here's my new scene using 4-dimensional noise to determine colors! (`[x, y, z, time]` where time oscillates back and forth on each "beat" (TODO), slowly steps forward), got some help from Jack at [Art~Hack](https://arthack.nz).

<video autoplay loop>
  <source src="/polyledra-v1-led-tetrahedron/chandeledra-glow.webm" />
</video>

then added a button to change modes, except since i didn't have an actual button i just tap the wires together. 😸

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795754109?h=c766eaca31" data-title="(2018-06-07) Polyledra v1: Work In Progress"></div>

yesterday, thanks to the other Jack, got the third print of the vertex structure, third time's a charm! (actually this design needed changes, the 4th print looks good so far.)

![chandeledra vertex structure print 3](./polyledra-v1-led-tetrahedron/chandeledra-vertex-structure-print-3.jpg)

Mix helped me shape out the tetrahedron:

![chandeledra mix structure](./polyledra-v1-led-tetrahedron/chandeledra-mix-structure.jpg)

then soldered some wires and used the 4th print to assemble a partial tetrahedron, it's almost a thing!

![chandeledra bright in progress](./polyledra-v1-led-tetrahedron/chandeledra-bright-in-progress.jpg)

in motion!

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795754216?h=0c7296dc2b" data-title="(2018-06-09) Polyledra v1: Work In Progress"></div>

i'm still in awe that any of this is working, it's more beautiful than i deserve. 💖

## demo

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795507373?h=f6ab7523c6" data-title="(2018-06-29) Polyledra v1: Demo"></div>

## another splash of updates

another splash of updates! 🐋

i disassembled the tetrahedron and brought it with me to California. ☀ a bunch of wires soldered to the led strips broke when "unplugging" the led channels from the connector. so to make future dis-assembly and re-assembly less painful, i tried a new idea: what if the 3 led strips for a given edge connected to a edge part, and then 3 edge parts connected to a vertex part.

here's my first plug and socket design:

![chandeledra edge plug v1](./polyledra-v1-led-tetrahedron/chandeledra-edge-plug-v1.png)
![chandeledra vertex socket v1](./polyledra-v1-led-tetrahedron/chandeledra-vertex-socket-v1.png)

the "plug" design here was especially bad because a 3d printed part gets strength from horizontal, not vertical. so while i could connected the "plug" into the "socket", given the lack of tolerance i pushed them tightly together and *snap* the "plug" broke off.

and then i realized, this is what threaded bolts 🔩 are for:

![chandeledra edge plug v2](./polyledra-v1-led-tetrahedron/chandeledra-edge-plug-v2.png)
![chandeledra vertex socket v2](./polyledra-v1-led-tetrahedron/chandeledra-vertex-socket-v2.png)

with this design, the edges are meant to be portable as units, so i discovered hot glue on both sides to prevent the wire connection from breaking and to keep out dust. 🌈

![chandeledra reassembly](./polyledra-v1-led-tetrahedron/chandeledra-reassembly.jpg)

then to bring to Burning Man, i found a bag and added 2 portable usb power packs, 🔋

![chandeledra usb battery pack](./polyledra-v1-led-tetrahedron/chandeledra-usb-battery-pack.jpg)

added copious amounts of tape, to robustify the setup in danger of my lack of repair tooling,

and hung the polyledra as a chandelier from rope 🐍


![chandeledra-hanging.jpg](./polyledra-v1-led-tetrahedron/chandeledra-hanging.jpg)

and later at the burn, tied to my bike 🚲

![chandeledra-bike.jpg](./polyledra-v1-led-tetrahedron/chandeledra-bike.jpg)

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796157114?h=123cc74709" data-title="(2018-09-02) Polyledra v1: Burning Man"></div>

this all landed swimmingly,

- nothing went wrong at the burn
- the batteries lasted all night, no problem
- one vertex part broke, but the tape kept everything together, as if nothing happened
- worked well
  - hanging from rope at our home camp
  - dancing with me and flowing around
  - riding on a bike

yay! 💃

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796157718?h=008898648a" data-title="(2018-10-02) Polyledra v1: Demo"></div>

then dis-assembled to bring back to New Zealand (during which time another two vertex parts broke), got replacements vertex parts printed at [National Library Wellington](https://natlib.govt.nz/visiting/wellington/3d-printing), and re-assembled again for Art~Hack Spring Expo / Maker Faire Wellington.

![Art~Hack Spring Expo / Maker Faire Wellington](./polyledra-v1-led-tetrahedron/arthack-spring-expo-maker-faire.jpg)

now to get ready for "I-Can't-Believe-It's-Not-Kiwiburn":

- replace the wires with custom pcbs
  - 1 per vertex
  - 2 per edge (one on each side)
- fix the strength of the vertex part (by splitting the angle into a separate part which is printed sideways)
- make it waterproof (ready for the New Zealand outdoors)
- more frequent power injection (something goes wrong at higher power)

## rambles to share

i figured that printing a custom PCB was highest priority, because the time between iterations could be up to a month, if i needed to have something printed overseas.

okay, i played with KiCad before, i liked what it was doing but i didn't like using the graphical interface, i wanted to think in terms of math (code). i was used to using OpenSCAD for my 3d modelling, i was used to writing code for physical objects, why not code for circuits?

i quickly realized KiCad used [S-expressions](https://en.wikipedia.org/wiki/S-expression) to represent PCB components and boards. what if i wrote JavaScript which a read JavaScript config to generate a Kicad file?

so yeah: i made [`jseda`](https://github.com/ahdinosaur/jseda) & [`sexprs`](https://github.com/ahdinosaur/sexprs) 😻

and made my first circuit with code:

![first-jseda-polyledra-edge-a.png](./polyledra-v1-led-tetrahedron/first-jseda-polyledra-edge-a.png)

which later became refined to the 4 circuits i need:

_edge, side a_:

![polyledra-jseda-circuit-edge-a.png](./polyledra-v1-led-tetrahedron/polyledra-jseda-circuit-edge-a.png)

_edge, side b_:

![polyledra-jseda-circuit-edge-b.png](./polyledra-v1-led-tetrahedron/polyledra-jseda-circuit-edge-b.png)

_tetrahedron vertex_:

![polyledra-jseda-circuit-tetrahedron-vertex.png](./polyledra-v1-led-tetrahedron/polyledra-jseda-circuit-tetrahedron-vertex.png)

_octahedron vertex_:

![polyledra-jseda-circuit-octahedron-vertex.png](./polyledra-v1-led-tetrahedron/polyledra-jseda-circuit-octahedron-vertex.png)

in this time i discovered that my whole time in Wellington (~4 years), during which time i lamented the lack of a local hackerspace, there has been a publicly-available Fab Lab: [Fab Lab Wgtn](https://fablabwgtn.co.nz/), complete with 3D printers, laser cutters, multiple CNC machines, a PCB mill, and more. :yum:

so i was hoping to prototype my circuits on the mill, even got help from Craig to use the mill. i ended up procrastinating on that front, so while the clock was ticking and the festivals approaching i decided to place my bets on my design and get my circuits made from [Seeed Studios](https://seeedstudio.com/).

today the circuits arrived, along with 3D prints i outsourced to be printed with PETG (stronger and more weatherproof than PLA)!

![polyledra-circuits.jpg](./polyledra-v1-led-tetrahedron/polyledra-circuits.jpg)

so far everything looks sweet as, i'm very excited. :blush: if everything checks out, i'll be able to make a few more tetrahedrons, maybe an octahedron, with far better structural and electrical reliability than my current prototype, yay! 💃

## 3d printers are happy

before i learned about Fab Lab Wgtn, i bought a 3D printer, which took a few months to arrive but finally did, it's amaze. back in the day i built a [Prusa Mendel](https://reprap.org/wiki/Prusa_Mendel) from a kit, which at the time i knew meant that my time and energy would be focused on the 3D printer itself. these days i wanted to focus on 3D printing, and Josef Prusa made a company selling their printers, so i bought a pre-assembled [Prusa i3 MK3](https://shop.prusa3d.com/en/17-3d-printers), i couldn't be happier. :nut_and_bolt:

![dinosaur-prusa-i3-mk3-3d-printer.jpg](./polyledra-v1-led-tetrahedron/dinosaur-prusa-i3-mk3-3d-printer.jpg)

meanwhile, i had a new idea to fix the vertex part, again keeping in the mind that the strength in a 3d printed part is printed layer by layer:

https://youtu.be/SyXvFngkf1Q

instead of printing the angles of the vertex part as one, i made a separate part with the angle, to be printed on the side, maximizing strength. :muscle:

![polyledra-structure-vertex-angle.png](./polyledra-v1-led-tetrahedron/polyledra-structure-vertex-angle.png)

it worked, but meant i'd have another 3 sets of connectors to keep everything together. after some time exploring this new approach, i went back to the old approach and while not perfect i think it's stronger than my last design and good enough for my purposes.

![polyledra-structure-vertex-angle-2.png](./polyledra-v1-led-tetrahedron/polyledra-structure-vertex-angle-2.png)

while i've been printing away, i ended up with PLA prototypes, wondering what to do with them. PLA is technically compostable and recyclable, but in practice you need a industrial composter (which is not available here in Wellington) and most recycling systems don't accept PLA. despite this reality, PLA is commonly used by your eco-friendly cafes as "compostable" coffee lids. anyways, i've started re-using my PLA prototypes to make party jewelry, which has been working really well because my 3D designs are very symmetric and have appealing features (like the edge connector can look like a few faces, depending on how you angle it).

during this time, i also discovered an [OpenSCAD library for polyhedra](https://github.com/benjamin-edward-morgan/openscad-polyhedra), which let me visualize the entire tetrahedron, with all the parts put together:
 
![polyledra-tetrahedron-2.png](./polyledra-v1-led-tetrahedron/polyledra-tetrahedron-2.png)

oh, also i went down a side quest in the search for waterproofing, discovered the magic of o-rings and how they are used everywhere, i had no idea! i played around with making custom o-rings from making 3d models of molds to fill with rubber, haven't given this a hoon yet though.

![polyledra-o-gon.png](./polyledra-v1-led-tetrahedron/polyledra-o-gon.png)

## next iteration

so far the next iteration of the tetrahedron is going well! 🌈

(not pictured: all the time spent making a mess in the empty office while assembling and listening to drum & bass, or when i soldered things backwards and had to unsolder everything, or when twice i plugged the power plugs backwards (+5V into GND and vise versa) causing the wires to rapidly melt and burn))

![polyledra-two-edges.jpg](./polyledra-v1-led-tetrahedron/polyledra-two-edges.jpg)

![polyledra-tetrahedron-circuits.jpg](./polyledra-v1-led-tetrahedron/polyledra-tetrahedron-circuits.jpg)

![polyledra-edges.jpg](./polyledra-v1-led-tetrahedron/polyledra-edges.jpg)

![polyledra-partial-tetrahedron.jpg](./polyledra-v1-led-tetrahedron/polyledra-partial-tetrahedron.jpg)

![polyledra-tetrahedron-3.jpg](./polyledra-v1-led-tetrahedron/polyledra-tetrahedron-3.jpg)

![polyledra-tetrahedron-4.jpg](./polyledra-v1-led-tetrahedron/polyledra-tetrahedron-4.jpg)

## twisted

![polyledra-twisted.jpg](./polyledra-v1-led-tetrahedron/polyledra-twisted.jpg)

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796156160?h=ebc56605c9" data-title="(2019-01-01) Polyledra v1: Twisted"></div>

## nowhere

![nowhere renegade](./polyledra-v1-led-tetrahedron/nowhere-renegade.gif)

## double trouble

![polyledra all the pcbs](./polyledra-v1-led-tetrahedron/polyledra-all-the-pcbs-1.jpg)

![polyledra all the pcbs](./polyledra-v1-led-tetrahedron/polyledra-all-the-pcbs-2.jpg)

![polyledra double trouble](./polyledra-v1-led-tetrahedron/polyledra-double-trouble.jpg)

## "I-Can't-Believe-It's-Not-Kiwiburn"

![ignition abundance](./polyledra-v1-led-tetrahedron/ignition-abundance.jpg)

![ignition night](./polyledra-v1-led-tetrahedron/ignition-night.jpg)

## scuttle camp

![scuttle camp](./polyledra-v1-led-tetrahedron/scuttle-camp.jpg)

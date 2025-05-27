---
title: 'Polyledra v1: LED tetrahedron'
date: 2019-02-27
image: /polyledra-v1-led-tetrahedron/polyledra-tetrahedron-3.jpg
categories:
  - projects
tags:
  - project
  - led
---

A [light-emitting](https://en.wikipedia.org/wiki/Light-emitting_diode) [polyhedron](https://en.wikipedia.org/wiki/Polyhedron) [chandelier](https://en.wikipedia.org/wiki/Chandelier)

<!-- more -->

Source: [`ahdinosaur/polyledra-v1`](https://github.com/ahdinosaur/polyledra-v1)

## Background

After playing with [my portable rainbows](/pixels-for-the-pixel-god/), I thought about my learning objectives for the next stage of portable rainbow exploration:

- I want to go [back to the BeagleBone](https://github.com/ahdinosaur/pixelbeat/tree/bbb), but this time using Rust instead of JavaScript
- I want to get [back into 3d printing](https://github.com/ahdinosaur/prusa-mendel) for enclosures and structures
- I want to upgrade from breadboards to protoboards to custom pcb circuits, out-source soldering!
- I want to play with graphics code

I was sitting on a hill listening to music at a gathering in the forest last weekend, when I saw a 20-sided shape hanging over a stage, with fairy lights strung around the edges. ✨

I thought "what if I did the same with leds"? 🌈

I then continued to spend the rest of the festival obsessing about the shape, leds, and rust interfaces, which led to here. 🐱

## Shapes

### Design constraints

To simplify production, we want:

- MUST HAVE uniform length edges (easy for buying led strip channels)
- COULD HAVE uniform angle patterns  (easier for making 3d printed joints)

### [Icosahedron](https://en.wikipedia.org/wiki/Regular_icosahedron)

The original gansta shape from the festival!

An icosahedron is a 20-sided shape which regular angle patterns and uniform length edges.

It's also a gyroelgonated pentagonal dipryamid (my original understanding of the shape): on the top and bottom is a [pentagonal pyramid](http://mathworld.wolfram.com/PentagonalPyramid.html), in the middle is an [pentagonal antiprism](https://en.wikipedia.org/wiki/Pentagonal_antiprism)

![icosahedron.png](/polyledra-v1-led-tetrahedron/shape-icosahedron.png)

### [Octahedron](https://en.wikipedia.org/wiki/Octahedron)

![octahedron.png](/polyledra-v1-led-tetrahedron/shape-octahedron.png)

### [Tetrahedron](https://en.wikipedia.org/wiki/Tetrahedron)

![tetrahedron.png](/polyledra-v1-led-tetrahedron/shape-tetrahedron.png)

## Initial controller dive

### A Rust-y adventure

Wow, Rust is legit!

Really enjoying how the compiler is so helpful.

Had my first fight with the borrow checker, still am on easy mode though. Had my first “spend hours writing a heap of rust code, finally compiles, and omg what it works!?”

![rusty tetrahedron](/polyledra-v1-led-tetrahedron/rusty-tetrahedron.png)

I setup a basic multi-threaded message-passing architecture based on a conversation with Matt, thanks!

I wrote some code to derive pixel positions from an abstract shape, then on each clock tick it runs a function for each pixel that receives the position and returns the color, which are then all displayed in a 3d renderer.

I think the hard part of this project for me will be the graphics part, I find graphics code sooo confusing! At the moment was able to find a library that let me create shapes in 3d space without having to dive too deep. But I'm really keen to learn how to do proper graphics code, I forgot to mention that in my learning objectives above.

### More Rust-y learnings

Been making heaps of progress, yay learning Rust!

![rusty tetrahedron](/polyledra-v1-led-tetrahedron/chandeledra-02-19-18.png)

- in the simulator, render points instead of cubes for performance (until [I do my own gl](https://github.com/ahdinosaur/chandeledra/issues/1))
- play with simple animated rgb scene
- learn how non-blocking doesn't make sense without an event loop
- create a scene manager to handle switching between many scenes
- hook up simulator window events so 'left' and 'right' switch previous and next scenes, respectively
- support hsl colors
- add simple rainbow scene
- support scenes to return generic iterators, to auto-convert colors without intermediate vecs

### Shape walker

Had a long battle with the Rust borrow checker, ended up on top! 😅

Then moved on to the puzzle of how to implement a shape walker. 🌈

![rainbow tetrahedron](/polyledra-v1-led-tetrahedron/rainbow-tetrahedron.gif){width=489 height=475}

### From software to 3D modeling

Moving from software to 3D modeling! 📐 🚥 🔆 🌈

First going to build a [tetrahedron](https://en.wikipedia.org/wiki/Tetrahedron), so I bought 20 aluminum led strip channels, each 0.5m long.

Here are the dimensions of each aluminum channel (except 500mm long):

![aluminium-channel.jpg](/polyledra-v1-led-tetrahedron/aluminium-channel.jpg)

The idea is to have 3 led strip channels per edge of the tetrahedron so the edges will be lit from all angles. I had this idea before but was going to start with a single channel per edge, until I talked to my friend: she noticed that since the shapes will be regular, the best effects will come from seeing the other side of the shape _through_ the shape!

With help from Jack, I made a 3d model of the tetrahedron connectors!

![Screenshot_20180303_154737.png](/polyledra-v1-led-tetrahedron/Screenshot_20180303_154737.png)

## Getting ready for Winter Expo

Mix helped me with the tetrahedron angles math, my last edge connector was so wrong 📐

![chandeledra-vertex-structure-math.jpg](/polyledra-v1-led-tetrahedron/chandeledra-vertex-structure-math.jpg)

Then I completely re-structured the vertex structure, so can fit wires inside and round the back

([scad](https://github.com/ahdinosaur/polyledra-v1/blob/6d7f562fed9a5393606230402887901394d0b97c/vertex-structure/cad/tetrahedron.scad), [viewable stl](https://github.com/ahdinosaur/polyledra-v1/blob/6d7f562fed9a5393606230402887901394d0b97c/vertex-structure/stl/tetrahedron.stl))

![chandeledra-vertex-structure-scad.png](/polyledra-v1-led-tetrahedron/chandeledra-vertex-structure-scad.png)

Then I made a new controller scene 🎇

([rs](https://github.com/ahdinosaur/chandeledra/blob/6d7f562fed9a5393606230402887901394d0b97c/controller-app/src/scene/spark.rs))

![chandeledra-spark-loop.gif](/polyledra-v1-led-tetrahedron/chandeledra-spark-loop.gif){width=450 height=516}

Then I got my code running on the [Pocket Beagle](https://beagleboard.org/pocket). I love Rust where I can write code on my laptop (which doesn't have access to an spi interface necessary to control the leds), then once I had it compile on my laptop (without ever running the code) there was only a small configuration change to make it actually work on the Pocket, yay compile-time type and borrow checking!

So this weekend I got the controller rust code running on the Pocket Beagle displaying on some real led hardware, with help from Piet who introduced me to [japaric/cross](https://github.com/japaric/cross), OMG so great.

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795754043?h=d35915c222&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-06-02) Polyledra v1: Work In Progress"></div>

Now I've prepared 15/18 led strips in aluminium channels, made an easy deploy script from my computer to the Pocket, setup the controller binary to run automatically when the Pocket starts, and fixed the code so it outputs pixel data for 3 "arms" per tetrahedron edge (3 arms per edge * 6 edges = 18 total arms).

![chandeledra arms](/polyledra-v1-led-tetrahedron/chandeledra-arms.jpg)

Next up:

- setup power injections at regular intervals across the shape (at least 3, for 180 leds per injection)
- test the current vertex structure print actually works, tune until good

Fun learning: using rust's `--release` flag led to a 10x performance increase, wow! 🌟

Keen to get this ready for the [Art~Hack Wellington Winter Expo](https://tube.arthack.nz/videos/watch/752e1176-8854-47b5-8055-ca861b1b6fe0). 😅

## Continued

Yesterday fixed up the edge connector model based on feedback from my friend Jack who generously did a print some time ago. then played around with a new scene using noise functions, doesn't look good yet but is pretty fun to play with.  🌊

Today soldered up the [power injectors](https://www.seeedstudio.com/AllPixel-Power-Tap-Kit-p-2380.html) (had these leftover from a previous project, they connect perfectly here!) and powered up all the leds, but turns out I had an off-by-one error! Notice the center point is no longer in the center. The reason was float math, `0.999996` when expecting `1`, solution was to round by a decimal place.

![chandeledra off by one](/polyledra-v1-led-tetrahedron/chandeledra-off-by-one.jpg)

Then based on a tip from Piet, I sprayed the strips down with [circuit board lacquer](https://www.jaycar.co.nz/circuit-board-lacquer-spray-can/p/NA1002) so they will be less likely to short (the aluminum is anodized, but scratch under the surface and you have a conductive metal touching the copper on the strips).

Then put on the diffusers and connected everything again, organized the "arms" by edge, even though it's not yet in the shape of a tetrahedron. Goodness, I've never had a project be this clean and maybe even _legit_!

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795754074?h=b4f0cc9d77&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-06-04) Polyledra v1: Work In Progress"></div>

And all powered by this cute linux computer! 🐶

(And some other things, see [complete bill of materials](https://github.com/ahdinosaur/chandeledra/blob/de8ad2b9137e729acb819ddc46ce12246a832355/BOM.md))

![chandeledra cute pocket beagle](/polyledra-v1-led-tetrahedron/chandeledra-cute-pocket-beagle.jpg)

## More updates!

Here's my new scene using 4-dimensional noise to determine colors! (`[x, y, z, time]` where time oscillates back and forth on each "beat" (TODO), slowly steps forward), got some help from Jack at [Art~Hack](https://arthack.nz).

![chandeledra glow](/polyledra-v1-led-tetrahedron/chandeledra-glow.gif){width=376 height=424}

Then added a button to change modes, except since I didn't have an actual button I just tap the wires together. 😸

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795754109?h=c766eaca31&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-06-07) Polyledra v1: Work In Progress"></div>

Yesterday, thanks to the other Jack, got the third print of the vertex structure, third time's a charm! (actually this design needed changes, the 4th print looks good so far.)

![chandeledra vertex structure print 3](/polyledra-v1-led-tetrahedron/chandeledra-vertex-structure-print-3.jpg)

Mix helped me shape out the tetrahedron:

![chandeledra mix structure](/polyledra-v1-led-tetrahedron/chandeledra-mix-structure.jpg)

Then soldered some wires and used the 4th print to assemble a partial tetrahedron, it's almost a thing!

![chandeledra bright in progress](/polyledra-v1-led-tetrahedron/chandeledra-bright-in-progress.jpg)

In motion!

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795754216?h=0c7296dc2b&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-06-09) Polyledra v1: Work In Progress"></div>

I'm still in awe that any of this is working, it's more beautiful than I deserve. 💖

## Demo

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/795507373?h=f6ab7523c6&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-06-29) Polyledra v1: Demo"></div>

## Another splash of updates

Another splash of updates! 🐋

I disassembled the tetrahedron and brought it with me to California. ☀ a bunch of wires soldered to the led strips broke when "unplugging" the led channels from the connector. So to make future dis-assembly and re-assembly less painful, I tried a new idea: what if the 3 led strips for a given edge connected to a edge part, and then 3 edge parts connected to a vertex part.

Here's my first plug and socket design:

![chandeledra edge plug v1](/polyledra-v1-led-tetrahedron/chandeledra-edge-plug-v1.png)
![chandeledra vertex socket v1](/polyledra-v1-led-tetrahedron/chandeledra-vertex-socket-v1.png)

The "plug" design here was especially bad because a 3d printed part gets strength from horizontal, not vertical. So while I could connected the "plug" into the "socket", given the lack of tolerance I pushed them tightly together and *snap* the "plug" broke off.

And then I realized, this is what threaded bolts 🔩 are for:

![chandeledra edge plug v2](/polyledra-v1-led-tetrahedron/chandeledra-edge-plug-v2.png)
![chandeledra vertex socket v2](/polyledra-v1-led-tetrahedron/chandeledra-vertex-socket-v2.png)

With this design, the edges are meant to be portable as units, so I discovered hot glue on both sides to prevent the wire connection from breaking and to keep out dust. 🌈

![chandeledra reassembly](/polyledra-v1-led-tetrahedron/chandeledra-reassembly.jpg)

Then to bring to Burning Man, I found a bag and added 2 portable usb power packs, 🔋

![chandeledra usb battery pack](/polyledra-v1-led-tetrahedron/chandeledra-usb-battery-pack.jpg)

Added copious amounts of tape, to robustify the setup in danger of my lack of repair tooling,

and hung the polyledra as a chandelier from rope 🐍

![chandeledra-hanging.jpg](/polyledra-v1-led-tetrahedron/chandeledra-hanging.jpg)

and later at the burn, tied to my bike. 🚲

![chandeledra-bike.jpg](/polyledra-v1-led-tetrahedron/chandeledra-bike.jpg)

<div class="video-embed" data-ratio="9:16" data-type="vimeo" data-src="https://player.vimeo.com/video/796157114?h=123cc74709&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-09-02) Polyledra v1: Burning Man"></div>

This all landed swimmingly,

- nothing went wrong at the burn
- the batteries lasted all night, no problem
- one vertex part broke, but the tape kept everything together, as if nothing happened
- worked well
  - hanging from rope at our home camp
  - dancing with me and flowing around
  - riding on a bike

Yay! 💃

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796157718?h=008898648a&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2018-10-02) Polyledra v1: Demo"></div>

Then dis-assembled to bring back to New Zealand (during which time another two vertex parts broke), got replacements vertex parts printed at [National Library Wellington](https://natlib.govt.nz/visiting/wellington/3d-printing), and re-assembled again for Art~Hack Spring Expo / Maker Faire Wellington.

![Art~Hack Spring Expo / Maker Faire Wellington](/polyledra-v1-led-tetrahedron/arthack-spring-expo-maker-faire.jpg)

Now to get ready for "I-Can't-Believe-It's-Not-Kiwiburn":

- replace the wires with custom pcbs
  - 1 per vertex
  - 2 per edge (one on each side)
- fix the strength of the vertex part (by splitting the angle into a separate part which is printed sideways)
- make it waterproof (ready for the New Zealand outdoors)
- more frequent power injection (something goes wrong at higher power)

## Rambles to share

I figured that printing a custom PCB was highest priority, because the time between iterations could be up to a month, if I needed to have something printed overseas.

Okay, I played with KiCad before, I liked what it was doing but I didn't like using the graphical interface, I wanted to think in terms of math (code). I was used to using OpenSCAD for my 3d modelling, I was used to writing code for physical objects, why not code for circuits?

I quickly realized KiCad used [S-expressions](https://en.wikipedia.org/wiki/S-expression) to represent PCB components and boards. What if I wrote JavaScript which a read JavaScript config to generate a Kicad file?

So yeah: I made [`jseda`](https://github.com/ahdinosaur/jseda) & [`sexprs`](https://github.com/ahdinosaur/sexprs) 😻

And made my first circuit with code:

![first-jseda-polyledra-edge-a.png](/polyledra-v1-led-tetrahedron/first-jseda-polyledra-edge-a.png)

Which later became refined to the 4 circuits I need:

_Edge, side a_:

![polyledra-jseda-circuit-edge-a.png](/polyledra-v1-led-tetrahedron/polyledra-jseda-circuit-edge-a.png)

_Edge, side b_:

![polyledra-jseda-circuit-edge-b.png](/polyledra-v1-led-tetrahedron/polyledra-jseda-circuit-edge-b.png)

_Tetrahedron vertex_:

![polyledra-jseda-circuit-tetrahedron-vertex.png](/polyledra-v1-led-tetrahedron/polyledra-jseda-circuit-tetrahedron-vertex.png)

_Octahedron vertex_:

![polyledra-jseda-circuit-octahedron-vertex.png](/polyledra-v1-led-tetrahedron/polyledra-jseda-circuit-octahedron-vertex.png)

In this time I discovered that my whole time in Wellington (~4 years), during which time I lamented the lack of a local hackerspace, there has been a publicly-available Fab Lab: [Fab Lab Wgtn](https://fablabwgtn.co.nz/), complete with 3D printers, laser cutters, multiple CNC machines, a PCB mill, and more. 😋

So I was hoping to prototype my circuits on the mill, even got help from Craig to use the mill. I ended up procrastinating on that front, so while the clock was ticking and the festivals approaching I decided to place my bets on my design and get my circuits made from [Seeed Studios](https://seeedstudio.com/).

Today the circuits arrived, along with 3D prints I outsourced to be printed with PETG (stronger and more weatherproof than PLA)!

![polyledra-circuits.jpg](/polyledra-v1-led-tetrahedron/polyledra-circuits.jpg)

So far everything looks sweet as, I'm very excited. 😊 if everything checks out, I'll be able to make a few more tetrahedrons, maybe an octahedron, with far better structural and electrical reliability than my current prototype, yay! 💃

## 3D printers are happy

Before I learned about Fab Lab Wgtn, I bought a 3D printer, which took a few months to arrive but finally did, it's amaze. Back in the day I built a [Prusa Mendel](https://reprap.org/wiki/Prusa_Mendel) from a kit, which at the time I knew meant that my time and energy would be focused on the 3D printer itself. These days I wanted to focus on 3D printing, and Josef Prusa made a company selling their printers, so I bought a pre-assembled [Prusa i3 MK3](https://shop.prusa3d.com/en/17-3d-printers), I couldn't be happier. 🔩

![dinosaur-prusa-i3-mk3-3d-printer.jpg](/polyledra-v1-led-tetrahedron/dinosaur-prusa-i3-mk3-3d-printer.jpg)

Meanwhile, I had a new idea to fix the vertex part, again keeping in the mind that the strength in a 3d printed part is printed layer by layer:

https://youtu.be/SyXvFngkf1Q

Instead of printing the angles of the vertex part as one, I made a separate part with the angle, to be printed on the side, maximizing strength. 💪

![polyledra-structure-vertex-angle.png](/polyledra-v1-led-tetrahedron/polyledra-structure-vertex-angle.png)

It worked, but meant I'd have another 3 sets of connectors to keep everything together. After some time exploring this new approach, I went back to the old approach and while not perfect I think it's stronger than my last design and good enough for my purposes.

![polyledra-structure-vertex-angle-2.png](/polyledra-v1-led-tetrahedron/polyledra-structure-vertex-angle-2.png)

While I've been printing away, I ended up with PLA prototypes, wondering what to do with them. PLA is technically compostable and recyclable, but in practice you need a industrial composter (which is not available here in Wellington) and most recycling systems don't accept PLA. Despite this reality, PLA is commonly used by your eco-friendly cafes as "compostable" coffee lids. Anyways, I've started re-using my PLA prototypes to make party jewelry, which has been working really well because my 3D designs are very symmetric and have appealing features (like the edge connector can look like a few faces, depending on how you angle it).

During this time, I also discovered an [OpenSCAD library for polyhedra](https://github.com/benjamin-edward-morgan/openscad-polyhedra), which let me visualize the entire tetrahedron, with all the parts put together:

![polyledra-tetrahedron-2.png](/polyledra-v1-led-tetrahedron/polyledra-tetrahedron-2.png)

Oh, also I went down a side quest in the search for waterproofing, discovered the magic of o-rings and how they are used everywhere, I had no idea! I played around with making custom o-rings from making 3d models of molds to fill with rubber, Haven't given this a hoon yet though.

![polyledra-o-gon.png](/polyledra-v1-led-tetrahedron/polyledra-o-gon.png)

## Next iteration

So far the next iteration of the tetrahedron is going well! 🌈

(Not pictured: all the time spent making a mess in the empty office while assembling and listening to drum & bass, or when I soldered things backwards and had to unsolder everything, or when twice I plugged the power plugs backwards (+5V into GND and vise versa) causing the wires to rapidly melt and burn))

![polyledra-two-edges.jpg](/polyledra-v1-led-tetrahedron/polyledra-two-edges.jpg)

![polyledra-tetrahedron-circuits.jpg](/polyledra-v1-led-tetrahedron/polyledra-tetrahedron-circuits.jpg)

![polyledra-edges.jpg](/polyledra-v1-led-tetrahedron/polyledra-edges.jpg)

![polyledra-partial-tetrahedron.jpg](/polyledra-v1-led-tetrahedron/polyledra-partial-tetrahedron.jpg)

![polyledra-tetrahedron-3.jpg](/polyledra-v1-led-tetrahedron/polyledra-tetrahedron-3.jpg)

![polyledra-tetrahedron-4.jpg](/polyledra-v1-led-tetrahedron/polyledra-tetrahedron-4.jpg)

## Twisted

![polyledra-twisted.jpg](/polyledra-v1-led-tetrahedron/polyledra-twisted.jpg)

<div class="video-embed" data-ratio="16:9" data-type="vimeo" data-src="https://player.vimeo.com/video/796156160?h=ebc56605c9&&autoplay=1&loop=1&autopause=0&muted=1" data-title="(2019-01-01) Polyledra v1: Twisted"></div>

## Nowhere

<video autoplay loop playsinline muted width="640" height="480">
  <source src="/polyledra-v1-led-tetrahedron/nowhere-renegade.mp4" />
</video>

## Double trouble

![polyledra all the pcbs](/polyledra-v1-led-tetrahedron/polyledra-all-the-pcbs-1.jpg)

![polyledra all the pcbs](/polyledra-v1-led-tetrahedron/polyledra-all-the-pcbs-2.jpg)

![polyledra double trouble](/polyledra-v1-led-tetrahedron/polyledra-double-trouble.jpg)

## "I-Can't-Believe-It's-Not-Kiwiburn"

![ignition abundance](/polyledra-v1-led-tetrahedron/ignition-abundance.jpg)

![ignition night](/polyledra-v1-led-tetrahedron/ignition-night.jpg)

## Scuttle camp

![scuttle camp](/polyledra-v1-led-tetrahedron/scuttle-camp.jpg)

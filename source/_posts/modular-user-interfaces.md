layout: post
title: Modular User Interfaces
date: 2016-04-18T12:21:16.160Z
updated: 2016-05-01T00:55:51.340Z
---
> [@dominictarr](http://dominictarr.com) says,

> Hey, I am thinking about modular user interfaces.

> Note, I didn't say "modular user interface components". The difference is that modular components allow developers to build things easily... but a modular user interface allows the user interface to be recombined, not necessarily by developers.

> One thing that gets fairly far along this road is _drupal_. You could build many sites just configuring modules with drupal. You could probably build loomio, and you could build something that did basically what patchwork does, it wouldn't be decentralized.

> But, modularity is another kind of decentralized. Because a user interface system like patchwork does have a very real sort of centralization in it. there is only one version. Sure, you can run your own fork, but then you are out in the wilderness, not a first class citizen of the polis.

i've been on a journey experimenting with [modular app "frameworks"](https://github.com/openappjs/core), i'll see what i can share about my learnings.

for me, it started with [big](http://jfhbrook.github.io/2013/05/28/the-case-for-a-nodejs-framework.html), which is also how i learned JavaScript.

what big did well:

- uniform descriptions for domain models and business logic
- never write CRUD again
  - you describe your services ("resources") as typed properties and methods
  - you "reflect" these services over interfaces: HTTP, WebSocket, HTML forms, Markdown documentation, etc
- automatic admin interface (like [Rails admin](https://github.com/sferik/rails_admin))
- [if this, then that](https://www.quora.com/How-would-you-explain-IFTTT-to-a-layperson)
  - each service has before and after hooks
  - each service is an event emitter (you can do `.on` or `.emit`)

some other experiments:

- the [Open App Ecosystem](https://github.com/open-app/core), as a collaborative ecosystem of social apps that play well together, now the [Collaborative Technology Alliance](https://medium.com/enspiral-tales/doing-more-together-together-seeding-a-collaborative-technology-alliance-82243ea30d41).
- @bhaugen's [experiment with a user interface as a visual programming language](https://docs.google.com/presentation/d/1N81Q0uDjA7OMEZTLNig6O-MLuWHgb5TL0IxPZ2U8qDU/edit?pref=2&pli=1#slide=id.g5d2790cb5_02), similar to MaxMSP / PureData for music but for socio-economic systems. described as a visual explorer for networks of objects of different types: start with any object, arms appear for possible connections, click on a hand to surface the object on that connection, keep going.
- [holodex](http://holodex.enspiral.com), where Simon and i experimented with a [natural language interfaces](http://www.jroehm.com/2014/01/ui-pattern-natural-language-form/) based directly on [tabular data](https://github.com/editdata/data-ui).
- [linked data browser](https://valueflows.github.io/linked-data-browser), where i experimented with a "follow-your-nose" interface to the web of RDF-style Linked Open Data. the idea is similar to Holodex but tried to do it in a generic way, you click on an object, it becomes the center and any outward links are fetched, any queries (filters) become a natural language sentence, every piece of data has a respective type (with sub / super type relationships).
- [nocms](http://dinosaur.is/nocms/), where i experimented with a new architecture for content management. the idea is just how you edit your content as data, you edit your interface as data, then connect your interface with your content, and everything change is an action in an append-only log for easy time travel (sometimes clients won't edit things for fear of breaking something). here's a more popular attempt in maybe the same direction: [relax](https://github.com/relax/relax).

from the above, i've learned:

- social interfaces are often more important than technical interfaces
- interfaces should [render live data](http://rauchg.com/2015/pure-ui/)
- interfaces should [be based on activity](https://www.thoughtworks.com/insights/blog/stop-designing-users)
- interfaces should be [link data across sources](http://patterns.dataincubator.org/book/follow-your-nose.html)
- interfaces should be [fractal](http://staltz.com/unidirectional-user-interface-architectures.html), both in terms of "zoom" (amount of detail you see) as well as "modularity" (i can write an interface that you can compose into your interface)
- ... probably some other things, i'm just writing this stream-of-consciousness style

lately, i like the common idea found in [yo-yo](https://github.com/maxogden/yo-yo), [tom](https://github.com/gcanti/tom#app-configuration), [Elm](https://github.com/evancz/elm-architecture-tutorial/), and more.

a user interface view is a render function that receives data and a dispatch function (to call with any action objects) and returns user interface elements.

in this way, user interfaces can be composed together into a single app render function and are then only called once to pass in data from the top and any actions are sent up, which updates the data and so forth.

i reckon composable unidirectional data flow (data down, actions up) with a single state object (as in a redux store) is preferred to any two-way data-binding or fancy sub render loops and such. it's far easier to debug, implement time-travel, write tests, compose modules, etc.

lately i've been using some of these ideas as a philosophy behind [`cat-stack`](https://github.com/enspiral-root-sytems/cat-stack): a modular JavaScript framework for building real-time data-driven business-focused apps.

in my latest obsession with types, i'm experimenting with [tcomb-view](https://github.com/ahdinosaur/tcomb-view), where i describe states and actions as types, and attach "views" (generic interfaces as a virtual dom render function) to these types. for example, [t-color](http://dinosaur.is/t-color/) is a type and respective interface for colors. my plan is to build up an ecosystem of these types (domain models) and views (generic interfaces), so we can then easily piece together user-facing interfaces and generate any backend services from the types.

anyways, super keen for modular user interfaces! i wonder where the journey will go next. :fireworks:

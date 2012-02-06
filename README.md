# mote.js

Mote is (yet) another [mustache][mu] implementation.

At the moment, it appears to be the fastest JS mustache engine.

[mu]: http://mustache.github.com/

## For crying out loud, why?

It started out as a learning exercise. There was a [well-defined spec][spec] to
measure progress against, and I was just messing around.

Once there was a working implementation, I looked around to see how it
compared. Turned out that it was dog-slow. So then the challenge became speed:
could mote be competitive with libraries like [mustache.js][mujs],
[Handlebars][hb], [Hogan][ho], and [dust][du]?

The answer, extremely surprising to me, was a resounding yes.

[spec]: https://github.com/mustache/spec
[mujs]: https://github.com/janl/mustache.js/
[hb]: http://handlebarsjs.com/
[ho]: http://twitter.github.com/hogan.js/
[du]: http://akdubya.github.com/dustjs/

## Installation

Via Node, it's as you'd expect:

    npm install mote

## Benchmarks

The libraries being tested:

Mustache: 0.5.0-dev
Handlebars: 1.0.beta.6
Dust: 0.3.0
Hogan: 1.0.5
Mote: 0.1.0

Each benchmark is run by first compiling the rendering function for each
library, then benchmarking it with [benchmark.js].

I'm going to make these runnable online, but for now, these are latest
results I get on my machine (run with `node bench/bench.js`):

```
[String]
mu: Hello World!
ho: Hello World!
mo: Hello World!
hb: Hello World!
du: Hello World!
mustache x 8,580,404 ops/sec ±0.56% (59 runs sampled)
hogan x 12,595,209 ops/sec ±0.60% (61 runs sampled)
mote x 10,011,836 ops/sec ±0.45% (62 runs sampled)
handlebars x 10,171,715 ops/sec ±0.86% (63 runs sampled)
dust x 2,458,468 ops/sec ±0.31% (61 runs sampled)
Fastest: hogan
[Replace]
mu: Hello Mick! You have 30 new messages.
ho: Hello Mick! You have 30 new messages.
mo: Hello Mick! You have 30 new messages.
hb: Hello Mick! You have 30 new messages.
du: Hello Mick! You have 30 new messages.
mustache x 730,556 ops/sec ±0.80% (61 runs sampled)
hogan x 2,138,597 ops/sec ±0.58% (63 runs sampled)
mote x 2,794,455 ops/sec ±0.48% (62 runs sampled)
handlebars x 2,781,628 ops/sec ±0.59% (62 runs sampled)
dust x 1,432,765 ops/sec ±0.51% (61 runs sampled)
Fastest: mote,handlebars
[Array]
mu: MoeLarryCurlyShemp
ho: MoeLarryCurlyShemp
mo: MoeLarryCurlyShemp
hb: MoeLarryCurlyShemp
du: MoeLarryCurlyShemp
mustache x 292,332 ops/sec ±1.22% (60 runs sampled)
hogan x 844,588 ops/sec ±0.64% (62 runs sampled)
mote x 1,164,609 ops/sec ±0.59% (64 runs sampled)
handlebars x 811,080 ops/sec ±0.93% (56 runs sampled)
dust x 665,598 ops/sec ±0.75% (61 runs sampled)
Fastest: mote
[Object]
mu: Larry45
ho: Larry45
mo: Larry45
hb: Larry45
du: Larry45
mustache x 510,149 ops/sec ±0.60% (64 runs sampled)
hogan x 1,486,618 ops/sec ±0.62% (61 runs sampled)
mote x 2,239,848 ops/sec ±0.80% (62 runs sampled)
handlebars x 1,305,359 ops/sec ±1.18% (60 runs sampled)
dust x 1,108,808 ops/sec ±0.79% (63 runs sampled)
Fastest: mote
[Partial]
mu: Hello Moe! You have 15 new messages.Hello Larry! You have 5 new messages.Hello Curly! You have 1 new messages.
ho: Hello Moe! You have 15 new messages.Hello Larry! You have 5 new messages.Hello Curly! You have 1 new messages.
mo: Hello Moe! You have 15 new messages.Hello Larry! You have 5 new messages.Hello Curly! You have 1 new messages.
hb: Hello Moe! You have 15 new messages.Hello Larry! You have 5 new messages.Hello Curly! You have 1 new messages.
du: Hello Moe! You have 15 new messages.Hello Larry! You have 5 new messages.Hello Curly! You have 1 new messages.
mustache x 180,849 ops/sec ±0.51% (62 runs sampled)
hogan x 280,071 ops/sec ±0.58% (58 runs sampled)
mote x 581,618 ops/sec ±0.45% (62 runs sampled)
handlebars x 529,142 ops/sec ±1.08% (60 runs sampled)
dust x 489,489 ops/sec ±0.83% (61 runs sampled)
Fastest: mote
[Recursion]
mu: 11.11.1.1
ho: 11.11.1.1
mo: 11.11.1.1
hb: 11.11.1.1
du: 11.11.1.1
mustache x 219,908 ops/sec ±0.53% (60 runs sampled)
hogan x 370,656 ops/sec ±0.83% (63 runs sampled)
mote x 563,740 ops/sec ±0.61% (62 runs sampled)
handlebars x 546,473 ops/sec ±0.92% (55 runs sampled)
dust x 545,433 ops/sec ±1.11% (60 runs sampled)
Fastest: mote,handlebars,dust
[Complex]
mu: <h1>Colors</h1><ul><li><strong>red</strong></li><li><a href="#Green">green</a></li><li><a href="#Blue">blue</a></li></ul>
ho: <h1>Colors</h1><ul><li><strong>red</strong></li><li><a href="#Green">green</a></li><li><a href="#Blue">blue</a></li></ul>
mo: <h1>Colors</h1><ul><li><strong>red</strong></li><li><a href="#Green">green</a></li><li><a href="#Blue">blue</a></li></ul>
hb: <h1>Colors</h1><ul><li><strong>red</strong></li><li><a href="#Green">green</a></li><li><a href="#Blue">blue</a></li></ul>
du: <h1>Colors</h1><ul><li><strong>red</strong></li><li><a href="#Green">green</a></li><li><a href="#Blue">blue</a></li></ul>
mustache x 115,937 ops/sec ±0.55% (64 runs sampled)
hogan x 326,612 ops/sec ±0.77% (63 runs sampled)
mote x 398,851 ops/sec ±0.51% (55 runs sampled)
handlebars x 295,103 ops/sec ±1.02% (63 runs sampled)
dust x 339,315 ops/sec ±0.57% (60 runs sampled)
Fastest: mote
```

## Mustache-spec compliance

Mote is fully compliant with all the required specs. To run the specs:

    node spec/run_specs.js all

There is support for lambdas, but it doesn't follow the spec. It adheres more
closely to how Handlebars and dust have implemented lambda functionality. I'll
document this better soon, for now you can look through the source.

## Roadmap

- utilities for server-side compilation
- documentation


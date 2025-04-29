# GridFont - Anders Hoff (2019)

Project and documentation by [Anders Hoff](https://inconvergent.net/) (@inconvergent) (2019), adapted from [his repo here](https://github.com/inconvergent/gridfont). Ported to p5.js (v.1.11.5) by Golan Levin, April 2025. Used with permission. 

* [Original Python code by Anders Hoff](https://github.com/inconvergent/gridfont)
* [p5.js JavaScript port](sketch.js) (here)
* [p5.js JavaScript port](https://editor.p5js.org/golan/sketches/EGWs_gTbR) (at editor.p5js.org)


--- 

[![Anders Hoff's GridFont in p5.js](hoff_screenshot.png)](https://editor.p5js.org/golan/sketches/EGWs_gTbR)

*GridFont* is a grid-based system for designing simple symbols and fonts, designed by Anders Hoff in 2019. It is mainly intended for plotter drawings, and uses a turtle-graphics-like method for defining stroke paths in the glyphs.  

The symbol descriptions look like this:

```
    S4,9:DS6|S3DtRqS2eLp
```

You can use spaces to separate moves, so you can for instance write it like this:

```
    S4,9: DS6| S3 DtRq S2 eLp
```

The first section (left of `:`) is the `info` section. Which currently contains
the size of the grid (as `integers`). Here the width is `4` and the height is
`9`. That is, there are `4` and `9` grid points in the two directions. That
means the width of the symbol will be `3` and `8`.

The next section is one or more paths, separated by the pipe symbol `|`.
Specifically, the above example should result in the two paths of the letter
`b`:

```
    |   <-- p1
    |
    |/-\   <-- p2
    |   |
    |   |
    |\-/
```

Here are a few examples of more complex symbol definitions:

```
    asterisk: S3,9:M1,3DS|S3.75Dq1,0.25t1,0.25|M0.25,5Dt0.75,1q0.75,1
    w:        S5,9:S2D q1,4 t1,4 q1,4 t1,4
    y:        S4,9:S2Dq1.5,4|M3,2De1.5,4e0.5,1e
```

## Paths

When drawing a new path the cursor is always reset to the `origin`, which is in
the upper left corner. The coordinate system is rotated like this:

```
        -
        |
    - --o-- x+
        |
        y+
```

From there you can perform relative and absolute moves. Once the command `D` is
entered the path will start being drawn. Which means you can move the cursor
into position before starting each path.


### Relative Moves

The following commands are allowed:

```
     p   N   t
       \ | /
     L - o - R    <-- o is the current position of the cursor
       / | \
     e   S   q
```

Any number (see below) after a direction command is interpreted as the length
of the step, otherwise the step size is `1`. You can also use two numbers
separated by a comma. For instance `q2.5,3` will move the cursor two and a half
steps to the right, and three steps down. Similarly `p2,1/2` will move the
cursor two steps left, and half a step up.


### Numbers

Accepted numbers are either integers: `1`, fractions: `1/2` or decimals: `3.5`.
Note that all decimals are converted to fractions. Decimals are a convenience
that allows you to write `4.5` instead of `9/2`. However, you are better of
using `13/3` instead of `4.33...`. The latter will most likely not add up
inside the limits of the grid. You can also use multiple commands in the same
direction, if you find that easier. For instance `R4 R1/2`.

That means that if you get out of bounds errors, it is either because you are
using a decimal that does not "add up" properly inside the grid. Or simply
because the resulting number is outside the grid.

Numbers are converted to float before being exported to `json` or `svg`


### Absolute Moves

The following absolute moves are allowed

  - `Mx,y` to move to position `x,y` relative to the `origin`.
  - `Z` move to the first position of the drawn path. (defaults to `origin`)
  - `W` to move to move out to the right hand side of the drawing.
  - `w` to move to the left side of the drawing.
  - `H` to move to the top of the drawing.
  - `h` to move to the bottom of the drawing.

### Groups

You can provide substitution groups in the `groups` property of the `json`
specification. Groups names should always start with a `(` and end with a `)`.
Any `(group)` in a path definition will be replaced verbatim until there are no
more `(` or `)` left in the path specification. (Note: this means you can cause
infinite loops as well as memory leaks.)

---
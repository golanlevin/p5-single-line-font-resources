# p5-single-line-font-resources

![banner.png](img/banner.png)

*This is a repository of p5.js (JavaScript) programs for loading and displaying single-line vector fonts (also called single-stroke fonts, technical lettering fonts, stick fonts, skeleton fonts, engraving fonts, or monoline fonts) in a variety of formats — including TTF, SVG 1.1 Font, Hershey Font, and others. This repository also includes an authoritative archive of single-line fonts (and procedural fonts) recovered or extracted from a wide range of creative projects, vintage and obsolete technologies, and other sources.*

*Most digital fonts are "outline fonts", which represent letterforms as shapes that fill closed contours. By contrast, single-line fonts represent letters with linear skeletons, the same way we might write them by hand. Single-line fonts are ideally suited to creative coding, pen-plotting, laser projection, and CNC machining. Examples in this repository are known to work with p5.js v.1.11.13.*

![single line vs outline fonts](img/single_line_vs_outline_fonts.png)<br>*Single-line font (left) versus outline font (right).*


---

### Contents

* [Minimal SVG Hershey font, inlined in p5.js](#minimal-svg-hershey-font-inlined-in-p5js)
* [p5.js Parser/Renderer for Single-Line SVG Fonts](#p5js-parserrenderer-for-single-line-svg-fonts)
* [p5.js Parser/Renderer for Single-Line TTF Fonts](#p5js-parserrenderer-for-single-line-ttf-fonts)
* [p5.js Parser/Renderer for (Classic) Hershey Fonts](#p5js-parserrenderer-for-classic-hershey-fonts)
* [p5.js port of Saka.N's *KST32B* font, via Kitasenju Design](#p5js-port-of-sakans-kst32b-font-via-kitasenju-design)
* [p5.js port of M+ kanji/hanzi font](#p5js-port-of-m-kanjihanzi-font)
* [p5.js port of Kamp's HP1345A vector font](#p5js-port-of-kamps-hp1345a-vector-font)
* [p5.js port of Phooky's Apple 410 vector font](#p5js-port-of-phookys-apple-410-vector-font)
* [p5.js port of Scruss's Commodore 1520 vector font](#p5js-port-of-scrusss-commodore-1520-vector-font)
* [p5.js port of Ed Logg's *Asteroids* font](#p5js-port-of-ed-loggs-asteroids-font)
* [p5.js port of Masaya Matsuura's *Vib-Ribbon* Fonts](#p5js-port-of-masaya-matsuuras-vib-ribbon-fonts)
* [p5.js implementation of multi-segment display fonts](#p5js-implementation-of-multi-segment-display-fonts)
* [p5.js port of Hofstadter's *Letter Spirit* gridfonts](#p5js-port-of-hofstadters-letter-spirit-gridfonts)
* [p5.js port of JT Nimoy's *Textension* font](#p5js-port-of-jt-nimoys-textension-font)
* [p5.js port of Jongmin Kim's variable *LeonSans* font](#p5js-port-of-jongmin-kims-variable-leonsans-font)
* [Kielm's p5.js *Space Type Generator* font](#kielms-p5js-space-type-generator-font)
* [Licia He's p5.js *DearPlotter* font](#licia-hes-p5js-dearplotter-font)
* [p5.js port of Moebio's *Typode* font](#p5js-port-of-moebios-typode-font)
* [p5.js port of Daniel Holden's *Consolines* font](#p5js-port-of-daniel-holdens-consolines-font)
* [p5.js port of Anders Hoff's *GridFont*](#p5js-port-of-anders-hoffs-gridfont)
* [p5.js port of Abel Vincze's *GearGenerator* font](#p5js-port-of-abel-vinczes-geargenerator-font)
* [p5.js port of Tyler X. Hobbs' font](#p5js-port-of-tyler-x-hobbs-font)
* [p5.js port of Jared Schiffman's font](#p5js-port-of-jared-schiffmans-font)
* [p5.js port of Glen Kleinschmidt's *Fourier Synthesis Character Generator*](#p5js-port-of-glen-kleinschmidts-fourier-synthesis-character-generator)
* [*minf*, an ultra-minimal procedural monoline font](#minf-an-ultra-minimal-procedural-monoline-font)
* [Additional resources](#additional-resources)
* [Some inspirational artworks](#some-inspirational-artworks)


---

### Minimal SVG Hershey font, inlined in p5.js

> **"I just want something simple"**

*This minimal program presents an SVG font inlined in p5.js, with no loading of external resources.* This program may be useful in circumstances when you just need a simple single-line font, and do not wish to load external files or have any additional library dependencies. It is available:

* In [this repository](Hershey/Hershey_inline_font/sketch.js), and
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/iqRjuCM-5)
* A [version that saves SVG output files](https://editor.p5js.org/golan/sketches/vjQxbigFg), at editor.p5js.org.

The typeface happens to be a Hershey (polyline) font, converted to the SVG 1.1 Font format. Note that additional Hershey fonts have also been converted to this format and are available e.g. [here](https://gitlab.com/oskay/svg-fonts/-/tree/master/fonts/Hershey), [here](https://github.com/Shriinivas/inkscapestrokefont/tree/master/strokefontdata), and [here](https://github.com/techninja/hersheytextjs), as discussed [below](#p5js-parserrenderer-for-single-line-svg-fonts). This code has been adapted from the [hershey font json example](https://editor.p5js.org/allison.parrish/sketches/SJv2DCYpQ) by Allison Parrish.

![hershey_inline_screenshot.png](Hershey/Hershey_inline_font/hershey_inline_screenshot.png)


---

### p5.js Parser/Renderer for Single-Line SVG Fonts

[SVG 1.1 Fonts](https://www.w3.org/TR/SVG11/fonts.html) are a lesser-known open font standard, which allow for entire vector fonts to be stored within a single (specially formatted) SVG file. A number of single-line SVG Fonts have been created. *(Note that while SVG 1.1 Fonts are technically SVG files, they don't display normally in SVG viewers.)* [Here is a p5.js program](p5_single_line_svg_fonts/sketch.js) that parses and displays SVG Fonts:

* In [this repository](p5_single_line_svg_fonts/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/T-Vf4vvaR)

![relief_svg_font.png](p5_single_line_svg_fonts/img/relief_svg_font.png)

Shown above is the elegant [*Relief*](https://github.com/isdat-type/Relief-SingleLine/) open-source single-line SVG font (rendered by p5.js), developed by a team directed by Prof. François Chastanet at the Graphic Design Department of the Institut Supérieur des Arts et du Design de Toulouse. Note that *Relief* is not a poly-linear font, but instead uses cubic Bézier curves with the SVG `C` (curveTo) and p5.js `bezier()` commands. [Here](p5_single_line_svg_fonts/single_line_svg_fonts/Relief/ReliefSingleLine-Regular.svg) is a quick link to the *Relief* SVG font.

Another useful single-stroke SVG 1.1 font presented here is [ISO 3098](p5_single_line_svg_fonts/single_line_svg_fonts/ISO3098/ISO-3098-1-1974.pdf) (below), an international standard (adopted in 1974) that provides guidelines for consistent and legible labeling and lettering in technical documentation and engineering drawings. Here are links to both [regular](p5_single_line_svg_fonts/single_line_svg_fonts/ISO3098/ISO3098-Regular.svg) and [italic](p5_single_line_svg_fonts/single_line_svg_fonts/ISO3098/ISO3098-Italic.svg) versions of ISO 3098 in the SVG 1.1 font format, adapted using data from [here](https://domisan.sakura.ne.jp/article/cadfont/cadfont.html). ISO 3098 is constructed from straight lines and circular/elliptical arcs:

![iso-3098.png](p5_single_line_svg_fonts/img/iso-3098.png)

Finally, a very large [archive](p5_single_line_svg_fonts/single_line_svg_fonts/README.md) of compatible SVG single-line fonts is included [here](p5_single_line_svg_fonts/single_line_svg_fonts/README.md), as a mirror of [a collection](https://gitlab.com/oskay/svg-fonts) curated by Dr. Windell Oskay of Evil Mad Scientist Laboratories. (Some of these include SVG Font versions of Hershey fonts.) All of these fonts are supported by the p5.js project here.

![Archive of SVG fonts](p5_single_line_svg_fonts/single_line_svg_fonts/samples.png)

Some additional resources for SVG 1.1 Fonts are:

* [https://gitlab.com/oskay/svg-fonts](https://gitlab.com/oskay/svg-fonts)
* [https://github.com/Shriinivas/inkscapestrokefont](https://github.com/Shriinivas/inkscapestrokefont)
* [https://singlelinefonts.com/collections/svg-fonts](https://singlelinefonts.com/collections/svg-fonts)
* [https://github.com/isdat-type/Relief-SingleLine](https://github.com/isdat-type/Relief-SingleLine)
* [https://www.templatemaker.nl/singlelinetext](https://www.templatemaker.nl/singlelinetext/)


---

### p5.js Parser/Renderer for Single-Line TTF Fonts

Genuine *single-line* TrueType (.TTF) fonts are comparatively rare, and are not rendered properly by most graphics tools — including commercial software like Adobe Illustrator, as well as p5's built-in `text()` command. Here, an [archive](p5_single_line_ttf_fonts/single_stroke_ttf_fonts/) of single-line TTF fonts is provided, as well as a p5.js [program](p5_single_line_ttf_fonts/) which is able to load, parse, display, and provide control points for those fonts:

* An [**archive**](p5_single_line_ttf_fonts/single_stroke_ttf_fonts/) of single-line TTF fonts, as suggested via [imajeenyus.com](http://www.imajeenyus.com/computer/20150110_single_line_fonts/index.shtml). Unlike Hershey fonts, many of these TTFs are constructed from quadratic Bézier segments, and thus have real curves instead of polylines. 
* A [**p5.js program**](p5_single_line_ttf_fonts/sketch.js) to load single-line TTFs in p5.js: In [this repository](p5_single_line_ttf_fonts/), and also at [editor.p5js.org](https://editor.p5js.org/golan/sketches/7kMYzCpfM). Note that the program makes use of [opentype.js](https://opentype.js.org/).
* These fonts have some quirks. Don't ignore these important [**technical notes**](p5_single_line_ttf_fonts/README.md) about the TTF fonts and p5.js code!

![all_ttf_single_stroke_fonts.png](p5_single_line_ttf_fonts/img/all_ttf_single_stroke_fonts.png)


---

### p5.js Parser/Renderer for (Classic) Hershey Fonts

[Hershey Fonts](https://en.wikipedia.org/wiki/Hershey_fonts) are a collection of single-line vector fonts developed in 1967 by Dr. Allen V. Hershey at Dahlgren Naval Weapons Laboratory; they are some of the [earliest digital fonts](https://www.youtube.com/watch?v=xQNHAWrR_eg). The coordinate data for 1,377 Hershey font characters was published by the National Bureau of Standards in 1976, in [*A Contribution to Computer Typesetting Techniques: Tables of Coordinates for Hershey's Repertory of Occidental Type Fonts and Graphic Symbols*](https://books.google.de/books?id=8DOGhKjPAyEC&redir_esc=y); a local copy is [here](Hershey/nbs_1976/tables_of_coordinates_for_hershey_fonts_nbs_1976.pdf) (32MB PDF). Type designer/historian Frank Grießhammer has published a terrific [video lecture about The Hershey Fonts](https://www.youtube.com/watch?v=xQNHAWrR_eg) in 2015.

The authoritative p5.js interface to Hershey Fonts is the [p5-hershey-js](https://github.com/LingDong-/p5-hershey-js) library, by [Lingdong Huang](https://github.com/lingDong-/); a [live demo is here](https://lingdong-.github.io/p5-hershey-js/). (Note that the font data in Lingdong's p5-hershey-js is *not* stored in SVG format!) The p5-hershey-js library provides detailed control of Hershey typography; in this section, I provide some practical p5.js programs that use this library. 

#### hershey-font-demo-svg

This program ([**here**](Hershey/hershey-font-demo-svg/) or at [editor.p5js.org](https://editor.p5js.org/golan/sketches/HufYAfKQr)) provides a simple introduction to the [p5-hershey-js](https://github.com/LingDong-/p5-hershey-js) library. It demonstrates how to: 

* Display text using the default Hershey font
* Display text using a specific Hershey font
* Display text using Lingdong Huang's Chinese Hershey fonts
* Position a Hershey glyph with a specific translation, scale, and rotation.
* *Export* these graphics to an SVG file, using the [p5.plotSvg](https://github.com/golanlevin/p5.plotSvg) library

[![hershey_font_demo](Hershey/hershey-font-demo-svg/hershey_font_demo_screenshot.png)](Hershey/hershey-font-demo-svg/)

#### pointwise-hershey-to-svg

This program ([**here**](Hershey/pointwise-hershey-to-svg/) or at [editor.p5js.org](https://editor.p5js.org/golan/sketches/2PJpYMHo1)) also uses the [p5.plotSvg](https://github.com/golanlevin/p5.plotSvg) library to export SVG files of the graphics rendered onscreen. In particular, this demo shows how the [p5-hershey-js](https://github.com/LingDong-/p5-hershey-js) library can be used to render Hershey fonts in 3 different ways: 

1. "Simple", using Lingdong's library API;
2. "Custom", allowing for your own pointwise manipulations;
3. "Single Line", in which all text is an unbroken polyline. 

[![pointwise-hershey-to-svg](Hershey/pointwise-hershey-to-svg/pointwise_hershey_screenshot.png)](Hershey/pointwise-hershey-to-svg/)

These additional Hershey+p5 resources by Lingdong Huang are noteworthy: 

* [Hershey Font Editor](https://unglitch.netlify.app/hfedit/).
* [chinese-hershey-font](https://github.com/LingDong-/chinese-hershey-font) with a [live demo here](https://lingdong-.github.io/chinese-hershey-font/)
* [legumes](https://github.com/LingDong-/legumes) Sheet music in polylines using Hershey text
* [hfmath](https://github.com/LingDong-/hfmath) Render LaTeX math with Hershey Fonts
* [ttf2hershey](https://github.com/LingDong-/ttf2hershey) TTF-to-Hershey Converter

Also see: 

* [cnc-text-tool](https://msurguy.github.io/cnc-text-tool/) Browser-based SVG editor with Hershey text overlayer
* [Hershey Font Inkscape plugin](https://wiki.inkscape.org/wiki/index.php/Release_notes/1.0#Hershey_Text) 


---

### p5.js port of Saka.N's *KST32B* font, via Kitasenju Design

[KST32B](saka_KST32B_font/sketch.js) (Kanji Stroke Table) is a comprehensive monospace single-line font originally designed (c.1992, 2017) by [Saka.N](https://www.vector.co.jp/download/file/data/writing/fh691397.html)<!-- Saka.N.06@b3.mnx.ne.jp -->, covering 4125 characters across multiple scripts: ASCII, half-width kana, hiragana and katakana, Greek, Cyrillic, ISO 8859-15, and both JIS Level 1 and Level 2 kanji. Each glyph is encoded as a compact byte stream of drawing commands on a 30×32 integer grid, using distinct opcodes for horizontal moves, horizontal strokes, and diagonal strokes. In 2014, Saka's work was [added to LibreCAD](https://forum.librecad.org/Japanese-Font-td5710456.html). Inspired by [hgsn](https://x.com/hsgn/status/1413826984413704195), [Kitasenju](https://kitasenjudesign.com/tool/01/) ported Saka.N's original binary data to p5.js, annotating each entry with its Unicode equivalent; this adaptation loads that header directly, keying each glyph by Unicode codepoint for straightforward multilingual text rendering in English, Japanese, Greek, Russian, and Chinese.

* In [this repository](saka_KST32B_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/shlhouIWh)

![saka_KST32B_font](saka_KST32B_font/saka_KST32B_font.png)


---

### p5.js port of M+ kanji/hanzi font

This is a p5.js adaptation of *M+ Stroke Font*, a single-stroke font specialized for East Asian scripts designed by Coji Morishita of [M+ Fonts Project](https://mplusfonts.github.io/). The font covers the complete hiragana and katakana syllabaries (83 and 87 glyphs respectively) and approximately 5,000 CJK unified ideographs (kanji/hanzi), for a total of ~5,200 single-stroke glyphs. The *M+ Stroke Font* is available:

* In [this repository](m_plus_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/-Fcfqi5mQ)
* In [this SVG 1.1 font](m_plus_font/source/MPlusStrokeSVG1.1Font.svg) 

![M+ Stroke Font](m_plus_font/mplus_font.png)

The *M+ Stroke Font* is extracted from the [LibreCAD project](https://librecad.org/), a free open source CAD application (published under GPLv2), from [here](https://domisan.sakura.ne.jp/article/cadfont/cadfont.html).


---

### p5.js port of Kamp's HP1345A vector font

This single-line font is from the character generator ROM of the [HP1345A digital vector display](https://archive.org/details/HP1345AOSM1985) (c.1985), [reverse-engineered](https://phk.freebsd.dk/hacks/Wargames/index.html) by Poul-Henning Kamp, and ported to JavaScript by Golan Levin. The p5.js version is adapted from his work, and loads data from the original ROM binaries. The HP1345A font is available: 

* ROM-loading version [here](HP1345A/HP1345A_single_line_font/sketch.js) or at [editor.p5js.org](https://editor.p5js.org/golan/sketches/ir_bD05uZ)
* Data-inlined version (*recommended*) [here](HP1345A/HP1345A_single_line_font_inline) or at [editor.p5js.org](https://editor.p5js.org/golan/sketches/TzKV33v9g)
* In [this SVG 1.1 Font](HP1345A/HP1345A.svg)

![hp1345a_screenshot.png](HP1345A/hp1345a_font.png)


---

### p5.js port of Phooky's Apple 410 vector font

This monospace, monoline vector font is from the [Apple 410 Color Plotter](https://en.wikipedia.org/wiki/Apple_410_Color_Plotter) (c.1983), also sold as the Yokogawa YEW PL-1000. The font was reverse-engineered and extracted from the firmware ROM by Adam Mayer (@phooky), as described in his article, "[Pulling Teeth From a Corpse: Extracting the Vector Font From the Apple 410 Color Plotter](https://www.nycresistor.com/2017/12/29/pulling-teeth-from-a-corpse-extracting-the-vector-font-from-the-apple-410-color-plotter/)". This p5.js version is adapted using the font data and extraction code Meyer released in [this repository](https://github.com/phooky/Apple-410) (MIT license). Meyer explains that the data for each character was stored in a single byte: "the high four bits of the byte indicate the X coordinate, and the low four bits indicate the Y coordinate", thus limiting the design to points on a 16×16 lattice; in other words, it is a grid-font. For p5.js it has been encapsulated into JSON. The Apple 410 font is available: 

* In [this repository](apple_410_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/BytcG0455)
* In [this SVG 1.1 font](apple_410_font/Apple410.svg)

![apple_410_font.png](apple_410_font/apple_410_font.png)


---

### p5.js port of Scruss's Commodore 1520 vector font

This is a vintage monospace, monoline vector font from the [Commodore 1520 Printer Plotter](https://www.youtube.com/watch?v=QwPTluBvKLU) (c.1982), recovered from the original ROM data by Jim Brain, Gerrit Heitsch, Silver Dream, and Stewart C Russell (scruss). More information about the recovery and provenance of this data is available [here](https://scruss.com/blog/2016/04/23/fifteentwenty-commodore-1520-plotter-font/) and [here](https://e4aws.silverdr.com/hacks/6500_1/). A p5.js port of this font by Golan Levin can be found: 

* In [this repository](commodore_1520_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/XbFlU8q6k)
* In [this SVG 1.1 font](commodore_1520_font/Commodore1520.svg)

![commodore_1520_font](commodore_1520_font/commodore_1520_font.png)


---

### p5.js port of Ed Logg's *Asteroids* font

This is a p5.js port of the authentic font used in the *Asteroids* game, developed in 1979 for Atari by Lyle Rains and Ed Logg. The font was extracted from the 6502 microprocessor assembly instructions embedded on the ROMs of an *Asteroids* (rev 4) arcade machine. Disassembly was performed by [Nick Mikstas](https://web.archive.org/web/20190917025700/https://www.nicholasmikstas.com/asteroids-fimrware), Lonnie Howell, and [Mark McDougall](http://computerarcheology.com/Arcade/Asteroids/), with reformatting and other corrective work (2021) by Andy McFadden as reported [here](https://6502disassembly.com/va-asteroids/Asteroids.html). Game data from McFadden's disassembly, including both font and Asteroid shape information, has been made available:

* In [this repository](asteroids_font/asteroids_6502_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/68mZm4yuw)
* In [this SVG 1.1 font](asteroids_font/asteroids_6502_font/Asteroids6502.svg)

![asteroids_6502_font](asteroids_font/asteroids_6502_font/asteroids_6502_font.png)

![ed_logg_asteroids_font_1979.jpg](asteroids_font/asteroids_hudson_font/ed_logg_asteroids_font_1979.jpg)

Another version of the *Asteroids* game vector font was transduced from the original handwritten notes (c.1979) of [Atari programmer Ed Logg](https://web.archive.org/web/20141222010537/http://www.edge-online.com/features/making-asteroids/) by [Trammell Hudson](https://trmm.net/Asteroids_font/). Hudson "modified a few of the characters to make them more distinct as well as added a strike to the 0 so that it stands out from the O", and used this font in his Arduino Asteroids clone, [*Space Rocks*](https://trmm.net/Space_Rocks/). His C-code data [here](https://github.com/osresearch/vst/blob/master/teensyv/asteroids_font.c) has been ported to p5.js and is available:

* In [this repository](asteroids_font/asteroids_hudson_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/OmiU51Gdm)

![asteroids_screenshot.png](asteroids_font/asteroids_hudson_font/asteroids_hudson_screenshot.png)


---

### p5.js port of Masaya Matsuura's *Vib-Ribbon* Fonts

We are pleased to present Latin and Japanese single-line vector fonts extracted from the ROM of [*Vib-Ribbon*](https://en.wikipedia.org/wiki/Vib-Ribbon) (1999), a PlayStation game developed by [Masaya Matsuura](https://en.wikipedia.org/wiki/Masaya_Matsuura) (松浦 雅也) and [NanaOn-Sha](https://en.wikipedia.org/wiki/NanaOn-Sha). In the game, the [typography is procedurally animated](https://www.youtube.com/watch?v=eRbnVqTGLUc&t=60s), giving the text the same nervous, monoline quality as the main *Vibri* character and the game's obstacle graphics.

The *Vib-Ribbon* stroke fonts are available: 

* In [vib_ribbon_latin_stroke_font.json](vib_ribbon_font/vib_ribbon_latin_stroke_font.json) (Latin font)
* In [vib_ribbon_japanese_stroke_font.json](vib_ribbon_font/vib_ribbon_japanese_stroke_font.json) (Japanese font)
* In [this repository](vib_ribbon_font/p5_vib_ribbon_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/Z5A9WVHxa)
* In [this SVG 1.1 Font](vib_ribbon_font/vib_ribbon_font.svg)

*Note:* If you're doing creative coding in p5.js, it's straightforward to load these fonts and twiddle their vertices with some randomness, as I demonstrate in my included sketch. To be clear, however, the motion you see in this demo (below) is just my own attempt to reproduce the game's behavior; it is not an exact literal replication of the game's animation code.

![vib_ribbon_font.gif](vib_ribbon_font/vib_ribbon_font.gif)

This firmware-archaeology project was conducted by Golan Levin in May 2026 with the assistance of Codex GPT-5.5. The fonts were exhumed from the [Vib-Ribbon (Europe) (EnFrDeEsIt) (Redump)](https://romsfun.com/download/vib-ribbon-58974/2) version of the Vib-Ribbon PlayStation ROM [obtained from romsfun.com](https://romsfun.com/download/vib-ribbon-58974). Recovery began with an inspection of the ROM's `.cue` file, in which Track 1 was identified as a `MODE2/2352` data track. A [set of small Python tools](vib_ribbon_font/python/) stripped the 2352-byte PlayStation sectors to ISO-9660 payloads, then extracted the filesystem. The game's `.PAK` files use a leading offset table; after unpacking them, the [relevant assets](vib_ribbon_font/rom_files/) appeared as `FONT/01_FONT.TMD` and `FONT/FE_FONT.TMD`. The former contains 76 Japanese glyphs, while the latter contains 113 Latin glyphs.

The game's lettering is stored as compact [PlayStation TMD](http://justsolve.archiveteam.org/wiki/TMD_(PlayStation)) model data: each glyph is a small set of signed 16-bit vertices, connected by line primitives. The TMD object table gives, for each glyph, a vertex list and a primitive list; the primitive records are two-index line segments. These were decoded to JSON while preserving the authentic, unscaled numeric coordinate values from the original PlayStation ROM, with positive `Y` downward. The Latin mapping was confirmed from lookup tables in `MAIN_G.EXE`, while the Japanese mapping was refined by visual inspection: it includes digits, katakana, small kana, dakuten, and handakuten (but lacks the character `ヲ`).


---

### p5.js implementation of multi-segment display fonts

An implementation of 7 segment, 14 segment, and 16 segment LED displays. Based on glyph encodings from Dave Madison's [Segmented LED Display - ASCII Library](https://github.com/dmadison/LED-Segment-ASCII/), under MIT license. Note that full 7-bit ASCII character sets (from codepoints 32 through 127) are supported, though legibility may vary. Designs are based on e.g. the HP/Siemens/Litronix DL-2416 17-segment alphanumeric LED display, etc.

* In [this repository](multisegment_display_fonts/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/kLbqPpqwL)
* In [these SVG 1.1 fonts](multisegment_display_fonts/svg/)

![multisegment_display.png](multisegment_display_fonts/multisegment_display.png)


---

### p5.js port of Hofstadter's *Letter Spirit* gridfonts

Douglas Hofstadter’s *Letter Spirit* project (c.1987-1996) explores how abstract concepts like "style" and "analogy" underpin both perception and creativity. It models the human capacity to perceive coherence and invent variation within constraints, proposing that the essence of intelligence lies in fluid, context-sensitive pattern recognition rather than rigid rule-following.

The code in this directory implements some of the *Letter Spirit* gridfonts devised by Hofstadter and Gary McGraw in [*Letter Spirit: An Emergent Model of the Perception and Creation of Alphabetic Style*](hofstadter_letter_spirit_fonts/1993-hofstadter.pdf) (1993). In these fonts, each glyph consists of an array of strokes, and each stroke connects points in a 3x7 design lattice. More information can be found [here](hofstadter_letter_spirit_fonts/readme.md), and code/fonts are available: 

* In [this repository](hofstadter_letter_spirit_fonts/letter_spirit_fonts/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/_sQ_9xkI4)
* In [these SVG 1.1 fonts](hofstadter_letter_spirit_fonts/svg/)

![Letter Spirit Gridfonts](hofstadter_letter_spirit_fonts/img/hofstadfter_letter_spirit_gridfonts.png)

Some more recent related work is [Letterform Variations](https://letterformvariations.com/book/) by [Nigel Cottier](https://process-pattern.com/), 2021.


---

### p5.js port of JT Nimoy's *Textension* font

This repository presents is a p5.js recovery of the handcoded monoline font extracted from [*Textension: Word Processor Variations*](https://jtnimoy.cc/item.php%3Fhandle=14882287-textension-word-processor-variations.html) (1999), an interactive Windows 95/98/XP program developed by JT Nimoy at the Aesthetics & Computation Group of the MIT Media Laboratory. A screen recording of *Textension* can be found [here](https://player.vimeo.com/video/6121230). Nimoy wrote: 

> *"Textension was a collection of 10 interactive experiments in making creative variations of word processing applications. It was my response as an artist to the way programmers always use the typewriter metaphor when they are creating a typesetting application. Textension combines the metaphor of the typewriter with that of other things in the physical world, such as the act of blowing soap bubbles."*

* In [this repository](nimoy_textension/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/D4hUCWZk7)
* In [this SVG 1.1 font](nimoy_textension/nimoy_textension.svg)

![nimoy_textension.png](nimoy_textension/nimoy_textension.png)

[JT Nimoy](https://jtnimoy.cc/)<sup>†</sup> (1979–2020) was a prolific software artist and creative technologist, known for her work as part of the CGI team behind *TRON: Legacy*, as well as her voluminous body of experimental creative coding projects spanning more than two decades.

Kyle McDonald assisted in the recovery of the Textension font data by decompiling the [Textension.exe executable](https://acid-play.com/download/textension) with Hex-Rays. [The decompiled C++](nimoy_textension/textension_windows_app_1999/textension_decompiled.cpp) was ported to p5.js by Golan Levin.


---

### p5.js port of Jongmin Kim's variable *LeonSans* font

![p5_leonsans_font](p5_leonsans_font/p5_leonsans_font.gif)

This is a p5.js port of [*LeonSans*](https://github.com/cmiscm/leonsans) by [Jongmin Kim](https://blog.cmiscm.com/) (2019), a procedural single-stroke Latin font. *LeonSans* is distinctive in that it is a [*variable single-stroke font*](https://en.wikipedia.org/wiki/Variable_font): its *weight* parameter (1–900) simultaneously controls both the rendered stroke thickness and the underlying Bézier geometry: control points morph between a thin and a bold variant — so heavier weights produce genuinely different letterform shapes rather than simply thicker lines. Because of its variable weight, this single-line font may be particularly well-suited to supporting plotting with thick pens. This port also includes a special *roundCaps* option suited for pen-plotters; when enabled, each open stroke endpoint is pulled inward by half the stroke width, ensuring that round-ended strokes land exactly where square caps would. *LeonSans* is available:

* In [this repository](p5_leonsans_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/aPH2RXnd1)


---

### Kielm's p5.js *Space Type Generator* font

![](kielm_spacetypefont/kielm_spacetypefont.gif)

This is an adaptation of an especially versatile, procedural single-stroke monospace font created in p5.js by [Kiel Mutschelknaus](https://www.kielm.com/) (@kielm). Mutschelknaus developed this typeface for his [*Space Type Generator*](https://spacetypegenerator.com/) (2019), a customizable kinetic type generator, and released it under the CC by-nc-sa 4.0 license. A special feature of this typeface is that it allows for horizontal and vertical "stretching" without affecting the shape of the characters' rounded parts. A p5.js sketch for the *Space Type Generator* font is available:

* In [this repository](kielm_spacetypefont/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/On-RBvfqR)


---

### Licia He's p5.js *DearPlotter* font

The [*DearPlotter Generator*](https://www.eyesofpanda.com/project/dearplotter_font/) is a program that generates stroke-fonts, created by [Licia He](http://eyesofpanda.com/) through a commission from The Processing Foundation and the Tezos Foundation. The DearPlotter Font Generator is flexibly licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) (CC BY-SA 4.0), and the fonts created with it are licensed under The [SIL Open Font License](https://openfontlicense.org/). 

The code presented here reproduces Licia He's underlying ur-font from which all of the *DearPlotter Generator* fonts are derived. He's original renderer converts each arc to a densely-sampled polyline before drawing; this p5.js adaptation instead renders each stroke in a resolution-independent way with p5's native `bezierVertex()`. The *DearPlotter* font is available:

* In [this repository](licia_he_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/l-7DpKuu-)
* In [this SVG 1.1 font](licia_he_font/licia_he_dearplotter.svg)

![licia_he_font](licia_he_font/licia_he_font.png)


---

### p5.js port of Moebio's *Typode* font

[*Typode*](https://moebio.com/research/typode/) (2013) is a procedural, grid-based, monospace, single-stroke font by [Santiago Ortiz](https://moebio.com/) (Moebio). Ortiz created *Typode* "to be used in certain information visualization contexts, in which text needs to adapt to specific shapes". Ortiz's demo includes a collection of "transformation" functions which illustrate the computational malleability of procedural fonts. *Typode* was ported to p5.js by Golan Levin in January 2025, and is presented here with permission. A p5.js sketch to parse and display *Typode* is available: 

* In [this repository](moebio_typode/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/BPPwoW1FU)
* In [this SVG 1.1 font](moebio_typode/moebio_typode.svg)

[![moebio_typode_screenshot.png](moebio_typode/moebio_typode.png)](https://editor.p5js.org/golan/sketches/BPPwoW1FU)


---

### p5.js port of Daniel Holden's *Consolines* font

[Daniel Holden](https://theorangeduck.com/page/about) created the monospace single-line font [*Consolines*](https://theorangeduck.com/page/debug-draw-text-lines) (2025) out of a need to present on-screen debugging information in C-like gamedev environments. The letterforms are roughly based on [Consolas](https://fonts.adobe.com/fonts/consolas) by Luc de Groot.

*Consolines* contains line segments for 95 printable ASCII characters, starting with ! and ending with ~. Line segments are encoded by taking the four integer coordinates `(start_x, start_y, end_x, end_y)` with values ranging from 0-128, and packing them into a single 32-bit integer. The aspect ratio of characters is 1:2. *Consolines* has been ported from C to JavaScript and is available: 

* In [this repository](holden_consolines_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/Xo6GSXhx2)
* In [this SVG 1.1 font](holden_consolines_font/holden_consolines.svg)

![holden_consolines_font.png](holden_consolines_font/holden_consolines_font.png)


---

### p5.js port of Anders Hoff's *GridFont*

*GridFont* is a grid-based system for designing simple symbols and fonts, designed by [Anders Hoff](https://inconvergent.net/) in 2019. It is mainly intended for plotter drawings, and uses a turtle-graphics-like method for defining stroke paths in the glyphs. This p5.js port is adapted from [his repo here](https://github.com/inconvergent/gridfont), with permission. 

Hoff provides two sample fonts: one ("original") which is almost exclusively composed of vertical, horizontal, and 45° angles; and another ("smooth") which has additional line segments, but is still poly-linear. *Note that Hoff's fonts do not contain capital (uppercase) letters.*

* [Original Python code by Anders Hoff](https://github.com/inconvergent/gridfont)
* [p5.js JavaScript port](hoff_gridfont/sketch.js) (in this repository)
* [p5.js JavaScript port](https://editor.p5js.org/golan/sketches/EGWs_gTbR) (at editor.p5js.org)
* [SVG 1.1 fonts here](hoff_gridfont/svg/)

[![Anders Hoff's GridFont in p5.js](hoff_gridfont/hoff_screenshot.png)](https://editor.p5js.org/golan/sketches/EGWs_gTbR)


---

### p5.js port of Abel Vincze's *GearGenerator* font

p5.js port of the compact single-line font embedded in Abel Vincze's [GearGenerator.com](http://geargenerator.com/) (Iparigrafika, version 1.01), in which it was used to label gears with ratio and RPM text. The font encodes 73 printable characters on a 7×9 integer grid, compressing all glyph stroke data into three strings totalling under 1 KB; ported from [here](https://www.robopenguins.com/assets/wp-content/pages/geargenerator/index.html). The font is available:

* In [this repository](vincze_geargenerator_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/6wem5wbsI)
* In [this SVG 1.1 font](vincze_geargenerator_font/vincze_geargenerator.svg)

![vincze geargenerator font](vincze_geargenerator_font/vincze_geargenerator_font.png)


---

### p5.js port of Tyler X. Hobbs' font

Generative artist [Tyler X. Hobbs](https://www.tylerxhobbs.com/) created this uppercase, monospace, monoline font sometime prior to 2021, when he shared it with the artists participating in the Feral File [*-GRAPH*](https://feralfile.com/explore/exhibitions/graph-eg6) exhibition of generative plotter art. It is available here, ported from Clojure to p5.js, with his permission:

* In [its original Clojure code](tylerxhobbs_font/tylerxhobbs_clojure_font/tylerxhobbs_font.clj)
* In [this repository](tylerxhobbs_font/tylerxhobbs_font/sketch.js), as JSON
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/CbCmyvpbA)
* In [this SVG 1.1 font](tylerxhobbs_font/tylerxhobbs_font.svg)

![tylerxhobbs_font](tylerxhobbs_font/tylerxhobbs_font.png)


---

### p5.js port of Jared Schiffman's font

Procedural single-stroke monospace font developed by [Jared Schiffman](https://www.jaredschiffman.com/) at the MIT Media Laboratory Aesthetics and Computation Group, c.1999-2000. Ported from C++ to Java and p5.js by Golan Levin, available:

* In [this repository](schiffman_font/JaredSchiffman_single_line_font/sketch.js)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/QVljixLNt)
* [Processing (Java) version](schiffman_font/JaredSchiffman_monoline_pde/)
* In [this SVG 1.1 font](schiffman_font/schiffman_font.svg)

![JaredSchiffman_screenshot.png](schiffman_font/schiffman_font.png)

---

### p5.js port of Glen Kleinschmidt's *Fourier Synthesis Character Generator*

This is a p5.js adaptation of Glen Kleinschmidt's [*Fourier Synthesis Character Generator*](https://glensstuff.com/fouriersynthchargen/fouriersynthchargen.htm) (2014), a single-stroke vector font implemented as a real, working, analog electronic circuit. Instead of storing glyphs as a list of points, Kleinschmidt's characters are defined by the coefficients of sinusoidal basis functions. In the circuit, these coefficients control the amplitude of oscillators, in the same manner as an additive synthesizer. Each glyph is represented as a two-dimensional parametric curve, using only the first five harmonics, as defined by the equations: 

![x(t)=\sum a_n\sin(nt)+b_n\cos(nt), y(t)=\sum c_n\sin(nt)+d_n\cos(nt)](kleinschmidt_fourier/equation.png)

In Kleinschmidt's circuit, these coefficients were encoded as resistor values in a ROM-like hardware matrix; the selected sinusoidal signals were passively summed to drive the X and Y deflection inputs of an oscilloscope. Kleinschmidt's character set is limited to the sixteen hexadecimal symbols, `0–9` and `A–F`. 

In the p5.js sketch, character shapes are stored as resistor values that encode oscillator amplitudes, and the sketch evaluates the resulting Fourier series directly. The p5.js code can be found: 

* In [this repository](kleinschmidt_fourier/README.md)
* At [editor.p5js.org](https://editor.p5js.org/golan/sketches/NYn_eUfRH)
* [Original project page by Glen Kleinschmidt here](https://glensstuff.com/fouriersynthchargen/fouriersynthchargen.htm)

In the GIF below, the amount of harmonic content is animated.

![](kleinschmidt_fourier/kleinschmidt_fourier.gif)


---

### *minf*, an Ultra-Minimal Procedural Monoline Font

**minf** is an ultra-minimal [CC0](https://creativecommons.org/public-domain/cc0/) procedural, grid-based, monospace, monoline vector font for p5.js by Golan Levin (2024). *minf* is intended purely as a pedagogic experiment in [type-golfing](https://en.wikipedia.org/wiki/Code_golf). All *minf* glyphs are constructed from a single 4-point polyline: that is, each letter has exactly 4 points, connected by 3 continuous line segments. (None of the line segments have zero length, nor double back on themselves.) No claims whatsoever are made about the attractiveness, legibility, or utility of *minf* (the `M` and `W` are particularly faulty); [some code](minf/sketch.js#L73) is provided to improve it.

Each of the `x` and `y` coordinate values in minf's glyph control points are stored with just 2 bits of resolution. Therefore the entire 26-character font is defined by only {26 letters * 4 points per letter * 2 dimensions per point * 2 bits per number = 416 bits =) 52 bytes of data. In practice it is convenient to store this in a base-64 encoded string, which uses standard ASCII characters; this expands the total complete storage of the *minf* font to [the 72-byte string](minf/sketch.js#L15): 

```
+T4D0dE+zy1tG4Mdw/oDnxm/CLLTDwR/Nd8x/R1xMNL8HhNd0vOLHRvfF50X/R/TBcMdPw==
```

A p5.js program to load, render, and edit *minf* is available in [this repository](minf/sketch.js) and at [editor.p5js.org](https://editor.p5js.org/golan/sketches/C_Xk-gnL3). *minf* is also available in [this SVG 1.1 font](minf/minf.svg).

![minf.png](minf/minf.png)


---

### Additional resources

* [*Drawing with Machines* Typography resources](https://github.com/golanlevin/DrawingWithMachines/blob/main/lectures/topics/type/README.md) by Golan Levin
* [Summary of single-line fonts (10/01/15)](http://www.imajeenyus.com/computer/20150110_single_line_fonts/index.shtml), compiled by [Lindsay Robert Wilson](imajeenyus.com).
* [Singlelinefonts.com](https://singlelinefonts.com/), a commercial foundry for single-line fonts by [Leslie Peppers](https://www.linkedin.com/in/leslie-peppers-a80122181/).
* [OneLineFonts.com](https://www.onelinefonts.com/), a commercial foundry for single-line fonts by [Justin Daniels](https://www.linkedin.com/in/justindaniels/).
* [Drawingbots.net](https://drawingbots.net/resources#12), key resources for plotter enthusiasts, maintained by [Maks Surguy](https://makssurguy.com/).


---

### Some inspirational artworks

Here are some inspirational creative software projects that make use of single-line fonts.

* [*DearPlotter Generator*](https://www.eyesofpanda.com/project/dearplotter_font/) by [Licia He](http://eyesofpanda.com/), 2026.
* [*X-Y-Z*](https://opensea.io/collection/x-y-z-by-andreas-gysin) by [Andreas Gysin](https://ertdfgcvb.xyz/), 2024.
* [*Space Type Generator*](https://spacetypegenerator.com) by [Kiel Mutschelknaus](https://www.kielm.com/), 2019.
* [*chinese-radical-vis* & *RRPL*](https://unglitch.netlify.app/chinese-radical-vis/) by [Lingdong Huang](https://lingdong.works/), 2018.
* [*paramtype*](https://unglitch.netlify.app/paramtype/) by Lingdong Huang, 202x. 
* [*Leon Sans*](https://github.com/cmiscm/leonsans) by [Jongmin Kim](https://blog.cmiscm.com/), 2019.
* [*waveform - study 3*](https://x.com/yugop/status/2062481427233685661) by Yugo Nakamura, 2026.
* [*Letterform Variations*](https://letterformvariations.com/book/) by [Nigel Cottier](https://process-pattern.com/), 2021.
* [*Typode*](https://moebio.com/research/typode/) by [Santiago Ortiz](https://moebio.com/), 2013.
* [*Viktor*](https://juerglehni.com/works/viktor), [*Hektor*](https://juerglehni.com/works/hektor), and [*Otto*](https://juerglehni.com/works/otto) by [Jürg Lehni](https://juerglehni.com/), 2002-2014.
* [*Textension: Word Processor Variations*](https://vimeo.com/6121230) by [JT Nimoy](https://jtnimoy.cc/), 1999.
* [*Vib Ribbon*](https://www.youtube.com/watch?v=cFXz_xKQa40) by Masaya Matsuura and NanaOn-Sha, 1999.


---

### Todo 

* [*MTDBT2F*](https://kadist.org/program/dexter-sinister/) MetaFont, Dexter Sinister, 2013, [github](https://github.com/O-R-G/mtdbt2f4d/tree/main)
* ROM extraction of HP7596A font
* Add [Inkscape Extension](https://www.evilmadscientist.com/2011/hershey-text-an-inkscape-extension-for-engraving-fonts/) and [more](https://www.evilmadscientist.com/2015/inkscape-v-0-91/)


---

### Keywords

*Single line font, single stroke font, stick font, monoline font, vector font, CAD font, CNC engraving font, technical lettering font, pen plotter font, skeletal font, skeleton font, procedural font, procedural typeface, computational font, computational typography, SVG fonts, TTF fonts, Hershey font, AxiDraw, NextDraw, pen plotting, #plotterTwitter, creative coding, typefaces, p5.js, JavaScript, Processing, archive, media archaeology, retrocomputing.*

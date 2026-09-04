# Château La Tour Carnet 2019 — An Interactive Bottle

A 9:16 interactive HTML presentation built for screen-recorded wine explainers.
It is not a slide deck. The bottle is the home screen, every chapter opens from
a real word printed on the real label, and every chapter closes by returning to
the bottle.

```
full bottle → click a word on the label → cinematic zoom → the knowledge behind
that word → back to bottle → click the next word
```

Front label opens four chapters, the bottle turns, the back label opens four more.
Fifty-six presenter beats, roughly nine to ten minutes at a talking pace.

---

## Run it

Any static server works. Opening `index.html` directly from disk also works in
most browsers, but a server avoids image-loading quirks.

```bash
cd la-tour-carnet-2019
python3 -m http.server 8765
# then open http://localhost:8765
```

Press **F** for fullscreen. On a desktop the stage renders as a centred 9:16
column, which is the region you record.

---

## Presenter controls

Nothing plays automatically. Every beat waits for you.

| Key | Action |
| --- | --- |
| `→` `Space` `Enter` `PageDown` or click | next beat |
| `←` `PageUp` | previous beat |
| `B` or `Esc` | back to the bottle (jumps to the hub that closes this chapter) |
| `F` | toggle fullscreen |
| `H` | hide every hotspot and all on-screen chrome |
| `R` `Home` | reset to the opening bottle |
| `End` | jump to the final beat |
| `?` | show the key card |

Clicking a hotspot on the label jumps straight into that chapter, so you can
present out of order. Swipe left and right works on a phone or tablet.

`H` is the one to remember before you hit record on a take where you want the
label completely clean.

---

## Recording with Focus C or any screen recorder

1. Open the page and press **F** for fullscreen.
2. Press **H** if you want the hotspot dots and the progress hairline gone.
3. Set the capture region to the 9:16 column. On a 1920×1080 display that column
   is 608 px wide and full height. Recording the browser window at a portrait
   size (for example 540×960) removes the letterboxing entirely and is the
   cleanest option.
4. Camera moves take about 1.4 s and scene fades about 0.6 s. Land your click,
   let the move finish, then speak. Clicking early cuts the move short.
5. The page never animates on its own, so you can pause between takes without
   losing your place. `←` steps back if you need another pass at a beat.

A browser zoom of 100% keeps the label sharpest. The photographs ship at
2160×3840, which is more pixels than the camera ever needs, so the label text
stays crisp at every zoom level.

---

## Replacing the label photographs

Drop your files over these two, keeping the names:

```
assets/bottle-front.jpg
assets/bottle-back.jpg
```

Requirements:

- **Portrait 9:16.** The stage is 9:16 and the photo is mapped corner to corner,
  so a different aspect ratio will shift every hotspot. Crop to 9:16 first.
- **As large as you can.** 2160×3840 is the shipped size. More pixels means a
  sharper push-in. Under about 1080×1920 the deep zooms start to soften.
- Shoot the bottle roughly centred with the label upright.

Nothing else in the code refers to the photographs, so a swap is a file copy.
The hotspot coordinates will need re-measuring, which is the next section.

---

## Moving the hotspots

All eight live in one block at the top of `script.js`, under `var HOTSPOTS`.
Every number is a **percentage of the photograph**, so they survive any screen
size.

```js
chateau: {
  side: 'front',                    // which photo it belongs to
  label: 'Château La Tour Carnet',  // screen-reader name
  entry: 'ask',                     // the step id this hotspot jumps to
  left: 27.5, top: 72.5,            // top-left of the clickable box, in %
  w: 34.5,   h: 4.8,                // size of the box, in %
  fx: 44.8,  fy: 74.9,              // the point the camera pushes in on, in %
  z: 2.30,                          // how close the camera gets
  sy: 0.30                          // where that point sits vertically on screen
},
```

To re-measure after swapping a photo:

1. Open the photo in any image editor and read the pixel position of the words.
2. Convert to percentages: `left = x / imageWidth * 100`, `top = y / imageHeight * 100`.
3. Set `fx` / `fy` to the centre of the words.
4. Reload and click the hotspot. If the framing is loose, raise `z`. If the words
   run off the edge, lower `z`.

`sy` is the vertical resting place of the focus point, where `0` is the top of the
screen and `1` the bottom. `0.30` puts the words in the upper third and leaves the
lower two thirds for the caption. The camera clamps itself so the edge of the
photograph can never enter frame, so an impossible `sy` is corrected rather than
showing a black gap.

There is a console helper while you tune:

```js
LTC.go(12)        // jump to step 12
LTC.step()        // what step am I on
LTC.hotspots      // the live hotspot table
```

---

## Changing the words on screen

Everything a viewer reads is plain HTML in `index.html`, grouped by chapter under
`<section class="scene" data-scene="...">`. Find the chapter, edit the text.

Two attributes drive the reveal:

- `data-beat="2"` — this element appears at beat 2 of its scene and stays.
- `data-beat-range="2-3"` — this block is on screen only during beats 2 to 3.
- `data-beat-only="4"` — on screen only at exactly beat 4.

`style="--i:2"` staggers an item in a list, so items cascade rather than appearing
together.

To change the order of the whole presentation, edit the `STEPS` array in
`script.js`. Each entry is one presenter click:

```js
{ id: 'map-bx',      // unique name, also the jump target for a hotspot's `entry`
  ch: 'Origin',      // chapter name shown top-left
  cam: 'wideFront',  // a camera preset, or H('hotspotName') to frame a hotspot
  scene: 'map',      // which data-scene to show, or null for the bare bottle
  beat: 2,           // which beat of that scene
  dim: 2 }           // 0 bottle full · 1 bottle recedes · 2 bottle almost gone
```

Add `hub: 'front'` to make a step a home beat where the label hotspots become
clickable again, `next:` to say which hotspot should pulse, and `read: [...]` to
grey out the ones already covered.

---

## What the deck claims, and where it comes from

Most of the presentation reads facts off the bottle itself, which is the strongest
possible sourcing for a wine explainer. Claims taken directly from the two
photographs:

- `LA TOUR CARNET A ÉTÉ ÉDIFIÉE EN 1120` — front label, under the gate engraving
- `Première vendange en 1409` — back label
- `Grand Cru Classé en 1855` and `Haut-Médoc` — front label
- `Récolte 2019`, `Mis en bouteille au Château`, `Appellation Haut-Médoc Contrôlée` — back label
- Harvest began 21 September 2019 — back label, both the French and English paragraphs
- 12th-century construction, the Montaigne family in the 16th century — back label

Context added by the deck:

- Château La Tour Carnet is a **Quatrième Cru** in the 1855 Médoc classification,
  in **Saint-Laurent-Médoc**, Haut-Médoc, Left Bank.
- The classification lists **61 châteaux today**: 5 first, 14 second, 14 third,
  10 fourth, 18 fifth growths. It was drawn up for the 1855 Paris Exposition
  Universelle and originally covered 58 estates.
- **`Haut` is a river word, not a compass word.** Haut-Médoc lies *south* of
  Médoc on the map, because the name comes from the Gironde estuary: the
  upstream half, nearer Bordeaux, is the *haut* one. The estuary flows from
  Bordeaux out to the Atlantic, so upstream runs the opposite way from north.
  The convention comes from the river traffic that carried the wine.
- **Haut-Médoc contains the six communal appellations** — Saint-Estèphe,
  Pauillac, Saint-Julien, Listrac-Médoc, Moulis and Margaux. It is not their
  neighbour. Château La Tour Carnet sits in Saint-Laurent-Médoc, which has no
  communal appellation of its own, which is why the label reads Haut-Médoc.

Two things are deliberately left open rather than invented:

- **The 2019 blend.** The grape chapter names the red varieties permitted in
  Haut-Médoc and shows `2019 exact blend — to verify` instead of percentages.
  Add real figures in `index.html` under `data-scene="grapes"` once you have the
  château's technical sheet.
- **The Bernard Magrez acquisition year.** Sources give 1999 and 2000, so the
  timeline reads `c. 2000` with the ambiguity noted rather than picking one.

The Bordeaux map is schematic and labelled as such on screen. Regions are placed
by area and relative position, not by coordinates, and the château pin marks its
commune rather than the estate itself. The Médoc and Haut-Médoc zones are drawn
as indicative areas inset from the coast — real appellation boundaries are not
straight lines, and the deck never claims otherwise. Because Haut-Médoc contains
the six communal appellations rather than sitting beside them, that relationship
is shown as a nested diagram in the appellation chapter, not as shapes on the map.

---

## Files

```
index.html    every scene, every word on screen
styles.css    the visual system; all type scales from --u (stage width ÷ 100)
script.js     hotspots, the step spine, camera maths, the turn, the morphs
assets/       bottle-front.jpg · bottle-back.jpg
```

No build step, no dependencies, no framework. Vanilla HTML, CSS and JavaScript.
The one network request is a Google Fonts stylesheet for Cormorant Garamond and
Jost; offline the page falls back to a system serif and sans and still looks right.

---

## How a few effects work, if you want to change them

**The camera.** The photograph and the stage are both 9:16, so an image point
maps corner to corner onto the stage. `camTransform()` turns a request of the form
"put image point (px, py) at screen position (sx, sy) at zoom z" into a
`translate() scale()` on one element. It is a real camera move, not a modal.

**The turn.** The two photographs sit flat and cross-fade for ordinary side
changes, which keeps zooms sharp because no 3-D compositing layer is created. Only
the `TURN THE BOTTLE` beat switches on `preserve-3d`, masks the frame down to the
bottle column so the room does not rotate with it, darkens to a silhouette at 90°,
and lands on the real back photograph.

**The morphs.** Twice a word travels from the screen onto the bottle: `HAUT-MÉDOC`
from the map onto the front label, and `2019` from `Récolte 2019` on the back label
onto the front. `runMorph()` measures where the word is now, calculates where the
printed word will be under the incoming camera, flies the token between the two,
then fades it out over the real printed text. Adjust `1250ms` in `runMorph()` for
a slower or faster flight.

**Adding B-roll.** The deck deliberately owns every fact, label, map and number.
If you cut in generated atmosphere footage, keep it to mood shots between beats
and never let it render text, a label or a figure.

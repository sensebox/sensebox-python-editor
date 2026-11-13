---
name: RGB-LED
subtitle: verschiedene Farben darstellen
image: ../../images/rgb-led.svg
imageAlt: Rot, grün und blau leuchtende LED
---

Farbe und Blinken der RGB-LED steuern.

## RGB-LED initialisieren

<!-- @slug rgb-led-initialisieren -->

Richtet die eingebaute RGB-LED ein.

```python
import board
import neopixel

pixel = neopixel.NeoPixel(board.D1, 1, pixel_order=neopixel.GRB)
```

## Farbe einstellen

<!-- @slug rgb-led-farbe-einstellen -->

Legt die Leuchtfarbe der RGB-LED fest.

```python
pixel[0] = (0, 255, 0)
```

## RGB-LED blinken lassen

<!-- @slug rgb-led-leuchten-lassen -->

Lässt die RGB-LED regelmäßig grün blinken.

```python
import time

while True:
    pixel[0] = (0, 255, 0)
    time.sleep(0.25)
    pixel[0] = (0, 0, 0)
    time.sleep(0.25)
```

## RGB-LED vollständig blinken lassen

<!-- @slug rgb-led-vollstaendig-blinken-lassen -->

Richtet die RGB-LED ein und lässt sie grün blinken.

```python
import time
import board
import neopixel

pixel = neopixel.NeoPixel(board.D1, 1, pixel_order=neopixel.GRB)

while True:
    pixel[0] = (0, 255, 0)
    time.sleep(0.25)
    pixel[0] = (0, 0, 0)
    time.sleep(0.25)
```

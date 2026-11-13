---
connectionGuide: led-matrix
name: LED-Matrix
subtitle: Text über die LED-Matrix laufen lassen
image: ../../images/led-matrix.svg
imageAlt: Leuchtende Punkte einer LED-Matrix
---

<!--
(c) 2026, Micro:bit Educational Foundation and contributors
SPDX-License-Identifier: MIT
-->

Text auf einer LED-Matrix anzeigen.

## LED-Matrix initialisieren

<!-- @slug led-matrix-initialisieren -->

Richtet die LED-Matrix ein.

```python
import board
import digitalio
import neopixel
from adafruit_pixel_framebuf import PixelFramebuffer

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

breite = 12
hoehe = 8
pixels = neopixel.NeoPixel(
    board.D2,
    breite * hoehe,
    brightness=0.05,
    pixel_order=neopixel.GRB,
    auto_write=False,
)
matrix = PixelFramebuffer(pixels, breite, hoehe, alternating=True)
```

## Lauftext anzeigen

<!-- @slug led-matrix-lauftext-anzeigen -->

Zeigt einen roten Lauftext auf der LED-Matrix an.

```python
import time

text = "Hello world!"
textbreite = len(text) * 6

while True:
    for x in range(breite, -textbreite, -1):
        matrix.fill(0x000000)
        matrix.text(text, x, 0, 0xFF0000)
        matrix.display()
        time.sleep(0.1)
```

## LED-Matrix mit Lauftext vollständig verwenden

<!-- @slug led-matrix-vollstaendig-verwenden -->

Richtet die LED-Matrix ein und zeigt einen Lauftext an.

```python
import board
import digitalio
import neopixel
from adafruit_pixel_framebuf import PixelFramebuffer
import time

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

breite = 12
hoehe = 8
pixels = neopixel.NeoPixel(
    board.D2,
    breite * hoehe,
    brightness=0.05,
    pixel_order=neopixel.GRB,
    auto_write=False,
)
matrix = PixelFramebuffer(pixels, breite, hoehe, alternating=True)

text = "Hello world!"
textbreite = len(text) * 6

while True:
    for x in range(breite, -textbreite, -1):
        matrix.fill(0x000000)
        matrix.text(text, x, 0, 0xFF0000)
        matrix.display()
        time.sleep(0.1)
```

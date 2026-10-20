---
name: LED-Matrix
subtitle: Text über die LED-Matrix laufen lassen
---

<!--
(c) 2026, Micro:bit Educational Foundation and contributors
SPDX-License-Identifier: MIT
-->

Schließe die 12 × 8 LED-Matrix an Port A der senseBox an.

## Lauftext auf der LED-Matrix anzeigen

<!-- @slug led-matrix-lauftext-anzeigen -->

Dieses Beispiel lässt den Text „Hello world!“ in Rot über die Matrix laufen:

```python
import board
import digitalio
import neopixel
from adafruit_pixel_framebuf import PixelFramebuffer
import time

# Anschlüsse der senseBox einschalten
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

while True:
    textbreite = len(text) * 6

    for x in range(breite, -textbreite, -1):
        matrix.fill(0x000000)
        matrix.text(text, x, 0, 0xFF0000)
        matrix.display()
        time.sleep(0.1)
```

<!-- @details -->

Ändere `text`, um eine eigene Nachricht anzuzeigen. Mit `0xFF0000` legst du die Farbe fest. Eine kleinere Zahl bei `time.sleep(0.1)` lässt den Text schneller laufen. Mit `brightness=0.05` kannst du die Helligkeit anpassen.

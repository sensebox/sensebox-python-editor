---
name: LED-Matrix
subtitle: Text über die LED-Matrix laufen lassen
image: ../../images/led-matrix.svg
imageAlt: Leuchtende Punkte einer LED-Matrix
---

<!--
(c) 2026, Micro:bit Educational Foundation and contributors
SPDX-License-Identifier: MIT
-->

Schließe die 12 × 8 LED-Matrix an Port A der senseBox an.

Füge zuerst **LED-Matrix initialisieren** und danach **Lauftext anzeigen** ein. Alternativ enthält **LED-Matrix mit Lauftext vollständig verwenden** ein direkt ausführbares Gesamtbeispiel.

## LED-Matrix initialisieren

<!-- @slug led-matrix-initialisieren -->

Schalte die senseBox-Anschlüsse ein und richte die LED-Matrix ein:

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

<!-- @details -->

Der Block legt das Anzeigeobjekt unter dem Namen `matrix` an. Verwende dieses Objekt auch im folgenden Block. Mit `brightness=0.05` kannst du die Helligkeit anpassen.

## Lauftext anzeigen

<!-- @slug led-matrix-lauftext-anzeigen -->

Lass einen Text in Rot über die zuvor initialisierte Matrix laufen:

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

<!-- @details -->

Ändere `text`, um eine eigene Nachricht anzuzeigen. Mit `0xFF0000` legst du die Farbe fest. Eine kleinere Zahl bei `time.sleep(0.1)` lässt den Text schneller laufen. Der Block setzt voraus, dass `matrix` und `breite` zuvor eingerichtet wurden.

## LED-Matrix mit Lauftext vollständig verwenden

<!-- @slug led-matrix-vollstaendig-verwenden -->

Dieses vollständige Beispiel initialisiert die LED-Matrix und zeigt fortlaufend einen Lauftext an:

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

<!-- @details -->

Text, Farbe, Helligkeit und Laufgeschwindigkeit kannst du für dein Projekt anpassen.

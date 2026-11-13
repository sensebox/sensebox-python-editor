---
connectionGuide: led-matrix
name: LED Matrix
subtitle: TDisplay text on the LED matrix
image: ../../images/led-matrix.svg
imageAlt: Light-up dots on an LED matrix
---

<!--
(c) 2026, Micro:bit Educational Foundation and contributors
SPDX-License-Identifier: MIT
-->

Display text on an LED matrix.

## Initialize the LED matrix

<!-- @slug led-matrix-initialisieren -->

Sets up the LED matrix.

```python
import board
import digitalio
import neopixel
from adafruit_pixel_framebuf import PixelFramebuffer

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

width = 12
height = 8
pixels = neopixel.NeoPixel(
    board.D2,
    width * height,
    brightness=0.05,
    pixel_order=neopixel.GRB,
    auto_write=False,
)
matrix = PixelFramebuffer(pixels, width, height, alternating=True)
```

## Display scrolling text

<!-- @slug led-matrix-lauftext-anzeigen -->

Displays red scrolling text on the LED matrix.

```python
import time

text = “Hello world!”
text_width = len(text) * 6

while True:
    for x in range(width, -text_width, -1):
        matrix.fill(0x000000)
        matrix.text(text, x, 0, 0xFF0000)
        matrix.display()
        time.sleep(0.1)
```

## Using the LED Matrix with Scrolling Text to Its Full Potential

<!-- @slug led-matrix-vollstaendig-verwenden -->

Sets up the LED matrix and displays scrolling text.

```python
import board
import digitalio
import neopixel
from adafruit_pixel_framebuf import PixelFramebuffer
import time

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

width = 12
height = 8
pixels = neopixel.NeoPixel(
    board.D2,
    width * height,
    brightness=0.05,
    pixel_order=neopixel.GRB,
    auto_write=False,
)
matrix = PixelFramebuffer(pixels, width, height, alternating=True)

text = "Hello world!"
textwidth = len(text) * 6

while True:
    for x in range(width, -textwidth, -1):
        matrix.fill(0x000000)
        matrix.text(text, x, 0, 0xFF0000)
        matrix.display()
        time.sleep(0.1)
```

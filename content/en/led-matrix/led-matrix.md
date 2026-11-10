---
name: LED Matrix
subtitle: TDisplay text on the LED matrix
image: ../../images/led-matrix.svg
imageAlt: Light-up dots on an LED matrix
---

<!--
(c) 2026, Micro:bit Educational Foundation and contributors
SPDX-License-Identifier: MIT
-->

Connect the 12 × 8 LED matrix to Port A of the senseBox.

First, insert **Initialize LED Matrix**, followed by **Display Scrolling Text**. Alternatively, **Use LED Matrix with Scrolling Text** contains a complete example that can be run directly.

## Initialize the LED matrix

<!-- @slug led-matrix-initialisieren -->

Turn on the senseBox connections and set up the LED matrix:

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

<!-- @details -->

This block creates the display object with the name `matrix`. Use this object in the following block as well. You can adjust the brightness using `brightness=0.05`.

## Display scrolling text

<!-- @slug led-matrix-lauftext-anzeigen -->

Scroll some text in red across the previously initialized matrix:

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

<!-- @details -->

Change `text` to display your own message. Use `0xFF0000` to set the color. A smaller number in `time.sleep(0.1)` makes the text scroll faster. This block requires that `matrix` and `width` have been set up beforehand.

## Using the LED Matrix with Scrolling Text to Its Full Potential

<!-- @slug led-matrix-vollstaendig-verwenden -->

This complete example initializes the LED matrix and continuously displays scrolling text:

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

<!-- @details -->

You can customize the text, color, brightness, and scrolling speed for your project.

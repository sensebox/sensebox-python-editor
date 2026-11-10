---
name: RGB LED
subtitle: Display different colours
image: ../../images/rgb-led.svg
imageAlt: An LED glowing red, green and blue
---

Control the colour and blinking of the RGB LED.

## Initialise RGB LED

<!-- @slug rgb-led-initialisieren -->

Sets up the built-in RGB LED.

```python
import board
import neopixel

pixel = neopixel.NeoPixel(board.D1, 1, pixel_order=neopixel.GRB)
```

## Set colour

<!-- @slug rgb-led-farbe-einstellen -->

Sets the colour of the RGB LED.

```python
pixel[0] = (0, 255, 0)
```

## Blink RGB LED

<!-- @slug rgb-led-leuchten-lassen -->

Makes the RGB LED blink green repeatedly.

```python
import time

while True:
    pixel[0] = (0, 255, 0)
    time.sleep(0.25)
    pixel[0] = (0, 0, 0)
    time.sleep(0.25)
```

## Make RGB LED blink completely

<!-- @slug rgb-led-vollstaendig-blinken-lassen -->

Sets up the RGB LED and makes it blink green.

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

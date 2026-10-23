---
name: RGB LED
subtitle: Display different colours
image: ../../images/rgb-led.svg
imageAlt: An LED glowing red, green and blue
---

The RGB LED is built into the MCU S2, so you do not need to connect anything else.

First add **Initialise RGB LED**. Then use **Set colour** to display a colour or **Blink RGB LED** to make it blink. The final example combines initialisation and blinking.

## Initialise RGB LED

<!-- @slug rgb-led-initialisieren -->

Set up the built-in RGB LED:

```python
import board
import neopixel

pixel = neopixel.NeoPixel(board.D1, 1, pixel_order=neopixel.GRB)
```

<!-- @details -->

This block creates the LED as `pixel`. Use this object in the following blocks as well.

## Set colour

<!-- @slug rgb-led-farbe-einstellen -->

Make the RGB LED glow green:

```python
pixel[0] = (0, 255, 0)
```

<!-- @details -->

The three numbers represent red, green and blue and can each be between `0` and `255`. Use `(0, 0, 0)` to turn the LED off.

## Blink RGB LED

<!-- @slug rgb-led-leuchten-lassen -->

Make the previously initialised LED blink green every 250 milliseconds:

```python
import time

while True:
    pixel[0] = (0, 255, 0)
    time.sleep(0.25)
    pixel[0] = (0, 0, 0)
    time.sleep(0.25)
```

<!-- @details -->

This block requires `pixel` to be initialised first. Adjust the colour values and delay for your project.

## Make RGB LED blink completely

<!-- @slug rgb-led-vollstaendig-blinken-lassen -->

This complete example initialises the RGB LED and makes it blink green:

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

<!-- @details -->

Find further information in the [senseBox documentation](https://docs.sensebox.de).

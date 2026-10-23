---
name: OLED Display
subtitle: Display information on the screen
image: ../../images/oled-display.svg
imageAlt: OLED screen with lines of text
---

The component is connected to the I²C port.

First, insert **Initialize OLED Display**, followed by **Display Text on the OLED Display**. Alternatively, **Use OLED Display Fully** includes both steps.

## Initialize the OLED display

<!-- @slug oled-display-initialisieren -->

Turn on the senseBox connections and set up the display:

```python
import board
import digitalio
import adafruit_ssd1306

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

i2c = board.I2C()
display = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c, addr=0x3D)
```

<!-- @details -->

This block creates the display object with the name `display`. Use this object in the following blocks as well.

## Display text on the screen

<!-- @slug oled-text-anzeigen -->

Delete the existing content and display “Hello senseBox!”:

```python
display.fill(0)
display.text("Hello senseBox!", 0, 0, 1)
display.show()
```

<!-- @details -->

The two numbers `0, 0` determine the position of the text. The block requires that `display` has been initialized beforehand.

## OLED-Display vollständig verwenden

<!-- @slug oled-display-vollstaendig-verwenden -->

This complete example initializes the display and shows some text:

```python
import board
import digitalio
import adafruit_ssd1306

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

i2c = board.I2C()
display = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c, addr=0x3D)

display.fill(0)
display.text("Hello senseBox!", 0, 0, 1)
display.show()
```

<!-- @details -->

For more information, see the [senseBox documentation](https://docs.sensebox.de/en/).

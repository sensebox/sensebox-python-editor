---
connectionGuide: oled-display
name: OLED Display
subtitle: Display information on the screen
image: ../../images/oled-display.svg
imageAlt: OLED screen with lines of text
---

Display text on an OLED screen.

## Initialize the OLED display

<!-- @slug oled-display-initialisieren -->

Sets up the OLED display.

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

## Display text on the screen

<!-- @slug oled-text-anzeigen -->

Replaces the display content with text.

```python
display.fill(0)
display.text("Hello senseBox!", 0, 0, 1)
display.show()
```

## OLED-Display vollständig verwenden

<!-- @slug oled-display-vollstaendig-verwenden -->

Sets up the OLED display and displays text.

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

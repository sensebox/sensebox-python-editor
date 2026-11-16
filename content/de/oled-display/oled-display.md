---
connectionGuide: oled-display
name: OLED Display
subtitle: Informationen auf dem Display ausgeben
image: ../../images/oled-display.svg
imageAlt: OLED-Bildschirm mit Textzeilen
---

Text auf einem OLED-Display anzeigen.

## OLED-Display initialisieren

<!-- @slug oled-display-initialisieren -->

Richtet das OLED-Display ein.

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

## Text auf dem Display anzeigen

<!-- @slug oled-text-anzeigen -->

Ersetzt den Displayinhalt durch einen Text.

```python
display.fill(0)
display.text("Hallo senseBox!", 0, 0, 1)
display.show()
```

## OLED-Display vollständig verwenden

<!-- @slug oled-display-vollstaendig-verwenden -->

Richtet das OLED-Display ein und zeigt einen Text an.

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
display.text("Hallo senseBox!", 0, 0, 1)
display.show()
```

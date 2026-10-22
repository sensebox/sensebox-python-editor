---
name: OLED Display
subtitle: Informationen auf dem Display ausgeben
image: ../../images/oled-display.svg
imageAlt: OLED-Bildschirm mit Textzeilen
---

Die Komponente wird am I2C Port angeschlossen.

## Text auf dem Display anzeigen

<!-- @slug mit-wlan-netwerk-verbinden -->

Dieser Code zeigt "Hallo senseBox!" auf dem Display an.

```python
import board
import digitalio
import adafruit_ssd1306

# Stromversorgung der I/O-Anschlüsse aktivieren
io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

# OLED-Display initialisieren
i2c = board.I2C()
display = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c, addr=0x3D)

# Text ausgeben
display.fill(0)
display.text("Hallo senseBox!", 0, 0, 1)
display.show()
```

<!-- @details -->

Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

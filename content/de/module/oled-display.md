---
name: OLED Display
subtitle: Informationen auf dem Display ausgeben
image: ../../images/oled-display.svg
imageAlt: OLED-Bildschirm mit Textzeilen
---

Die Komponente wird am I²C-Port angeschlossen.

Füge zuerst **OLED-Display initialisieren** und danach **Text auf dem Display anzeigen** ein. Alternativ enthält **OLED-Display vollständig verwenden** beide Schritte.

## OLED-Display initialisieren

<!-- @slug oled-display-initialisieren -->

Schalte die senseBox-Anschlüsse ein und richte das Display ein:

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

Der Block legt das Displayobjekt unter dem Namen `display` an. Verwende dieses Objekt auch in den folgenden Blöcken.

## Text auf dem Display anzeigen

<!-- @slug oled-text-anzeigen -->

Lösche den bisherigen Inhalt und zeige „Hallo senseBox!“ an:

```python
display.fill(0)
display.text("Hallo senseBox!", 0, 0, 1)
display.show()
```

<!-- @details -->

Die beiden Zahlen `0, 0` bestimmen die Position des Textes. Der Block setzt voraus, dass `display` zuvor initialisiert wurde.

## OLED-Display vollständig verwenden

<!-- @slug oled-display-vollstaendig-verwenden -->

Dieses vollständige Beispiel initialisiert das Display und zeigt einen Text an:

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

<!-- @details -->

Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

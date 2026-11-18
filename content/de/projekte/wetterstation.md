---
name: Wetterstation
image: ../../images/wetterstation.svg
imageAlt: "HDC1080 mit OLED-Anzeige: Temperatur und Luftfeuchtigkeit wechseln alle zwei Sekunden"
---

Baue eine kleine Wetterstation mit dem HDC1080 und dem OLED-Display. Sie misst abwechselnd die Temperatur und die relative Luftfeuchtigkeit, jeweils direkt vor der Anzeige. Das Display zeigt abwechselnd für zwei Sekunden die Temperatur in °C und die Luftfeuchtigkeit in % an.

### So funktioniert's

1. Trenne die senseBox von der Stromversorgung und schließe den [HDC1080](doc:sensoren/temperatur) und das [OLED-Display](doc:oled-display/oled-display) an die I²C-Anschlüsse an.
2. Verbinde die senseBox wieder mit dem Computer und öffne den Code mit dem Button unten.
3. Übertrage ihn auf die senseBox.

```python
import time
import board
import digitalio
import adafruit_ssd1306
from hdc1080 import HDC1080

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False
time.sleep(0.1)

i2c = board.I2C()
sensor = HDC1080(i2c)
display = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c, addr=0x3D)

while True:
    temperature = sensor.temperature
    display.fill(0)
    display.text("Temperatur", 0, 0, 1)
    display.text("{:.1f} C".format(temperature), 0, 24, 1)
    display.show()
    time.sleep(2)

    humidity = sensor.humidity
    display.fill(0)
    display.text("Luftfeuchtigkeit", 0, 0, 1)
    display.text("{:.1f} %".format(humidity), 0, 24, 1)
    display.show()
    time.sleep(2)
```

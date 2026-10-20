---
name: Temperatur
subtitle: Temperatur und Luftfeuchtigkeit messen
image: ../../images/temperatur.svg
---

Der HDC1080 misst Temperatur und Luftfeuchtigkeit. Schließe ihn an einen I²C-Anschluss der senseBox an.

## Temperatur und Luftfeuchtigkeit messen

<!-- @slug temperatur-messen -->

Dieses Beispiel liest den Sensor alle zwei Sekunden aus und zeigt beide Messwerte in der Konsole an:

```python
import time
import board
import digitalio
from hdc1080 import HDC1080

# Anschlüsse der senseBox einschalten
io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

# Sensor verbinden
i2c = board.I2C()
sensor = HDC1080(i2c)

while True:
    temperature = sensor.temperature
    humidity = sensor.humidity

    print("Temperatur: {:.2f} °C".format(temperature))
    print("Luftfeuchtigkeit: {:.2f} %".format(humidity))

    time.sleep(2)
```

<!-- @details -->

Mit `time.sleep(2)` kannst du einstellen, wie viel Zeit zwischen den Messungen liegt. Weitere Informationen zur Ausgabe findest du unter [Ausgabe](doc:grundlagen/ausgabe).

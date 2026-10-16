---
name: Luftdruck
subtitle: Luftdruck messen
image: 
---

Der Luftdruck- und Temperatursensor wird über I²C angeschlossen.

## Luftdruck messen

<!-- @slug luftdruck-messen -->

Dieses Beispiel liest den Sensor jede Sekunde aus:

```python
import time
import board
import digitalio
from adafruit_dps310.basic import DPS310

# Stromversorgung der I/O-Pins aktivieren
io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False
i2c = board.I2C()
dps310 = DPS310(i2c, 0x76)

while True:
  print("Pressure = %.2f hPa" % dps310.pressure)
  print("")
  time.sleep(1.0)
```

<!-- @details -->

Die Werte kannst du mit [print](doc:grundlagen/ausgabe) ausgeben.
Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

---
name: Helligkeit und UV
subtitle: Helligkeit und UV-Werte messen
image: ../../images/helligkeit-uv.svg
imageAlt: Sonne für Helligkeit und UV-Strahlung
---

Der Helligkeits- und UV-Sensor wird über I²C angeschlossen.

## UV-Intensität messen

<!-- @slug uv-intensitaet-messen -->

Dieses Beispiel gibt die UV-Intensität und das Risikolevel in der Konsole aus:

```python
import time
import board
from adafruit_veml6070 import VEML6070

with board.I2C() as i2c:
  uv = VEML6070(i2c)

  # Führt 10 Messungen durch
  for j in range(10):
      uv_raw = uv.uv_raw
      risk_level = uv.get_index(uv_raw)
      print('Reading: {0} | Risk Level: {1}'.format(uv_raw, risk_level))
      time.sleep(1)
```

<!-- @details -->

Die Werte kannst du mit [print](doc:grundlagen/ausgabe) ausgeben.
Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

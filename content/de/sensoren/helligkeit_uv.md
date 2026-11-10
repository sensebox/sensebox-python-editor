---
connectionGuide: ltr329
name: Helligkeit und UV
subtitle: Helligkeit und UV-Werte messen
image: ../../images/helligkeit-uv.svg
imageAlt: Sonne für Helligkeit und UV-Strahlung
---

UV-Intensität und Risikolevel erfassen.

## UV-Sensor initialisieren

<!-- @slug uv-sensor-initialisieren -->

Richtet den UV-Sensor ein.

```python
import board
from adafruit_veml6070 import VEML6070

i2c = board.I2C()
uv = VEML6070(i2c)
```

## UV-Intensität und Risikolevel auslesen

<!-- @slug uv-intensitaet-messen -->

Liest den UV-Rohwert und das zugehörige Risikolevel aus.

```python
uv_rohwert = uv.uv_raw
risikolevel = uv.get_index(uv_rohwert)
print("UV-Wert: {0} | Risikolevel: {1}".format(uv_rohwert, risikolevel))
```

## UV-Sensor vollständig auslesen

<!-- @slug uv-sensor-vollstaendig-auslesen -->

Richtet den Sensor ein und führt zehn UV-Messungen durch.

```python
import time
import board
from adafruit_veml6070 import VEML6070

i2c = board.I2C()
uv = VEML6070(i2c)

for messung in range(10):
    uv_rohwert = uv.uv_raw
    risikolevel = uv.get_index(uv_rohwert)
    print("UV-Wert: {0} | Risikolevel: {1}".format(uv_rohwert, risikolevel))
    time.sleep(1)
```

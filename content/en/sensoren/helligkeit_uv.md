---
connectionGuide: ltr329
name: Brightness and UV
subtitle: Measure brightness and UV values
image: ../../images/helligkeit-uv.svg
imageAlt: Sun for brightness and UV radiation
---

Read UV intensity and risk level.

## Initialise UV sensor

<!-- @slug uv-sensor-initialisieren -->

Sets up the UV sensor.

```python
import board
from adafruit_veml6070 import VEML6070

i2c = board.I2C()
uv = VEML6070(i2c)
```

## Read UV intensity and risk level

<!-- @slug uv-intensitaet-messen -->

Reads the raw UV value and its risk level.

```python
uv_raw = uv.uv_raw
risk_level = uv.get_index(uv_raw)
print("UV value: {0} | Risk level: {1}".format(uv_raw, risk_level))
```

## Read UV sensor completely

<!-- @slug uv-sensor-vollstaendig-auslesen -->

Sets up the sensor and takes ten UV readings.

```python
import time
import board
from adafruit_veml6070 import VEML6070

i2c = board.I2C()
uv = VEML6070(i2c)

for measurement in range(10):
    uv_raw = uv.uv_raw
    risk_level = uv.get_index(uv_raw)
    print("UV value: {0} | Risk level: {1}".format(uv_raw, risk_level))
    time.sleep(1)
```

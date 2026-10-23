---
name: Brightness and UV
subtitle: Measure brightness and UV values
image: ../../images/helligkeit-uv.svg
imageAlt: Sun for brightness and UV radiation
---

The brightness and UV sensor is connected through I²C.

## Initialise UV sensor

<!-- @slug uv-sensor-initialisieren -->

Set up the I²C bus and UV sensor:

```python
import board
from adafruit_veml6070 import VEML6070

i2c = board.I2C()
uv = VEML6070(i2c)
```

<!-- @details -->

This creates the sensor as `uv`.

## Read UV intensity and risk level

<!-- @slug uv-intensitaet-messen -->

```python
uv_raw = uv.uv_raw
risk_level = uv.get_index(uv_raw)
print("UV value: {0} | Risk level: {1}".format(uv_raw, risk_level))
```

<!-- @details -->

`uv` must already be initialised. Output values with [print](doc:text/werte-ausgeben).

## Read UV sensor completely

<!-- @slug uv-sensor-vollstaendig-auslesen -->

This example initialises the sensor and takes ten readings one second apart:

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

<!-- @details -->

More information is available in the [senseBox documentation](https://docs.sensebox.de/en/).

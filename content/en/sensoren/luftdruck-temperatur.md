---
connectionGuide: dps310
name: Air pressure
subtitle: Measure air pressure
image: ../../images/luftdruck.svg
imageAlt: Gauge for air pressure
---

Measure air pressure using the DPS310.

## Initialise air-pressure sensor

<!-- @slug luftdrucksensor-initialisieren -->

Sets up the DPS310.

```python
import board
import digitalio
from adafruit_dps310.basic import DPS310

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

i2c = board.I2C()
dps310 = DPS310(i2c, 0x76)
```

## Read air pressure

<!-- @slug luftdruck-messen -->

Reads air pressure in hPa.

```python
pressure = dps310.pressure
print("Air pressure: %.2f hPa" % pressure)
```

## Read air-pressure sensor completely

<!-- @slug luftdrucksensor-vollstaendig-auslesen -->

Sets up the sensor and prints air pressure every second.

```python
import time
import board
import digitalio
from adafruit_dps310.basic import DPS310

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False
i2c = board.I2C()
dps310 = DPS310(i2c, 0x76)

while True:
    pressure = dps310.pressure
    print("Air pressure: %.2f hPa" % pressure)
    time.sleep(1)
```

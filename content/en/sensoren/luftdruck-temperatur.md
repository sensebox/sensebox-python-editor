---
name: Air pressure
subtitle: Measure air pressure
image: ../../images/luftdruck.svg
imageAlt: Gauge for air pressure
---

The air-pressure and temperature sensor is connected through I²C.

## Initialise air-pressure sensor

<!-- @slug luftdrucksensor-initialisieren -->

Enable the senseBox connections and set up the DPS310:

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

<!-- @details -->

This creates the sensor as `dps310`.

## Read air pressure

<!-- @slug luftdruck-messen -->

Read air pressure in hectopascals:

```python
pressure = dps310.pressure
print("Air pressure: %.2f hPa" % pressure)
```

<!-- @details -->

`dps310` must already be initialised.

## Read air-pressure sensor completely

<!-- @slug luftdrucksensor-vollstaendig-auslesen -->

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

<!-- @details -->

More information is available in the [senseBox documentation](https://docs.sensebox.de/en/).

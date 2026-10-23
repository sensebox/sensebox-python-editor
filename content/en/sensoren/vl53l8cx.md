---
name: ToF sensor
subtitle: Measure distances on an 8 × 8 grid
image: ../../images/tof-sensor.svg
imageAlt: Distance measurement grid
---

The VL53L8CX is a time-of-flight sensor. It measures 64 distances at once in an 8 × 8 grid.

## Initialise ToF sensor

<!-- @slug vl53l8cx-initialisieren -->

```python
import board
import busio
from digitalio import DigitalInOut, Direction
from vl53lxcx import VL53L8CX

i2c = busio.I2C(board.SCL, board.SDA, frequency=1_000_000)
lpn = DigitalInOut(board.D3)
lpn.direction = Direction.OUTPUT
lpn.value = True
tof = VL53L8CX(i2c, lpn=lpn)
tof.reset()

if not tof.is_alive():
    raise ValueError("VL53L8CX not detected")

tof.init()
```

<!-- @details -->

This creates the sensor as `tof`.

## Start 8 × 8 distance measurement

<!-- @slug vl53l8cx-distanzmessung-starten -->

```python
from vl53lxcx import DATA_DISTANCE_MM, DATA_TARGET_STATUS, RESOLUTION_8X8

tof.resolution = RESOLUTION_8X8
tof.ranging_freq = 2
tof.start_ranging({DATA_DISTANCE_MM, DATA_TARGET_STATUS})
```

<!-- @details -->

`RESOLUTION_8X8` returns a grid with 64 measurement fields. `ranging_freq = 2` selects two measurements per second. Initialise `tof` first.

## Read distance grid

<!-- @slug vl53l8cx-distanzraster-auslesen -->

```python
from vl53lxcx import STATUS_VALID
import time

while True:
    if tof.check_data_ready():
        results = tof.get_ranging_data()
        distance = results.distance_mm
        status = results.target_status
        for field, value in enumerate(distance):
            if status[field] == STATUS_VALID:
                print("Field %d: %d mm" % (field, value))

    time.sleep(0.01)
```

<!-- @details -->

The 64 field numbers run from `0` to `63`. A distance is printed only when its status is `STATUS_VALID`.

## Read ToF sensor completely

<!-- @slug vl53l8cx-vollstaendig-auslesen -->

```python
from vl53lxcx import DATA_DISTANCE_MM, DATA_TARGET_STATUS, RESOLUTION_8X8, STATUS_VALID, VL53L8CX
import busio
import board
import time
from digitalio import DigitalInOut, Direction

i2c = busio.I2C(board.SCL, board.SDA, frequency=1_000_000)
lpn = DigitalInOut(board.D3)
lpn.direction = Direction.OUTPUT
lpn.value = True
tof = VL53L8CX(i2c, lpn=lpn)

tof.reset()
if not tof.is_alive():
    raise ValueError("VL53L8CX not detected")
tof.init()
tof.resolution = RESOLUTION_8X8
tof.ranging_freq = 2
tof.start_ranging({DATA_DISTANCE_MM, DATA_TARGET_STATUS})

while True:
    if tof.check_data_ready():
        results = tof.get_ranging_data()
        for field, value in enumerate(results.distance_mm):
            if results.target_status[field] == STATUS_VALID:
                print("Field %d: %d mm" % (field, value))

    time.sleep(0.01)
```

<!-- @details -->

Adjust the measurement frequency and processing of the 64 measurement fields for your project.

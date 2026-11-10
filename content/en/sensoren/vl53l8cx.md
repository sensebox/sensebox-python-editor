---
connectionGuide: vl53l8cx
name: ToF sensor
subtitle: Measure distances on an 8 × 8 grid
image: ../../images/tof-sensor.svg
imageAlt: Distance measurement grid
---

Measure distances in a grid of 64 zones.

## Initialise ToF sensor

<!-- @slug vl53l8cx-initialisieren -->

Sets up the ToF sensor.

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

## Start 8 × 8 distance measurement

<!-- @slug vl53l8cx-distanzmessung-starten -->

Starts distance measurement using an 8 × 8 grid.

```python
from vl53lxcx import DATA_DISTANCE_MM, DATA_TARGET_STATUS, RESOLUTION_8X8

tof.resolution = RESOLUTION_8X8
tof.ranging_freq = 2
tof.start_ranging({DATA_DISTANCE_MM, DATA_TARGET_STATUS})
```

## Read distance grid

<!-- @slug vl53l8cx-distanzraster-auslesen -->

Prints valid distance readings in millimetres.

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

## Read ToF sensor completely

<!-- @slug vl53l8cx-vollstaendig-auslesen -->

Sets up the sensor and continuously prints valid distances.

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

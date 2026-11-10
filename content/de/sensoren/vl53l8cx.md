---
connectionGuide: vl53l8cx
name: Time-of-Flight (ToF) Sensor
subtitle: Entfernungen in einem 8 × 8-Raster messen
image: ../../images/tof-sensor.svg
imageAlt: Entfernungsmessung in einem Raster
---

<!--
(c) 2026, Micro:bit Educational Foundation and contributors
SPDX-License-Identifier: MIT
-->

Entfernungen in einem Raster mit 64 Messfeldern erfassen.

## ToF-Sensor initialisieren

<!-- @slug vl53l8cx-initialisieren -->

Richtet den ToF-Sensor ein.

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
    raise ValueError("VL53L8CX nicht erkannt")

tof.init()
```

## 8 × 8-Distanzmessung starten

<!-- @slug vl53l8cx-distanzmessung-starten -->

Startet die Distanzmessung mit einem 8 × 8-Raster.

```python
from vl53lxcx import DATA_DISTANCE_MM, DATA_TARGET_STATUS, RESOLUTION_8X8

tof.resolution = RESOLUTION_8X8
tof.ranging_freq = 2
tof.start_ranging({DATA_DISTANCE_MM, DATA_TARGET_STATUS})
```

## Distanzraster auslesen

<!-- @slug vl53l8cx-distanzraster-auslesen -->

Gibt die gültigen Entfernungswerte in Millimetern aus.

```python
from vl53lxcx import STATUS_VALID
import time

while True:
    if tof.check_data_ready():
        results = tof.get_ranging_data()
        distance = results.distance_mm
        status = results.target_status

        for messfeld, entfernung in enumerate(distance):
            if status[messfeld] == STATUS_VALID:
                print("Messfeld %d: %d mm" % (messfeld, entfernung))

    time.sleep(0.01)
```

## ToF-Sensor vollständig auslesen

<!-- @slug vl53l8cx-vollstaendig-auslesen -->

Richtet den Sensor ein und gibt fortlaufend gültige Entfernungen aus.

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


def main():
    tof.reset()
    if not tof.is_alive():
        raise ValueError("VL53L8CX nicht erkannt")

    tof.init()
    tof.resolution = RESOLUTION_8X8
    tof.ranging_freq = 2
    tof.start_ranging({DATA_DISTANCE_MM, DATA_TARGET_STATUS})

    while True:
        if tof.check_data_ready():
            results = tof.get_ranging_data()
            distance = results.distance_mm
            status = results.target_status

            for messfeld, entfernung in enumerate(distance):
                if status[messfeld] == STATUS_VALID:
                    print("Messfeld %d: %d mm" % (messfeld, entfernung))

        time.sleep(0.01)


main()
```

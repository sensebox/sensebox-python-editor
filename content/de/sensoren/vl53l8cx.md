---
name: Time-of-Flight (ToF) Sensor
subtitle: Entfernungen in einem 8 × 8-Raster messen
image: ../../images/tof-sensor.svg
imageAlt: Entfernungsmessung in einem Raster
---

<!--
(c) 2026, Micro:bit Educational Foundation and contributors
SPDX-License-Identifier: MIT
-->

Der Time-of-Flight-Sensor misst Entfernungen gleichzeitig in 64 Feldern. Er wird über I²C an die senseBox angeschlossen.

Füge zuerst **ToF-Sensor initialisieren** und danach **8 × 8-Distanzmessung starten** ein. Im Anschluss kannst du die Messwerte mit **Distanzraster auslesen** verarbeiten. Alternativ enthält **ToF-Sensor vollständig auslesen** ein direkt ausführbares Gesamtbeispiel.

## ToF-Sensor initialisieren

<!-- @slug vl53l8cx-initialisieren -->

Richte die Verbindung zum Sensor ein:

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

<!-- @details -->

Der Block legt das Sensorobjekt unter dem Namen `tof` an. Verwende dieses Objekt auch in den folgenden Blöcken. `is_alive()` prüft, ob der Sensor über I²C erreichbar ist.

## 8 × 8-Distanzmessung starten

<!-- @slug vl53l8cx-distanzmessung-starten -->

Stelle die Auflösung und Messfrequenz ein und starte die Messung:

```python
from vl53lxcx import DATA_DISTANCE_MM, DATA_TARGET_STATUS, RESOLUTION_8X8

tof.resolution = RESOLUTION_8X8
tof.ranging_freq = 2
tof.start_ranging({DATA_DISTANCE_MM, DATA_TARGET_STATUS})
```

<!-- @details -->

Mit `RESOLUTION_8X8` liefert der Sensor ein Raster mit 64 Messfeldern. `ranging_freq = 2` stellt zwei Messungen pro Sekunde ein. Der Block setzt voraus, dass `tof` zuvor initialisiert wurde.

## Distanzraster auslesen

<!-- @slug vl53l8cx-distanzraster-auslesen -->

Warte auf neue Daten und gib für jedes gültige Messfeld die Entfernung in Millimetern aus:

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

<!-- @details -->

Die Nummern der 64 Messfelder reichen von `0` bis `63`. Ein Entfernungswert wird nur ausgegeben, wenn der zugehörige Status `STATUS_VALID` ist. Der Block setzt voraus, dass die Distanzmessung zuvor gestartet wurde.

## ToF-Sensor vollständig auslesen

<!-- @slug vl53l8cx-vollstaendig-auslesen -->

Dieses vollständige Beispiel initialisiert den Sensor, startet die Messung und gibt fortlaufend alle gültigen Entfernungen aus:

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

<!-- @details -->

Die Messfrequenz und die Verarbeitung der 64 Messfelder können für das eigene Projekt angepasst werden.

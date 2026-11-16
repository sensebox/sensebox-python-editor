---
connectionGuide: dps310
name: Luftdruck
subtitle: Luftdruck messen
image: ../../images/luftdruck.svg
imageAlt: Messanzeige für den Luftdruck
---

Luftdruck mit dem DPS310 messen.

## Luftdrucksensor initialisieren

<!-- @slug luftdrucksensor-initialisieren -->

Richtet den DPS310 ein.

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

## Luftdruck auslesen

<!-- @slug luftdruck-messen -->

Liest den Luftdruck in hPa aus.

```python
luftdruck = dps310.pressure
print("Luftdruck: %.2f hPa" % luftdruck)
```

## Luftdrucksensor vollständig auslesen

<!-- @slug luftdrucksensor-vollstaendig-auslesen -->

Richtet den Sensor ein und gibt jede Sekunde den Luftdruck aus.

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
    luftdruck = dps310.pressure
    print("Luftdruck: %.2f hPa" % luftdruck)
    time.sleep(1)
```

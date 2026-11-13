---
connectionGuide: hdc1080
name: Temperatur
subtitle: Temperatur und Luftfeuchtigkeit messen
image: ../../images/temperatur.svg
imageAlt: Temperaturanzeige in Grad Celsius
---

Temperatur und relative Luftfeuchtigkeit mit dem HDC1080 messen.

## HDC1080 initialisieren

<!-- @slug hdc1080-initialisieren -->

Richtet den HDC1080 ein.

```python
import time
import board
import digitalio
from hdc1080 import HDC1080

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False
time.sleep(0.1)

i2c = board.I2C()
sensor = HDC1080(i2c)
```

## Temperatur messen

<!-- @slug temperatur-messen -->

Liest die Temperatur in °C aus.

```python
temperatur = sensor.temperature
print("Temperatur: {:.2f} °C".format(temperatur))
```

## Luftfeuchtigkeit messen

<!-- @slug hdc1080-luftfeuchtigkeit-messen -->

Liest die relative Luftfeuchtigkeit in % aus.

```python
luftfeuchtigkeit = sensor.humidity
print("Luftfeuchtigkeit: {:.2f} %".format(luftfeuchtigkeit))
```

## HDC1080 vollständig auslesen

<!-- @slug hdc1080-vollstaendig-auslesen -->

Richtet den Sensor ein und gibt alle zwei Sekunden Temperatur und Luftfeuchtigkeit aus.

```python
import time
import board
import digitalio
from hdc1080 import HDC1080

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False
time.sleep(0.1)

i2c = board.I2C()
sensor = HDC1080(i2c)

while True:
    temperatur = sensor.temperature
    luftfeuchtigkeit = sensor.humidity

    print("Temperatur: {:.2f} °C".format(temperatur))
    print("Luftfeuchtigkeit: {:.2f} %".format(luftfeuchtigkeit))
    time.sleep(2)
```

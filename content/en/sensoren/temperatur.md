---
connectionGuide: hdc1080
name: Temperature
subtitle: Measure temperature and humidity
image: ../../images/temperatur.svg
imageAlt: Temperature display in degrees Celsius
---

Measure temperature and relative humidity using the HDC1080.

## Initialise HDC1080

<!-- @slug hdc1080-initialisieren -->

Sets up the HDC1080.

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

## Measure temperature

<!-- @slug temperatur-messen -->

Reads temperature in °C.

```python
temperature = sensor.temperature
print("Temperature: {:.2f} °C".format(temperature))
```

## Measure humidity

<!-- @slug hdc1080-luftfeuchtigkeit-messen -->

Reads relative humidity in %.

```python
humidity = sensor.humidity
print("Humidity: {:.2f} %".format(humidity))
```

## Read HDC1080 completely

<!-- @slug hdc1080-vollstaendig-auslesen -->

Sets up the sensor and prints temperature and humidity every two seconds.

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
    temperature = sensor.temperature
    humidity = sensor.humidity
    print("Temperature: {:.2f} °C".format(temperature))
    print("Humidity: {:.2f} %".format(humidity))
    time.sleep(2)
```

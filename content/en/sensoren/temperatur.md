---
name: Temperature
subtitle: Measure temperature and humidity
image: ../../images/temperatur.svg
imageAlt: Temperature display in degrees Celsius
---

The HDC1080 measures temperature and humidity. Connect it to an I²C port on the senseBox.

## Initialise HDC1080

<!-- @slug hdc1080-initialisieren -->

Enable the senseBox connections and set up the sensor:

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

<!-- @details -->

The short wait lets the power supply stabilise. The HDC1080 is created as `sensor`.

## Measure temperature

<!-- @slug temperatur-messen -->

```python
temperature = sensor.temperature
print("Temperature: {:.2f} °C".format(temperature))
```

<!-- @details -->

`sensor` must already be initialised.

## Measure humidity

<!-- @slug hdc1080-luftfeuchtigkeit-messen -->

```python
humidity = sensor.humidity
print("Humidity: {:.2f} %".format(humidity))
```

<!-- @details -->

`sensor` must already be initialised.

## Read HDC1080 completely

<!-- @slug hdc1080-vollstaendig-auslesen -->

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

<!-- @details -->

Use `time.sleep(2)` to set the time between readings. Learn more in [Print values](doc:text/werte-ausgeben).

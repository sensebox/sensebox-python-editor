---
name: Weather Station
image: ../../images/wetterstation.svg
imageAlt: HDC1080 with OLED display alternating between temperature and humidity every two seconds
---

Build a small weather station with the HDC1080 and OLED display. It measures temperature and relative humidity in turn, just before displaying each value. The display alternates between temperature in °C and humidity in %, showing each for two seconds.

### Here's how it works

1. Disconnect the senseBox from power and connect the [HDC1080](doc:sensoren/temperatur) and [OLED display](doc:oled-display/oled-display) to the I²C ports.
2. Reconnect the senseBox to your computer and open the code using the button below.
3. Upload it to the senseBox.

```python
import time
import board
import digitalio
import adafruit_ssd1306
from hdc1080 import HDC1080

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False
time.sleep(0.1)

i2c = board.I2C()
sensor = HDC1080(i2c)
display = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c, addr=0x3D)

while True:
    temperature = sensor.temperature
    display.fill(0)
    display.text("Temperature", 0, 0, 1)
    display.text("{:.1f} C".format(temperature), 0, 24, 1)
    display.show()
    time.sleep(2)

    humidity = sensor.humidity
    display.fill(0)
    display.text("Humidity", 0, 0, 1)
    display.text("{:.1f} %".format(humidity), 0, 24, 1)
    display.show()
    time.sleep(2)
```

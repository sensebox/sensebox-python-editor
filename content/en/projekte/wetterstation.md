---
name: Weather Station
image: ../../images/wetterstation.svg
---

Build a simple weather station that regularly displays the temperature.

### Here's how it works

1. Connect the [temperature sensor](doc:sensoren/temperatur).
2. Open the code using the button below.
3. Upload it to the senseBox.

```python
import time

while True:
    print(“Temperature: 21.5”)
    time.sleep(10)
```
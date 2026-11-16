---
name: Photodiode
subtitle: Read photodiode values
image: ../../images/photodiode.svg
imageAlt: Photodiode with incoming light rays
---

Read light levels using the built-in photodiode.

## Initialise photodiode

<!-- @slug photodiode-initialisieren -->

Sets up the analogue input for the photodiode.

```python
import time
import board
import analogio
import digitalio

pd_power = digitalio.DigitalInOut(board.PD_POWER)
pd_power.direction = digitalio.Direction.OUTPUT
pd_power.value = True
time.sleep(0.1)

photodiode = analogio.AnalogIn(board.PD_PIN)
```

## Read photodiode and calculate voltage

<!-- @slug photodiode-auslesen-und-spannung-berechnen -->

Reads the raw value and calculates the voltage.

```python
def get_voltage(raw_value, reference_voltage):
    return (raw_value * reference_voltage) / 65535

while True:
    raw_value = photodiode.value
    voltage = get_voltage(raw_value, photodiode.reference_voltage)
    print(f"Raw value: {raw_value} | Voltage: {voltage:.2f} V")
    time.sleep(1)
```

## Read photodiode completely

<!-- @slug photodiode-vollstaendig-auslesen -->

Sets up the photodiode and prints the raw value and voltage every second.

```python
import time
import board
import analogio
import digitalio

pd_power = digitalio.DigitalInOut(board.PD_POWER)
pd_power.direction = digitalio.Direction.OUTPUT
pd_power.value = True
time.sleep(0.1)
photodiode = analogio.AnalogIn(board.PD_PIN)

def get_voltage(raw_value, reference_voltage):
    return (raw_value * reference_voltage) / 65535

while True:
    raw_value = photodiode.value
    voltage = get_voltage(raw_value, photodiode.reference_voltage)
    print(f"Raw value: {raw_value} | Voltage: {voltage:.2f} V")
    time.sleep(1)
```

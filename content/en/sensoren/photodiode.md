---
name: Photodiode
subtitle: Read photodiode values
image: ../../images/photodiode.svg
imageAlt: Photodiode with incoming light rays
---

The photodiode is built into the MCU S2, so nothing else needs to be connected.

## Initialise photodiode

<!-- @slug photodiode-initialisieren -->

Enable the photodiode power supply and set up the analogue input:

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

<!-- @details -->

The brief wait stabilises the circuit. The analogue input is created as `photodiode`.

## Read photodiode and calculate voltage

<!-- @slug photodiode-auslesen-und-spannung-berechnen -->

Read the photodiode every second and convert its raw value to a voltage:

```python
def get_voltage(raw_value, reference_voltage):
    return (raw_value * reference_voltage) / 65535

while True:
    raw_value = photodiode.value
    voltage = get_voltage(raw_value, photodiode.reference_voltage)
    print(f"Raw value: {raw_value} | Voltage: {voltage:.2f} V")
    time.sleep(1)
```

<!-- @details -->

`photodiode` must be initialised and `time` must be imported. Both values come from the same reading.

## Read photodiode completely

<!-- @slug photodiode-vollstaendig-auslesen -->

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

<!-- @details -->

Output the values with [print](doc:text/werte-ausgeben). More information is available in the [senseBox documentation](https://docs.sensebox.de/en/).

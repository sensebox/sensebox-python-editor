---
name: Photodiode
subtitle: Werte der Photodiode auslesen
image: ../../images/photodiode.svg
imageAlt: Photodiode mit einfallenden Lichtstrahlen
---

Helligkeit über die eingebaute Photodiode erfassen.

## Photodiode initialisieren

<!-- @slug photodiode-initialisieren -->

Richtet den analogen Eingang der Photodiode ein.

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

## Photodiode auslesen und Spannung berechnen

<!-- @slug photodiode-auslesen-und-spannung-berechnen -->

Liest den Rohwert aus und berechnet die Spannung.

```python
def get_voltage(raw_value, reference_voltage):
    return (raw_value * reference_voltage) / 65535


while True:
    raw_value = photodiode.value
    voltage = get_voltage(raw_value, photodiode.reference_voltage)

    print(f"Rohwert: {raw_value} | Spannung: {voltage:.2f} V")
    time.sleep(1)
```

## Photodiode vollständig auslesen

<!-- @slug photodiode-vollstaendig-auslesen -->

Richtet die Photodiode ein und gibt jede Sekunde Rohwert und Spannung aus.

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

    print(f"Rohwert: {raw_value} | Spannung: {voltage:.2f} V")
    time.sleep(1)
```

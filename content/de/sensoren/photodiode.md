---
name: Photodiode
subtitle: Werte der Photodiode auslesen
image: ../../images/photodiode.svg
imageAlt: Photodiode mit einfallenden Lichtstrahlen
---

Die Photodiode ist auf der MCU S2 verbaut! Du musst hier also nichts weiter anschließen.

## Photodiode initialisieren

<!-- @slug photodiode-initialisieren -->

In diesem Block wird die Stromversorgung der Photodiode aktiviert und der analoge Eingang eingerichtet:

```python
import time
import board
import analogio
import digitalio

# Stromversorgung der eingebauten Photodiode einschalten
pd_power = digitalio.DigitalInOut(board.PD_POWER)
pd_power.direction = digitalio.Direction.OUTPUT
pd_power.value = True

# Kurz warten, bis die Schaltung stabil ist
time.sleep(0.1)

# Analoge Messleitung der Photodiode
photodiode = analogio.AnalogIn(board.PD_PIN)
```

<!-- @details -->

Die Werte kannst du mit [print](doc:grundlagen/ausgabe) ausgeben.
Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

## Photodiode auslesen und Spannung berechnen

<!-- @slug photodiode-auslesen-und-spannung-berechnen -->

In diesem Block wird die Photodiode jede Sekunde ausgelesen. Der gemessene Rohwert wird in eine Spannung umgerechnet. Beide Werte werden anschließend ausgegeben.

```python
# Wandelt den Rohwert des Sensors in eine Spannung (Volt) um
def get_voltage(raw_value, reference_voltage):
    return (raw_value * reference_voltage) / 65535

while True:
    # Photodiode genau einmal auslesen
    raw_value = photodiode.value

    # Spannung aus demselben Messwert berechnen
    voltage = get_voltage(
        raw_value,
        photodiode.reference_voltage
    )

    print(
        f"Rohwert: {raw_value} | "
        f"Spannung: {voltage:.2f} V"
    )

    time.sleep(1)
```

<!-- @details -->

Die Werte kannst du mit [print](doc:grundlagen/ausgabe) ausgeben.
Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

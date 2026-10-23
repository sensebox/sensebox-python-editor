---
name: Photodiode
subtitle: Werte der Photodiode auslesen
image: ../../images/photodiode.svg
imageAlt: Photodiode mit einfallenden Lichtstrahlen
---

Die Photodiode ist auf der MCU S2 verbaut. Du musst hier also nichts weiter anschließen.

Füge zuerst **Photodiode initialisieren** und danach **Photodiode auslesen und Spannung berechnen** ein. Alternativ enthält **Photodiode vollständig auslesen** beide Schritte.

## Photodiode initialisieren

<!-- @slug photodiode-initialisieren -->

Aktiviere die Stromversorgung der Photodiode und richte den analogen Eingang ein:

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

Der Block wartet kurz, bis die Schaltung stabil ist, und legt den analogen Eingang unter dem Namen `photodiode` an.

## Photodiode auslesen und Spannung berechnen

<!-- @slug photodiode-auslesen-und-spannung-berechnen -->

Lies die Photodiode jede Sekunde aus und rechne den Rohwert in eine Spannung um:

```python
def get_voltage(raw_value, reference_voltage):
    return (raw_value * reference_voltage) / 65535


while True:
    raw_value = photodiode.value
    voltage = get_voltage(raw_value, photodiode.reference_voltage)

    print(f"Rohwert: {raw_value} | Spannung: {voltage:.2f} V")
    time.sleep(1)
```

<!-- @details -->

Der Block setzt voraus, dass `photodiode` zuvor initialisiert und `time` importiert wurde. Beide Werte stammen jeweils aus derselben Messung.

## Photodiode vollständig auslesen

<!-- @slug photodiode-vollstaendig-auslesen -->

Dieses vollständige Beispiel initialisiert die Photodiode und gibt jede Sekunde Rohwert und Spannung aus:

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

<!-- @details -->

Die Werte kannst du mit [print](doc:text/werte-ausgeben) ausgeben. Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

---
name: Luftdruck
subtitle: Luftdruck messen
image: ../../images/luftdruck.svg
imageAlt: Messanzeige für den Luftdruck
---

Der Luftdruck- und Temperatursensor wird über I²C angeschlossen.

Füge zuerst **Luftdrucksensor initialisieren** und danach **Luftdruck auslesen** ein. Alternativ enthält **Luftdrucksensor vollständig auslesen** beide Schritte und wiederholt die Messung.

## Luftdrucksensor initialisieren

<!-- @slug luftdrucksensor-initialisieren -->

Schalte die senseBox-Anschlüsse ein und richte den DPS310 ein:

```python
import board
import digitalio
from adafruit_dps310.basic import DPS310

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

i2c = board.I2C()
dps310 = DPS310(i2c, 0x76)
```

<!-- @details -->

Der Block legt den Sensor unter dem Namen `dps310` an. Verwende dieses Objekt auch im folgenden Block.

## Luftdruck auslesen

<!-- @slug luftdruck-messen -->

Lies den Luftdruck in Hektopascal aus:

```python
luftdruck = dps310.pressure
print("Luftdruck: %.2f hPa" % luftdruck)
```

<!-- @details -->

Der Block setzt voraus, dass `dps310` zuvor initialisiert wurde. Die Werte kannst du mit [print](doc:text/werte-ausgeben) ausgeben.

## Luftdrucksensor vollständig auslesen

<!-- @slug luftdrucksensor-vollstaendig-auslesen -->

Dieses vollständige Beispiel initialisiert den Sensor und gibt den Luftdruck jede Sekunde aus:

```python
import time
import board
import digitalio
from adafruit_dps310.basic import DPS310

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False

i2c = board.I2C()
dps310 = DPS310(i2c, 0x76)

while True:
    luftdruck = dps310.pressure
    print("Luftdruck: %.2f hPa" % luftdruck)
    time.sleep(1)
```

<!-- @details -->

Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

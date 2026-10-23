---
name: Temperatur
subtitle: Temperatur und Luftfeuchtigkeit messen
image: ../../images/temperatur.svg
imageAlt: Temperaturanzeige in Grad Celsius
---

Der HDC1080 misst Temperatur und Luftfeuchtigkeit. Schließe ihn an einen I²C-Anschluss der senseBox an.

Füge zuerst **HDC1080 initialisieren** ein. Danach kannst du Temperatur und Luftfeuchtigkeit getrennt messen. Das letzte Beispiel fasst alle Schritte zusammen.

## HDC1080 initialisieren

<!-- @slug hdc1080-initialisieren -->

Schalte die senseBox-Anschlüsse ein und richte den Sensor ein:

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

Der Block wartet kurz, bis die Stromversorgung stabil ist, und legt den HDC1080 unter dem Namen `sensor` an. Verwende dieses Objekt auch in den folgenden Blöcken.

## Temperatur messen

<!-- @slug temperatur-messen -->

Lies die Temperatur in Grad Celsius aus:

```python
temperatur = sensor.temperature
print("Temperatur: {:.2f} °C".format(temperatur))
```

<!-- @details -->

Der Block setzt voraus, dass `sensor` zuvor initialisiert wurde.

## Luftfeuchtigkeit messen

<!-- @slug hdc1080-luftfeuchtigkeit-messen -->

Lies die relative Luftfeuchtigkeit in Prozent aus:

```python
luftfeuchtigkeit = sensor.humidity
print("Luftfeuchtigkeit: {:.2f} %".format(luftfeuchtigkeit))
```

<!-- @details -->

Der Block setzt voraus, dass `sensor` zuvor initialisiert wurde.

## HDC1080 vollständig auslesen

<!-- @slug hdc1080-vollstaendig-auslesen -->

Dieses vollständige Beispiel initialisiert den Sensor und gibt beide Messwerte alle zwei Sekunden aus:

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
    temperatur = sensor.temperature
    luftfeuchtigkeit = sensor.humidity

    print("Temperatur: {:.2f} °C".format(temperatur))
    print("Luftfeuchtigkeit: {:.2f} %".format(luftfeuchtigkeit))
    time.sleep(2)
```

<!-- @details -->

Mit `time.sleep(2)` kannst du einstellen, wie viel Zeit zwischen den Messungen liegt. Weitere Informationen zur Ausgabe findest du unter [Ausgabe](doc:text/werte-ausgeben).

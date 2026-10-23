---
name: Helligkeit und UV
subtitle: Helligkeit und UV-Werte messen
image: ../../images/helligkeit-uv.svg
imageAlt: Sonne für Helligkeit und UV-Strahlung
---

Der Helligkeits- und UV-Sensor wird über I²C angeschlossen.

Füge zuerst **UV-Sensor initialisieren** und danach **UV-Intensität und Risikolevel auslesen** ein. Alternativ enthält **UV-Sensor vollständig auslesen** ein direkt ausführbares Gesamtbeispiel.

## UV-Sensor initialisieren

<!-- @slug uv-sensor-initialisieren -->

Richte den I²C-Bus und den UV-Sensor ein:

```python
import board
from adafruit_veml6070 import VEML6070

i2c = board.I2C()
uv = VEML6070(i2c)
```

<!-- @details -->

Der Block legt den Sensor unter dem Namen `uv` an. Verwende dieses Objekt auch in den folgenden Blöcken.

## UV-Intensität und Risikolevel auslesen

<!-- @slug uv-intensitaet-messen -->

Lies den UV-Rohwert aus und bestimme das zugehörige Risikolevel:

```python
uv_rohwert = uv.uv_raw
risikolevel = uv.get_index(uv_rohwert)
print("UV-Wert: {0} | Risikolevel: {1}".format(uv_rohwert, risikolevel))
```

<!-- @details -->

Der Block setzt voraus, dass `uv` zuvor initialisiert wurde. Die Werte kannst du mit [print](doc:text/werte-ausgeben) ausgeben.

## UV-Sensor vollständig auslesen

<!-- @slug uv-sensor-vollstaendig-auslesen -->

Dieses vollständige Beispiel initialisiert den Sensor und führt zehn Messungen im Abstand von einer Sekunde durch:

```python
import time
import board
from adafruit_veml6070 import VEML6070

i2c = board.I2C()
uv = VEML6070(i2c)

for messung in range(10):
    uv_rohwert = uv.uv_raw
    risikolevel = uv.get_index(uv_rohwert)
    print("UV-Wert: {0} | Risikolevel: {1}".format(uv_rohwert, risikolevel))
    time.sleep(1)
```

<!-- @details -->

Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

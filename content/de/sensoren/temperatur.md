---
name: Temperatur
subtitle: Temperatur und Luftfeuchtigkeit messen
image: ../../images/temperatur.svg
---

Der Temperatur- und Luftfeuchtigkeitssensor wird über I²C angeschlossen.

## Temperatur messen

<!-- @slug temperatur-messen -->

Dieses Beispiel liest den Sensor jede Sekunde aus:

```python
import time
import board

i2c = board.I2C()

while True:
    # Sensor auslesen und Wert ausgeben
    print("Temperatur messen ...")
    time.sleep(1)
```

<!-- @details -->

Die Werte kannst du mit [print](doc:grundlagen/ausgabe) ausgeben.
Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

---
name: Wetterstation
image: ../../images/wetterstation.svg
---

Baue eine einfache Wetterstation, die regelmäßig die Temperatur ausgibt.

### So funktioniert's

1. Schließe den [Temperatursensor](doc:sensoren/temperatur) an.
2. Öffne den Code mit dem Button unten.
3. Übertrage ihn auf die senseBox.

```python
import time

while True:
    print("Temperatur: 21.5")
    time.sleep(10)
```

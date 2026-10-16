---
name: RGB-LED
subtitle: verschiedene Farben darstellen
image: 
---

Die RGB-LED ist auf der MCU S2 verbaut! Du musst hier also nichts weiter anschließen.

## RGB LED leuchten lassen

<!-- @slug rgb-led-leuchten-lassen -->

Dieser Code lässt die RGB-LED alle 250 ms in der angegebenen Farbe leuchten.

```python
import time
import board
import neopixel

# NeoPixel initialisieren
pixel = neopixel.NeoPixel(board.D1, 1, pixel_order=neopixel.GRB)

# LED blinken lassen
while True:
    pixel[0] = (0, 255, 0)  # Grün
    time.sleep(0.25)
    pixel[0] = (0, 0, 0)    # Aus
    time.sleep(0.25)
```

<!-- @details -->

Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

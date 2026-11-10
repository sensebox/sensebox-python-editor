---
name: RGB-LED
subtitle: verschiedene Farben darstellen
image: ../../images/rgb-led.svg
imageAlt: Rot, grün und blau leuchtende LED
---

Die RGB-LED ist auf der MCU S2 verbaut. Du musst hier also nichts weiter anschließen.

Füge zuerst **RGB-LED initialisieren** ein. Danach kannst du mit **Farbe einstellen** eine Farbe anzeigen oder mit **RGB-LED blinken lassen** die LED blinken lassen. Das letzte Beispiel fasst Initialisierung und Blinken zusammen.

## RGB-LED initialisieren

<!-- @slug rgb-led-initialisieren -->

Richte die eingebaute RGB-LED ein:

```python
import board
import neopixel

pixel = neopixel.NeoPixel(board.D1, 1, pixel_order=neopixel.GRB)
```

<!-- @details -->

Der Block legt die LED unter dem Namen `pixel` an. Verwende dieses Objekt auch in den folgenden Blöcken.

## Farbe einstellen

<!-- @slug rgb-led-farbe-einstellen -->

Lass die RGB-LED grün leuchten:

```python
pixel[0] = (0, 255, 0)
```

<!-- @details -->

Die drei Zahlen stehen für Rot, Grün und Blau und dürfen jeweils zwischen `0` und `255` liegen. Mit `(0, 0, 0)` schaltest du die LED aus.

## RGB-LED blinken lassen

<!-- @slug rgb-led-leuchten-lassen -->

Lass die zuvor initialisierte LED alle 250 Millisekunden grün blinken:

```python
import time

while True:
    pixel[0] = (0, 255, 0)
    time.sleep(0.25)
    pixel[0] = (0, 0, 0)
    time.sleep(0.25)
```

<!-- @details -->

Der Block setzt voraus, dass `pixel` zuvor initialisiert wurde. Passe die Farbwerte und die Wartezeit für dein Projekt an.

## RGB-LED vollständig blinken lassen

<!-- @slug rgb-led-vollstaendig-blinken-lassen -->

Dieses vollständige Beispiel initialisiert die RGB-LED und lässt sie grün blinken:

```python
import time
import board
import neopixel

pixel = neopixel.NeoPixel(board.D1, 1, pixel_order=neopixel.GRB)

while True:
    pixel[0] = (0, 255, 0)
    time.sleep(0.25)
    pixel[0] = (0, 0, 0)
    time.sleep(0.25)
```

<!-- @details -->

Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

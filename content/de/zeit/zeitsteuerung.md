---
name: Zeitsteuerung
subtitle: Warten, Laufzeit messen und Aktionen regelmäßig ausführen
image: ../../images/zeit.svg
---

Die Zeitsteuerungs-Bausteine verwenden das in CircuitPython eingebaute Modul `time`.

## Millisekunden warten

Der Baustein verwendet Millisekunden, `time.sleep()` erwartet Sekunden. Deshalb wird durch `1000` geteilt.

```python
import time

millisekunden = 1000
time.sleep(millisekunden / 1000)
```

## Mikrosekunden warten

Für Mikrosekunden wird durch `1_000_000` geteilt.

```python
import time

mikrosekunden = 100
time.sleep(mikrosekunden / 1_000_000)
```

## Vergangene Millisekunden

`time.monotonic()` zählt die Sekunden seit dem Start der senseBox und wird nicht durch eine Änderung der Uhrzeit beeinflusst.

```python
import time

millisekunden_seit_start = int(time.monotonic() * 1000)
```

## Vergangene Mikrosekunden

```python
import time

mikrosekunden_seit_start = int(time.monotonic() * 1_000_000)
```

## Für immer warten

Die Endlosschleife schläft, damit sie nicht unnötig Rechenzeit verbraucht.

```python
import time

while True:
    time.sleep(3600)
```

## Messintervall

Der eingerückte Code wird regelmäßig ausgeführt. Die monotone Uhr vermeidet Probleme durch geänderte Datums- oder Uhrzeitwerte.

```python
import time

intervall = 10

while True:
    print("Messung")
    time.sleep(intervall)
```

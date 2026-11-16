---
name: Zeitsteuerung
subtitle: Warten, Laufzeit messen und Aktionen regelmäßig ausführen
image: ../../images/zeit.svg
---

Wartezeiten, Laufzeiten und Messintervalle steuern.

## Millisekunden warten

Pausiert das Programm für die angegebene Anzahl Millisekunden.

```python
import time

millisekunden = 1000
time.sleep(millisekunden / 1000)
```

## Mikrosekunden warten

Pausiert das Programm für die angegebene Anzahl Mikrosekunden.

```python
import time

mikrosekunden = 100
time.sleep(mikrosekunden / 1_000_000)
```

## Vergangene Millisekunden

Ermittelt die vergangene Laufzeit in Millisekunden.

```python
import time

millisekunden_seit_start = int(time.monotonic() * 1000)
```

## Vergangene Mikrosekunden

Ermittelt die vergangene Laufzeit in Mikrosekunden.

```python
import time

mikrosekunden_seit_start = int(time.monotonic() * 1_000_000)
```

## Für immer warten

Hält das Programm dauerhaft in einer Warteschleife.

```python
import time

while True:
    time.sleep(3600)
```

## Messintervall

Führt Code in einem regelmäßigen Zeitabstand aus.

```python
import time

intervall = 10

while True:
    print("Messung")
    time.sleep(intervall)
```

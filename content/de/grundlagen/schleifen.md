---
name: Schleifen
subtitle: Code wiederholen
image: ../../images/schleifen.svg
---

Schleifen führen Code mehrfach aus.

## Endlosschleife

Eine `while True`-Schleife läuft für immer. So misst die senseBox z. B. dauerhaft:

```python
import time

while True:
    print("Messung ...")
    time.sleep(1)
```

## Zählschleife

<!-- @alternatives Anzahl -->

### 3 Mal

```python
for i in range(3):
    print(i)
```

### 10 Mal

<!-- @slug zehn -->

```python
for i in range(10):
    print(i)
```

<!-- @details -->

`range(n)` zählt von 0 bis n - 1.

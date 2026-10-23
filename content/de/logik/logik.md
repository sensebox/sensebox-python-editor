---
name: Logik
subtitle: Bedingungen verknüpfen und Programmabläufe verzweigen
image: ../../images/logik.svg
---

Logik-Bausteine prüfen Bedingungen und entscheiden, welcher Code ausgeführt wird.

## Wenn

Der eingerückte Code wird nur ausgeführt, wenn die Bedingung wahr ist.

```python
messwert = 12

if messwert > 10:
    print("Grenzwert überschritten")
```

## Wenn sonst

`else` wird ausgeführt, wenn die Bedingung falsch ist.

```python
messwert = 8

if messwert > 10:
    print("hoch")
else:
    print("niedrig")
```

## Wenn sonst wenn sonst

Mit `elif` können mehrere Bedingungen nacheinander geprüft werden.

```python
temperatur = 0

if temperatur < 0:
    print("Frost")
elif temperatur == 0:
    print("Gefrierpunkt")
else:
    print("über null")
```

## Werte vergleichen

<!-- @alternatives Vergleich -->

### Gleich

```python
5 == 5
```

### Ungleich

```python
5 != 3
```

### Kleiner

```python
3 < 5
```

### Größer

```python
5 > 3
```

### Kleiner oder gleich

```python
3 <= 5
```

### Größer oder gleich

```python
5 >= 3
```

## Bedingungen verknüpfen

<!-- @alternatives Verknüpfung -->

### Und

Beide Bedingungen müssen wahr sein.

```python
temperatur = 20
if temperatur > 0 and temperatur < 30:
    print("Temperatur liegt im gewünschten Bereich")

```

### Oder

Mindestens eine Bedingung muss wahr sein.

```python
temperatur = -3
if temperatur < 0 or temperatur > 30:
    print("Eine der gewünschten Bedingungen wurde erfüllt")
```


---
name: Logik
subtitle: Bedingungen verknüpfen und Programmabläufe verzweigen
image: ../../images/logik.svg
---

Bedingungen prüfen und Programmabläufe steuern.

## Wenn

Führt Code aus, wenn eine Bedingung wahr ist.

```python
messwert = 12

if messwert > 10:
    print("Grenzwert überschritten")
```

## Wenn sonst

Wählt je nach Bedingung zwischen zwei Codeblöcken.

```python
messwert = 8

if messwert > 10:
    print("hoch")
else:
    print("niedrig")
```

## Wenn sonst wenn sonst

Wählt anhand mehrerer Bedingungen einen Codeblock aus.

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

Vergleicht zwei Werte miteinander.

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

Verknüpft Bedingungen mit Und oder Oder.

### Und

```python
temperatur = 20
if temperatur > 0 and temperatur < 30:
    print("Temperatur liegt im gewünschten Bereich")

```

### Oder

```python
temperatur = -3
if temperatur < 0 or temperatur > 30:
    print("Eine der gewünschten Bedingungen wurde erfüllt")
```

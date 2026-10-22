---
name: Mathematik
subtitle: Zahlen berechnen, prüfen, begrenzen und verteilen
image: ../../images/mathematik.svg
---

Mit diesen Bausteinen kannst du Zahlen berechnen, prüfen und umwandeln. Für erweiterte Funktionen werden die eingebauten Module `math` und `random` verwendet.

## Zahl

Python verarbeitet ganze Zahlen und Dezimalzahlen direkt.

```python
zahl = 123
dezimalzahl = 3.14
```

## Grundrechenarten

<!-- @alternatives Operation -->

### Addieren

```python
ergebnis = 5 + 3
```

### Subtrahieren

```python
ergebnis = 5 - 3
```

### Multiplizieren

```python
ergebnis = 5 * 3
```

### Dividieren

```python
ergebnis = 5 / 3
```

### Potenz

```python
ergebnis = 5 ** 3
```

## Negative Zahl

Ein vorangestelltes Minus kehrt das Vorzeichen um.

```python
zahl = 5
ergebnis = -zahl
```

## Einzelne mathematische Funktion

<!-- @alternatives Funktion -->

### Quadratwurzel

```python
import math

ergebnis = math.sqrt(9)
```

### Betrag

```python
ergebnis = abs(-5)
```

### Natürlicher Logarithmus

```python
import math

ergebnis = math.log(10)
```

### Zehnerlogarithmus

```python
import math

ergebnis = math.log10(100)
```

### Exponentialfunktion

```python
import math

ergebnis = math.exp(2)
```

### Zehnerpotenz

```python
ergebnis = 10 ** 3
```

## Trigonometrische Funktion

<!-- @alternatives Funktion -->

### Sinus

```python
import math

ergebnis = math.sin(math.radians(45))
```

### Kosinus

```python
import math

ergebnis = math.cos(math.radians(45))
```

### Tangens

```python
import math

ergebnis = math.tan(math.radians(45))
```

### Arkussinus

```python
import math

winkel = math.degrees(math.asin(0.5))
```

### Arkuskosinus

```python
import math

winkel = math.degrees(math.acos(0.5))
```

### Arkustangens

```python
import math

winkel = math.degrees(math.atan(1))
```

## Mathematische Konstante

<!-- @alternatives Konstante -->

### Pi

```python
import math

wert = math.pi
```

### Eulersche Zahl

```python
import math

wert = math.e
```

### Goldener Schnitt

```python
wert = (1 + 5 ** 0.5) / 2
```

### Quadratwurzel aus 2

```python
import math

wert = math.sqrt(2)
```

### Quadratwurzel aus 1/2

```python
import math

wert = math.sqrt(0.5)
```

### Unendlich

```python
wert = float("inf")
```

## Zahl prüfen

<!-- @alternatives Eigenschaft -->

### Gerade

```python
zahl = 8
ergebnis = zahl % 2 == 0
```

### Ungerade

```python
zahl = 7
ergebnis = zahl % 2 != 0
```

### Primzahl

```python
zahl = 17
ist_primzahl = zahl >= 2 and all(zahl % i for i in range(2, int(zahl ** 0.5) + 1))
```

### Ganze Zahl

```python
zahl = 5.0
ergebnis = zahl == int(zahl)
```

### Positiv

```python
ergebnis = 5 > 0
```

### Negativ

```python
ergebnis = -5 < 0
```

### Teilbar durch

```python
ergebnis = 15 % 3 == 0
```

## Variable erhöhen oder verringern

<!-- @alternatives Änderung -->

### Erhöhen

```python
zahl = 0
zahl += 1
```

### Verringern

```python
zahl = 0
zahl -= 1
```

## Runden

<!-- @alternatives Richtung -->

### Normal runden

```python
ergebnis = round(3.6)
```

### Aufrunden

```python
import math

ergebnis = math.ceil(3.1)
```

### Abrunden

```python
import math

ergebnis = math.floor(3.9)
```

## Rest einer Division

Der Modulo-Operator `%` liefert den Rest.

```python
rest = 64 % 10
```

## Wert begrenzen

Der Wert bleibt zwischen Unter- und Obergrenze.

```python
wert = 120
untergrenze = 0
obergrenze = 100
begrenzt = min(max(wert, untergrenze), obergrenze)
```

## Ganzzahliger Zufallswert

Beide Grenzen können als Ergebnis vorkommen.

```python
import random

wert = random.randint(1, 100)
```

## Zufallszahl von 0 bis 1

```python
import random

wert = random.random()
```

## Wert verteilen

Die Formel überträgt einen Wert linear von einem Wertebereich in einen anderen.

```python
wert = 50
von_min = 0
von_max = 100
nach_min = 0
nach_max = 255

verteilt = (wert - von_min) * (nach_max - nach_min) / (von_max - von_min) + nach_min
```

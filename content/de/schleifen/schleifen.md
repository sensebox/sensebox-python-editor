---
name: Schleifen
subtitle: Anweisungen wiederholen und Schleifendurchläufe steuern
image: ../../images/schleifen.svg
---

Code wiederholen und Schleifendurchläufe steuern.

## Wiederhole X mal

Wiederholt einen Codeblock eine festgelegte Anzahl von Malen.

```python
for _ in range(10):
    print("Wiederholung")
```

## Wiederhole solange oder bis

<!-- @alternatives Bedingung -->

Wiederholt Code abhängig von einer Bedingung.

### Solange

```python
messwert = 0

while messwert < 10:
    print(messwert)
    messwert += 1
```

### Bis

```python
messwert = 0

while not (messwert >= 10):
    print(messwert)
    messwert += 1
```

## Zähle von bis mit Schrittweite

Zählt vom Startwert bis einschließlich Zielwert mit einer Schrittweite.

```python
for i in range(1, 10 + 1, 1):
    print(i)
```

## Schleifendurchlauf steuern

<!-- @alternatives Aktion -->

Beendet die Schleife oder überspringt den aktuellen Durchlauf.

### Schleife abbrechen

```python
for i in range(10):
    if i == 5:
        break
    print(i)
```

### Nächster Durchlauf

```python
for i in range(10):
    if i == 5:
        continue
    print(i)
```

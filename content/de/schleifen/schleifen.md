---
name: Schleifen
subtitle: Anweisungen wiederholen und Schleifendurchläufe steuern
image: ../../images/schleifen.svg
---

Schleifen wiederholen einen eingerückten Codeblock.

## Wiederhole X mal

Alle eingerückten Anweisungen werden so oft ausgeführt, wie in `range()` angegeben.

```python
for _ in range(10):
    print("Wiederholung")
```

<!-- @details -->

Der Unterstrich zeigt an, dass die Nummer des aktuellen Durchlaufs nicht benötigt wird.

## Wiederhole solange oder bis

<!-- @alternatives Bedingung -->

### Solange

Die Schleife läuft, solange die Bedingung wahr ist.

```python
messwert = 0

while messwert < 10:
    print(messwert)
    messwert += 1
```

### Bis

Python besitzt kein eigenes `until`. Mit `not` läuft die Schleife, bis die Bedingung wahr wird.

```python
messwert = 0

while not (messwert >= 10):
    print(messwert)
    messwert += 1
```

## Zähle von bis mit Schrittweite

Die Laufvariable enthält nacheinander jeden Wert vom Start bis einschließlich des Zielwerts.

```python
for i in range(1, 10 + 1, 1):
    print(i)
```

<!-- @details -->

Der zweite Wert von `range()` ist in Python ausgeschlossen. Damit der Zielwert eingeschlossen wird, wird hier `1` addiert.

## Schleifendurchlauf steuern

<!-- @alternatives Aktion -->

### Schleife abbrechen

`break` beendet die umgebende Schleife sofort.

```python
for i in range(10):
    if i == 5:
        break
    print(i)
```

### Nächster Durchlauf

`continue` überspringt den restlichen Code des aktuellen Durchlaufs.

```python
for i in range(10):
    if i == 5:
        continue
    print(i)
```

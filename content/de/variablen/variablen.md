---
name: Variablen
subtitle: Werte speichern, lesen und verändern
image: ../../images/variablen.svg
---

Variablen speichern Werte unter einem Namen. Python erkennt den Datentyp am zugewiesenen Wert; eine zusätzliche Deklaration wie in Arduino ist nicht nötig.

## Variable erstellen oder setzen

Der Zuweisungsoperator `=` speichert einen Wert. Eine weitere Zuweisung ersetzt ihn.

```python
messwert = 23.5
messwert = 24.0
```

## Variable lesen

Der Variablenname kann überall eingesetzt werden, wo ihr gespeicherter Wert benötigt wird.

```python
messwert = 23.5
print(messwert)
```

## Datentyp festlegen

<!-- @alternatives Datentyp -->

### Zeichen

```python
zeichen = "A"
```

### Text

```python
text = str("senseBox")
```

### Boolean

```python
aktiv = bool(True)
```

### Zahl

```python
anzahl = int(42)
```

### Große Zahl

Python-Ganzzahlen passen ihre Größe automatisch an.

```python
grosse_zahl = int(2147483647)
```

### Dezimalzahl

```python
temperatur = float(23.5)
```

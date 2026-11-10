---
name: Text
subtitle: Text erstellen, verbinden und untersuchen
image: ../../images/text.svg
---

Text erstellen, verbinden und ausgeben.

## Textfeld

Speichert einen Text in einer Variablen.

```python
text = "senseBox"
```

## Erstelle Text aus

Verbindet Text und Zahlen zu einem Text.

```python
temperatur = 23.5
text = "Temperatur: " + str(temperatur) + " °C"
```

## Text anhängen

Hängt Text an eine vorhandene Textvariable an.

```python
text = "Hallo"
text += " senseBox"
```

## Länge

Ermittelt die Anzahl der Zeichen.

```python
text = "senseBox"
laenge = len(text)
```

## Ist leer

Prüft, ob ein Text leer ist.

```python
text = ""
ist_leer = len(text) == 0
```

## Text ausgeben

Gibt Text in der Konsole aus.

```python
print("Hallo senseBox!")
```

## Werte ausgeben

<!-- @slug werte-ausgeben -->

Gibt Zahlen und Variablen in der Konsole aus.

```python
temperatur = 21.5
print("Temperatur:", temperatur)
```

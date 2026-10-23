---
name: Text
subtitle: Text erstellen, verbinden und untersuchen
image: ../../images/text.svg
---

Text besteht in Python aus Zeichenketten (`str`). Mit diesen Bausteinen kannst du Text erstellen, verbinden und untersuchen.

## Textfeld

Ein Text wird in Anführungszeichen geschrieben und kann in einer Variablen gespeichert werden.

```python
text = "senseBox"
```

## Erstelle Text aus

Mit `str()` werden Zahlen oder Messwerte in Text umgewandelt. `+` verbindet die Teile.

```python
temperatur = 23.5
text = "Temperatur: " + str(temperatur) + " °C"
```

## Text anhängen

`+=` hängt weiteren Text an eine vorhandene Textvariable an.

```python
text = "Hallo"
text += " senseBox"
```

## Länge

`len()` gibt die Anzahl der Zeichen zurück.

```python
text = "senseBox"
laenge = len(text)
```

## Ist leer

Ein Text ist leer, wenn seine Länge `0` ist. Der Vergleich liefert `True` oder `False`.

```python
text = ""
ist_leer = len(text) == 0
```

## Text ausgeben

Schreibe den Text in Anführungszeichen:

```python
print("Hallo senseBox!")
```

<!-- @details -->

Die Ausgabe siehst du in der **Konsole** unterhalb des Editors, sobald die senseBox verbunden ist.

## Werte ausgeben

<!-- @slug werte-ausgeben -->

Du kannst auch Zahlen und Variablen ausgeben. Mehrere Werte trennst du mit Kommas:

```python
temperatur = 21.5
print("Temperatur:", temperatur)
```

Mehr über Messwerte erfährst du unter [Temperatur](doc:sensoren/temperatur).

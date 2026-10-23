---
name: Text
subtitle: Create, join and inspect text
image: ../../images/text.svg
---

Text in Python consists of strings (`str`). These blocks let you create, join and inspect text.

## Text field

Write text in quotation marks and store it in a variable.

```python
text = "senseBox"
```

## Create text from

Use `str()` to convert numbers or measurements into text. `+` joins the parts.

```python
temperature = 23.5
text = "Temperature: " + str(temperature) + " °C"
```

## Append text

`+=` appends more text to an existing text variable.

```python
text = "Hello"
text += " senseBox"
```

## Length

`len()` returns the number of characters.

```python
text = "senseBox"
length = len(text)
```

## Is empty

Text is empty when its length is `0`. The comparison returns `True` or `False`.

```python
text = ""
is_empty = len(text) == 0
```

## Print text

Write the text in quotation marks:

```python
print("Hello senseBox!")
```

<!-- @details -->

You can see the output in the **console** below the editor once the senseBox is connected.

## Print values

<!-- @slug werte-ausgeben -->

You can also print numbers and variables. Separate several values with commas:

```python
temperature = 21.5
print("Temperature:", temperature)
```

Learn more about measurements in [Temperature](doc:sensoren/temperatur).

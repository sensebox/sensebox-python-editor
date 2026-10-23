---
name: Variables
subtitle: Store, read and change values
image: ../../images/variablen.svg
---

Variables store values under a name. Python detects the data type from the assigned value, so no extra declaration is needed.

## Create or set a variable

The assignment operator `=` stores a value. A later assignment replaces it.

```python
measurement = 23.5
measurement = 24.0
```

## Read a variable

Use the variable name wherever its stored value is needed.

```python
measurement = 23.5
print(measurement)
```

## Set a data type

<!-- @alternatives Data type -->

### Character

```python
character = "A"
```

### Text

```python
text = str("senseBox")
```

### Boolean

```python
active = bool(True)
```

### Number

```python
count = int(42)
```

### Large number

Python integers automatically adjust their size.

```python
large_number = int(2147483647)
```

### Decimal number

```python
temperature = float(23.5)
```

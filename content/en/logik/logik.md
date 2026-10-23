---
name: Logic
subtitle: Combine conditions and branch program flow
image: ../../images/logik.svg
---

Logic blocks check conditions and decide which code is run.

## If

Indented code only runs when the condition is true.

```python
measurement = 12

if measurement > 10:
    print("Limit exceeded")
```

## If else

`else` runs when the condition is false.

```python
measurement = 8

if measurement > 10:
    print("high")
else:
    print("low")
```

## If / Elif / Else

Use `elif` to check several conditions one after another.

```python
temperature = 0

if temperature < 0:
    print("frost")
elif temperature == 0:
    print("freezing point")
else:
    print("above zero")
```

## Compare values

<!-- @alternatives Comparison -->

### Equal
```python
5 == 5
```
### Not equal
```python
5 != 3
```
### Less than
```python
3 < 5
```
### Greater than
```python
5 > 3
```
### Less than or equal to
```python
3 <= 5
```
### Greater than or equal to
```python
5 >= 3
```

## Combine conditions

<!-- @alternatives Combination -->

### And

Both conditions must be true.

```python
temperature = 20
if temperature > 0 and temperature < 30:
    print("Temperature is in the desired range")
```

### Or

At least one condition must be true.

```python
temperature = -3
if temperature < 0 or temperature > 30:
    print("One of the conditions was met")
```

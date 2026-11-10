---
name: Logic
subtitle: Combine conditions and branch program flow
image: ../../images/logik.svg
---

Check conditions and control program flow.

## If

Runs code when a condition is true.

```python
measurement = 12

if measurement > 10:
    print("Limit exceeded")
```

## If else

Chooses between two code blocks based on a condition.

```python
measurement = 8

if measurement > 10:
    print("high")
else:
    print("low")
```

## If / Elif / Else

Chooses a code block based on multiple conditions.

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

Compares two values.

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

Combines conditions using AND or OR.

### And

```python
temperature = 20
if temperature > 0 and temperature < 30:
    print("Temperature is in the desired range")
```

### Or

```python
temperature = -3
if temperature < 0 or temperature > 30:
    print("One of the conditions was met")
```

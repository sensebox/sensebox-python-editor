---
name: Loops
subtitle: Repeat instructions and control loop iterations
image: ../../images/schleifen.svg
---

Loops repeat an indented block of code.

## Repeat X times

All indented instructions run as often as specified in `range()`.

```python
for _ in range(10):
    print("Repeat")
```

<!-- @details -->

The underscore indicates that the current iteration number is not needed.

## Repeat while or until

<!-- @alternatives Condition -->

### While

The loop runs while its condition is true.

```python
measurement = 0

while measurement < 10:
    print(measurement)
    measurement += 1
```

### Until

Python has no separate `until`. With `not`, the loop runs until the condition becomes true.

```python
measurement = 0

while not (measurement >= 10):
    print(measurement)
    measurement += 1
```

## Count from, to, by

The loop variable receives every value from the start up to and including the target value.

```python
for i in range(1, 10 + 1, 1):
    print(i)
```

<!-- @details -->

Python excludes the second value of `range()`. Add `1` here to include the target value.

## Control a loop iteration

<!-- @alternatives Action -->

### Stop loop

`break` immediately ends the enclosing loop.

```python
for i in range(10):
    if i == 5:
        break
    print(i)
```

### Next iteration

`continue` skips the remaining code in the current iteration.

```python
for i in range(10):
    if i == 5:
        continue
    print(i)
```

---
name: Loops
subtitle: Repeat instructions and control loop iterations
image: ../../images/schleifen.svg
---

Repeat code and control loop iterations.

## Repeat X times

Repeats a code block a specified number of times.

```python
for _ in range(10):
    print("Repeat")
```

## Repeat while or until

<!-- @alternatives Condition -->

Repeats code based on a condition.

### While

```python
measurement = 0

while measurement < 10:
    print(measurement)
    measurement += 1
```

### Until

```python
measurement = 0

while not (measurement >= 10):
    print(measurement)
    measurement += 1
```

## Count from, to, by

Counts from the start to the end value, inclusive, using a step size.

```python
for i in range(1, 10 + 1, 1):
    print(i)
```

## Control a loop iteration

<!-- @alternatives Action -->

Ends the loop or skips the current iteration.

### Stop loop

```python
for i in range(10):
    if i == 5:
        break
    print(i)
```

### Next iteration

```python
for i in range(10):
    if i == 5:
        continue
    print(i)
```

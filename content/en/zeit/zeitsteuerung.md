---
name: Timing
subtitle: Wait, measure elapsed time and run actions regularly
image: ../../images/zeit.svg
---

Control delays, elapsed time and measurement intervals.

## Wait milliseconds

Pauses the program for the specified number of milliseconds.

```python
import time

milliseconds = 1000
time.sleep(milliseconds / 1000)
```

## Wait microseconds

Pauses the program for the specified number of microseconds.

```python
import time

microseconds = 100
time.sleep(microseconds / 1_000_000)
```

## Elapsed milliseconds

Returns elapsed runtime in milliseconds.

```python
import time

milliseconds_since_start = int(time.monotonic() * 1000)
```

## Elapsed microseconds

Returns elapsed runtime in microseconds.

```python
import time

microseconds_since_start = int(time.monotonic() * 1_000_000)
```

## Wait forever

Keeps the program in a waiting loop indefinitely.

```python
import time

while True:
    time.sleep(3600)
```

## Measurement interval

Runs code at regular intervals.

```python
import time

interval = 10

while True:
    print("Measurement")
    time.sleep(interval)
```

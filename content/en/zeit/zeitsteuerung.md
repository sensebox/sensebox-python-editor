---
name: Timing
subtitle: Wait, measure elapsed time and run actions regularly
image: ../../images/zeit.svg
---

The timing blocks use CircuitPython's built-in `time` module.

## Wait milliseconds

`time.sleep()` expects seconds, so divide milliseconds by `1000`.

```python
import time

milliseconds = 1000
time.sleep(milliseconds / 1000)
```

## Wait microseconds

Divide microseconds by `1_000_000`.

```python
import time

microseconds = 100
time.sleep(microseconds / 1_000_000)
```

## Elapsed milliseconds

`time.monotonic()` counts seconds since the senseBox started and is unaffected by clock changes.

```python
import time

milliseconds_since_start = int(time.monotonic() * 1000)
```

## Elapsed microseconds

```python
import time

microseconds_since_start = int(time.monotonic() * 1_000_000)
```

## Wait forever

The infinite loop sleeps so it does not use unnecessary processing time.

```python
import time

while True:
    time.sleep(3600)
```

## Measurement interval

Indented code runs regularly. The monotonic clock avoids problems caused by changing the date or time.

```python
import time

interval = 10

while True:
    print("Measurement")
    time.sleep(interval)
```

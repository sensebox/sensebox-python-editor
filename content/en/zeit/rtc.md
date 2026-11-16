---
name: Real-Time Clock (RTC)
subtitle: Setting and Reading the Date and Time
image: ../../images/zeit.svg
---

Manage date and time using the built-in real-time clock.

## Initialize the RTC

<!-- @slug rtc-initialisieren -->

Sets up the built-in real-time clock.

```python
import rtc

clock = rtc.RTC()
```

## Setting the RTC

<!-- @slug rtc-einstellen -->

Sets the date and time.

```python
import time

clock.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))
```

## Reading the RTC

<!-- @slug rtc-auslesen @alternatives Wert -->

Reads the date, time or individual time values.

### Date and Time

```python
date_time = clock.datetime
print(date_time)
```

### Year

```python
year = clock.datetime.tm_year
```

### Month

```python
month = clock.datetime.tm_mon
```

### Day

```python
day = clock.datetime.tm_mday
```

### Hour

```python
hour = clock.datetime.tm_hour
```

### Minute

```python
minute = clock.datetime.tm_min
```

### Second

```python
second = clock.datetime.tm_sec
```

## Reading a timestamp

<!-- @slug rtc-zeitstempel-auslesen -->

Returns the configured time as seconds since 1 January 1970.

```python
import time

timestamp = time.mktime(clock.datetime)
```

## Using RTC to Its Full Potential

<!-- @slug rtc-vollstaendig-verwenden -->

Sets up the real-time clock, sets it and prints the date and time.

```python
import time
import rtc

clock = rtc.RTC()
clock.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))

date_time = clock.datetime
print(date_time)
```

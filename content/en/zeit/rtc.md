---
name: Real-Time Clock (RTC)
subtitle: Setting and Reading the Date and Time
image: ../../images/zeit.svg
---

With the built-in CircuitPython real-time clock, you can save the date and time while the system is running. You don't need an external DS3231, an I²C connection, or an additional Adafruit library to do this.

First, add **Initialize RTC**. Then you can set and read the clock. The last example summarizes all the steps.

## Initialize the RTC

<!-- @slug rtc-initialisieren -->

Set up the built-in real-time clock:

```python
import rtc

clock = rtc.RTC()
```

<!-- @details -->

This block creates the real-time clock under the name `clock`. Use this object in the following blocks as well.

## Setting the RTC

<!-- @slug rtc-einstellen -->

Set the date and time. The order is year, month, day, hour, minute, second, day of the week, anniversary, and daylight saving time:

```python
import time

clock.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))
```

<!-- @details -->

The days of the week are numbered from Monday `0` to Sunday `6`. This block assumes that `clock` has been initialized previously.

## Reading the RTC

<!-- @slug rtc-auslesen @alternatives Wert -->

### Date and Time

Read the date and time together:

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

<!-- @details -->

All variants require that `clock` has been initialized beforehand.

## Reading a timestamp

<!-- @slug rtc-zeitstempel-auslesen -->

Convert the current date to the number of seconds since January 1, 1970:

```python
import time

timestamp = time.mktime(clock.datetime)
```

<!-- @details -->

This block requires that `clock` has been initialized beforehand.

## Using RTC to Its Full Potential

<!-- @slug rtc-vollstaendig-verwenden -->

This complete example initializes the RTC, sets it, and prints the date and time:

```python
import time
import rtc

clock = rtc.RTC()
clock.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))

date_time = clock.datetime
print(date_time)
```

<!-- @details -->

Adjust the values in `time.struct_time(...)` to your desired date and time. After a power outage, the internal RTC must be reset, for example, using the NTP block.

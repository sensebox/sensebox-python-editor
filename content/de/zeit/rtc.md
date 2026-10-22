---
name: Echtzeituhr (RTC)
subtitle: Externe und interne Uhr einstellen und auslesen
image: ../../images/zeit.svg
---

Eine RTC speichert Datum und Uhrzeit unabhängig von der Programmlaufzeit. Die externe DS3231 benötigt eine I²C-Verbindung; unterstützte Boards besitzen zusätzlich eine interne CircuitPython-Uhr.

## Externe RTC initialisieren

```python
import time
import board
import digitalio
import adafruit_ds3231

io_enable_pin = digitalio.DigitalInOut(board.IO_POWER)
io_enable_pin.direction = digitalio.Direction.OUTPUT
io_enable_pin.value = False
time.sleep(0.1)

i2c = board.I2C()
externe_uhr = adafruit_ds3231.DS3231(i2c)
```

## Externe RTC einstellen

Die Reihenfolge lautet Jahr, Monat, Tag, Stunde, Minute, Sekunde, Wochentag, Jahrestag und Sommerzeit.

```python
import time

externe_uhr.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))
```

## Externe RTC auslesen

<!-- @alternatives Wert -->

### Datum und Uhrzeit

```python
datum_zeit = externe_uhr.datetime
print(datum_zeit)
```

### Jahr

```python
jahr = externe_uhr.datetime.tm_year
```

### Monat

```python
monat = externe_uhr.datetime.tm_mon
```

### Tag

```python
tag = externe_uhr.datetime.tm_mday
```

### Stunde

```python
stunde = externe_uhr.datetime.tm_hour
```

### Minute

```python
minute = externe_uhr.datetime.tm_min
```

### Sekunde

```python
sekunde = externe_uhr.datetime.tm_sec
```

## Externen Zeitstempel auslesen

`time.mktime()` wandelt das Datum in Sekunden seit dem 1. Januar 1970 um.

```python
import time

zeitstempel = time.mktime(externe_uhr.datetime)
```

## Interne RTC initialisieren

```python
import rtc

interne_uhr = rtc.RTC()
```

## Interne RTC einstellen

```python
import time

interne_uhr.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))
```

## Interne RTC auslesen

```python
datum_zeit = interne_uhr.datetime
print(datum_zeit)
```

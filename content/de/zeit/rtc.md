---
name: Echtzeituhr (RTC)
subtitle: Datum und Uhrzeit einstellen und auslesen
image: ../../images/zeit.svg
---

Datum und Uhrzeit mit der eingebauten Echtzeituhr verwalten.

## RTC initialisieren

<!-- @slug rtc-initialisieren -->

Richtet die eingebaute Echtzeituhr ein.

```python
import rtc

uhr = rtc.RTC()
```

## RTC einstellen

<!-- @slug rtc-einstellen -->

Legt Datum und Uhrzeit fest.

```python
import time

uhr.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))
```

## RTC auslesen

<!-- @slug rtc-auslesen @alternatives Wert -->

Liest Datum, Uhrzeit oder einzelne Zeitwerte aus.

### Datum und Uhrzeit

```python
datum_zeit = uhr.datetime
print(datum_zeit)
```

### Jahr

```python
jahr = uhr.datetime.tm_year
```

### Monat

```python
monat = uhr.datetime.tm_mon
```

### Tag

```python
tag = uhr.datetime.tm_mday
```

### Stunde

```python
stunde = uhr.datetime.tm_hour
```

### Minute

```python
minute = uhr.datetime.tm_min
```

### Sekunde

```python
sekunde = uhr.datetime.tm_sec
```

## Zeitstempel auslesen

<!-- @slug rtc-zeitstempel-auslesen -->

Gibt die eingestellte Uhrzeit als Sekunden seit dem 1. Januar 1970 aus.

```python
import time

zeitstempel = time.mktime(uhr.datetime)
```

## RTC vollständig verwenden

<!-- @slug rtc-vollstaendig-verwenden -->

Richtet die Echtzeituhr ein, stellt sie und gibt Datum und Uhrzeit aus.

```python
import time
import rtc

uhr = rtc.RTC()
uhr.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))

datum_zeit = uhr.datetime
print(datum_zeit)
```

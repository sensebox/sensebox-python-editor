---
name: Echtzeituhr (RTC)
subtitle: Datum und Uhrzeit einstellen und auslesen
image: ../../images/zeit.svg
---

Mit der eingebauten CircuitPython-Echtzeituhr kannst du Datum und Uhrzeit während des Betriebs speichern. Dafür benötigst du weder eine externe DS3231 noch eine I²C-Verbindung oder eine zusätzliche Adafruit-Bibliothek.

Füge zuerst **RTC initialisieren** ein. Danach kannst du die Uhr einstellen und auslesen. Das letzte Beispiel fasst alle Schritte zusammen.

## RTC initialisieren

<!-- @slug rtc-initialisieren -->

Richte die eingebaute Echtzeituhr ein:

```python
import rtc

uhr = rtc.RTC()
```

<!-- @details -->

Der Block legt die Echtzeituhr unter dem Namen `uhr` an. Verwende dieses Objekt auch in den folgenden Blöcken.

## RTC einstellen

<!-- @slug rtc-einstellen -->

Stelle Datum und Uhrzeit ein. Die Reihenfolge lautet Jahr, Monat, Tag, Stunde, Minute, Sekunde, Wochentag, Jahrestag und Sommerzeit:

```python
import time

uhr.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))
```

<!-- @details -->

Der Wochentag wird von Montag `0` bis Sonntag `6` gezählt. Der Block setzt voraus, dass `uhr` zuvor initialisiert wurde.

## RTC auslesen

<!-- @slug rtc-auslesen @alternatives Wert -->

### Datum und Uhrzeit

Lies Datum und Uhrzeit gemeinsam aus:

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

<!-- @details -->

Alle Varianten setzen voraus, dass `uhr` zuvor initialisiert wurde.

## Zeitstempel auslesen

<!-- @slug rtc-zeitstempel-auslesen -->

Wandle das aktuelle Datum in Sekunden seit dem 1. Januar 1970 um:

```python
import time

zeitstempel = time.mktime(uhr.datetime)
```

<!-- @details -->

Der Block setzt voraus, dass `uhr` zuvor initialisiert wurde.

## RTC vollständig verwenden

<!-- @slug rtc-vollstaendig-verwenden -->

Dieses vollständige Beispiel initialisiert die RTC, stellt sie ein und gibt Datum und Uhrzeit aus:

```python
import time
import rtc

uhr = rtc.RTC()
uhr.datetime = time.struct_time((2026, 1, 1, 12, 0, 0, 3, -1, -1))

datum_zeit = uhr.datetime
print(datum_zeit)
```

<!-- @details -->

Passe die Werte in `time.struct_time(...)` an dein gewünschtes Datum und deine Uhrzeit an. Nach einer Unterbrechung der Stromversorgung muss die interne RTC erneut gestellt werden, beispielsweise über den NTP-Block.

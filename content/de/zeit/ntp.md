---
name: Netzwerkzeit (NTP)
subtitle: Aktuelle Uhrzeit über WLAN abrufen
image: ../../images/zeit.svg
---

NTP ruft die aktuelle UTC-Zeit aus dem Netzwerk ab. Dafür werden WLAN-Zugangsdaten in `settings.toml` und ein CircuitPython-Board mit WLAN benötigt.

## NTP initialisieren

```python
import os
import wifi
import socketpool
import adafruit_ntp

wifi.radio.connect(
    os.getenv("CIRCUITPY_WIFI_SSID"),
    os.getenv("CIRCUITPY_WIFI_PASSWORD"),
)
pool = socketpool.SocketPool(wifi.radio)
netzwerkzeit = adafruit_ntp.NTP(pool, tz_offset=0)
```

## NTP-Zeit auslesen

```python
datum_zeit = netzwerkzeit.datetime
print(datum_zeit)
```

<!-- @details -->

`tz_offset` ist der feste Abstand zu UTC in Stunden. Für automatische Sommerzeitregeln ist zusätzliche Zeitzonenlogik erforderlich.

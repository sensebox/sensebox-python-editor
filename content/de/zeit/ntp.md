---
name: Netzwerkzeit (NTP)
subtitle: Aktuelle Uhrzeit über WLAN abrufen
image: ../../images/zeit.svg
---

NTP ruft die aktuelle UTC-Zeit aus dem Netzwerk ab. Trage dafür die WLAN-Zugangsdaten direkt in den Block ein.

## NTP initialisieren

```python
import wifi
import socketpool
import adafruit_ntp

# WLAN Zugangsdaten
CIRCUITPY_WIFI_SSID = "SSID"
CIRCUITPY_WIFI_PASSWORD = "Password"

# Verbindung zum WiFi herstellen
print(f"Connecting to {CIRCUITPY_WIFI_SSID}")
wifi.radio.connect(
    CIRCUITPY_WIFI_SSID,
    CIRCUITPY_WIFI_PASSWORD
)
print(f"Connected!")

pool = socketpool.SocketPool(wifi.radio)
netzwerkzeit = adafruit_ntp.NTP(pool, tz_offset=0)
```

<!-- @details -->

Ersetze `SSID` und `Password` durch deine Zugangsdaten. Teile Programme mit einem echten WLAN-Passwort nicht mit anderen.

## NTP-Zeit auslesen

```python
datum_zeit = netzwerkzeit.datetime
print(datum_zeit)
```

<!-- @details -->

`tz_offset` ist der feste Abstand zu UTC in Stunden. Für automatische Sommerzeitregeln ist zusätzliche Zeitzonenlogik erforderlich.

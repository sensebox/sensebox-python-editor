---
name: Netzwerkzeit (NTP)
subtitle: Aktuelle Uhrzeit über WLAN abrufen
image: ../../images/zeit.svg
---

Die aktuelle Uhrzeit über das Netzwerk abrufen.

## NTP initialisieren

Richtet die Netzwerkverbindung und den NTP-Zeitabruf ein.

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

## NTP-Zeit auslesen

Liest die aktuelle Netzwerkzeit mit dem eingestellten UTC-Versatz aus.

```python
datum_zeit = netzwerkzeit.datetime
print(datum_zeit)
```

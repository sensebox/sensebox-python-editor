---
name: WiFi
subtitle: Mit dem Internet verbinden
image: ../../images/wifi.svg
imageAlt: Funkwellen einer WLAN-Verbindung
---

Die senseBox mit einem WLAN-Netzwerk verbinden.

## WLAN-Zugangsdaten festlegen

<!-- @slug wlan-zugangsdaten-festlegen -->

Legt Netzwerkname und Passwort fest.

```python
# WLAN Zugangsdaten
CIRCUITPY_WIFI_SSID = "SSID"
CIRCUITPY_WIFI_PASSWORD = "Password"
```

## Mit WLAN-Netzwerk verbinden

<!-- @slug mit-wlan-netwerk-verbinden -->

Stellt die Verbindung zum festgelegten WLAN-Netzwerk her.

```python
import wifi

# Verbindung zum WiFi herstellen
print(f"Connecting to {CIRCUITPY_WIFI_SSID}")
wifi.radio.connect(
    CIRCUITPY_WIFI_SSID,
    CIRCUITPY_WIFI_PASSWORD
)
print(f"Connected!")
```

## WLAN-Verbindung vollständig herstellen

<!-- @slug wlan-verbindung-vollstaendig-herstellen -->

Legt die Zugangsdaten fest und verbindet die senseBox mit dem WLAN.

```python
import wifi

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
```

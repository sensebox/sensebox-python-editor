---
name: WiFi
subtitle: Mit dem Internet verbinden
image: ../../images/wifi.svg
imageAlt: Funkwellen einer WLAN-Verbindung
---

Das WiFi-Modul ist auf der MCU S2 verbaut. Du musst hier also nichts weiter anschließen.

Füge zuerst **WLAN-Zugangsdaten festlegen** und danach **Mit WLAN-Netzwerk verbinden** ein. Alternativ enthält **WLAN-Verbindung vollständig herstellen** beide Schritte.

## WLAN-Zugangsdaten festlegen

<!-- @slug wlan-zugangsdaten-festlegen -->

Trage den Namen und das Passwort deines WLAN-Netzwerks ein:

```python
# WLAN Zugangsdaten
CIRCUITPY_WIFI_SSID = "SSID"
CIRCUITPY_WIFI_PASSWORD = "Password"
```

<!-- @details -->

Ersetze `SSID` und `Password` durch deine Zugangsdaten. Teile Programme mit einem echten WLAN-Passwort nicht mit anderen.

## Mit WLAN-Netzwerk verbinden

<!-- @slug mit-wlan-netwerk-verbinden -->

Verbinde das WiFi-Modul mit dem zuvor festgelegten Netzwerk:

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

<!-- @details -->

Der Block setzt voraus, dass `CIRCUITPY_WIFI_SSID` und `CIRCUITPY_WIFI_PASSWORD` zuvor festgelegt wurden.

## WLAN-Verbindung vollständig herstellen

<!-- @slug wlan-verbindung-vollstaendig-herstellen -->

Dieses vollständige Beispiel legt die Zugangsdaten fest und stellt die WLAN-Verbindung her:

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

<!-- @details -->

Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

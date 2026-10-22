---
name: WiFi
subtitle: Mit dem Internet verbinden
image: ../../images/wifi.svg
imageAlt: Funkwellen einer WLAN-Verbindung
---

Das WiFi-Modul ist auf der MCU S2 verbaut! Du musst hier also nichts weiter anschließen.

## Mit WLAN-Netzwerk verbinden

<!-- @slug mit-wlan-netwerk-verbinden -->

Mit diesem Code kannst Du dich mit einem WLAN-Netzwerk verbinden. Ersetze `SSID` und `Password` mit deinen entsprechenden Zugangsdaten.

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

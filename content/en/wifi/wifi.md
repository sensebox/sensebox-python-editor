---
name: WiFi
subtitle: Connect to the internet
image: ../../images/wifi.svg
imageAlt: Wireless signal of a WiFi connection
---

Connect the senseBox to a WiFi network.

## Set WiFi credentials

<!-- @slug wlan-zugangsdaten-festlegen -->

Sets the network name and password.

```python
# WiFi credentials
CIRCUITPY_WIFI_SSID = "SSID"
CIRCUITPY_WIFI_PASSWORD = "Password"
```

## Connect to WiFi network

<!-- @slug mit-wlan-netzwerk-verbinden -->

Connects to the specified WiFi network.

```python
import wifi

# Connect to WiFi
print(f"Connecting to {CIRCUITPY_WIFI_SSID}")
wifi.radio.connect(
    CIRCUITPY_WIFI_SSID,
    CIRCUITPY_WIFI_PASSWORD
)
print("Connected!")
```

## Make a complete WiFi connection

<!-- @slug wlan-verbindung-vollstaendig-herstellen -->

Sets the credentials and connects the senseBox to WiFi.

```python
import wifi

# WiFi credentials
CIRCUITPY_WIFI_SSID = "SSID"
CIRCUITPY_WIFI_PASSWORD = "Password"

# Connect to WiFi
print(f"Connecting to {CIRCUITPY_WIFI_SSID}")
wifi.radio.connect(
    CIRCUITPY_WIFI_SSID,
    CIRCUITPY_WIFI_PASSWORD
)
print("Connected!")
```

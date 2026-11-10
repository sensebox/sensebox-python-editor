---
name: WiFi
subtitle: Connect to the internet
image: ../../images/wifi.svg
imageAlt: Wireless signal of a WiFi connection
---

The WiFi module is built into the MCU S2, so you do not need to connect anything else.

First add **Set WiFi credentials**, then **Connect to WiFi network**. Alternatively, **Make a complete WiFi connection** contains both steps.

## Set WiFi credentials

<!-- @slug wlan-zugangsdaten-festlegen -->

Enter the name and password of your WiFi network:

```python
# WiFi credentials
CIRCUITPY_WIFI_SSID = "SSID"
CIRCUITPY_WIFI_PASSWORD = "Password"
```

<!-- @details -->

Replace `SSID` and `Password` with your credentials. Do not share programs containing a real WiFi password.

## Connect to WiFi network

<!-- @slug mit-wlan-netzwerk-verbinden -->

Connect the WiFi module to the network set above:

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

<!-- @details -->

This block requires `CIRCUITPY_WIFI_SSID` and `CIRCUITPY_WIFI_PASSWORD` to be set first.

## Make a complete WiFi connection

<!-- @slug wlan-verbindung-vollstaendig-herstellen -->

This complete example sets the credentials and connects to WiFi:

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

<!-- @details -->

Find further information in the [senseBox documentation](https://docs.sensebox.de).

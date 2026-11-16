---
name: Network time (NTP)
subtitle: Get the current time over WiFi
image: ../../images/zeit.svg
---

Retrieve the current time over the network.

## Initialise NTP

Sets up the network connection and NTP time retrieval.

```python
import wifi
import socketpool
import adafruit_ntp

# WiFi credentials
CIRCUITPY_WIFI_SSID = "SSID"
CIRCUITPY_WIFI_PASSWORD = "Password"

print(f"Connecting to {CIRCUITPY_WIFI_SSID}")
wifi.radio.connect(CIRCUITPY_WIFI_SSID, CIRCUITPY_WIFI_PASSWORD)
print("Connected!")

pool = socketpool.SocketPool(wifi.radio)
network_time = adafruit_ntp.NTP(pool, tz_offset=0)
```

## Read NTP time

Reads the current network time using the configured UTC offset.

```python
date_time = network_time.datetime
print(date_time)
```

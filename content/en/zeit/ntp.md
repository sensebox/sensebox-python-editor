---
name: Network time (NTP)
subtitle: Get the current time over WiFi
image: ../../images/zeit.svg
---

NTP gets the current UTC time from the network. Enter your WiFi credentials directly in the block.

## Initialise NTP

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

<!-- @details -->

Replace `SSID` and `Password` with your credentials. Do not share programs containing a real WiFi password.

## Read NTP time

```python
date_time = network_time.datetime
print(date_time)
```

<!-- @details -->

`tz_offset` is the fixed offset from UTC in hours. Automatic daylight-saving rules need additional time-zone logic.

---
name: Beschleunigung
subtitle: Beschleunigung und Drehgeschwindigkeit messen
image: ../../images/beschleunigung.svg
imageAlt: Drei Achsen für Beschleunigung und Drehung
---

Beschleunigung und Drehgeschwindigkeit mit der eingebauten IMU messen.

## Bewegungssensor initialisieren

<!-- @slug bewegungssensor-initialisieren -->

Richtet den eingebauten Bewegungssensor ein.

```python
import busio
import microcontroller
import adafruit_icm20x

scl = microcontroller.pin.GPIO42
sda = microcontroller.pin.GPIO45
i2c = busio.I2C(scl, sda)
imu = adafruit_icm20x.ICM20948(i2c, address=0x68)
```

## Beschleunigung auslesen

<!-- @slug beschleunigung-messen -->

Liest die Beschleunigung auf drei Achsen aus.

```python
beschleunigung_x, beschleunigung_y, beschleunigung_z = imu.acceleration
print(
    "Beschleunigung: X: %.2f, Y: %.2f, Z: %.2f m/s^2"
    % (beschleunigung_x, beschleunigung_y, beschleunigung_z)
)
```

## Drehgeschwindigkeit auslesen

<!-- @slug drehgeschwindigkeit-messen -->

Liest die Drehgeschwindigkeit auf drei Achsen aus.

```python
gyro_x, gyro_y, gyro_z = imu.gyro
print(
    "Drehgeschwindigkeit: X: %.2f, Y: %.2f, Z: %.2f rad/s"
    % (gyro_x, gyro_y, gyro_z)
)
```

## Bewegungssensor vollständig auslesen

<!-- @slug bewegungssensor-vollstaendig-auslesen -->

Richtet den Sensor ein und gibt jede Sekunde Bewegungswerte aus.

```python
import time
import busio
import microcontroller
import adafruit_icm20x

scl = microcontroller.pin.GPIO42
sda = microcontroller.pin.GPIO45
i2c = busio.I2C(scl, sda)
imu = adafruit_icm20x.ICM20948(i2c, address=0x68)

while True:
    beschleunigung_x, beschleunigung_y, beschleunigung_z = imu.acceleration
    gyro_x, gyro_y, gyro_z = imu.gyro

    print(
        "Beschleunigung: X: %.2f, Y: %.2f, Z: %.2f m/s^2"
        % (beschleunigung_x, beschleunigung_y, beschleunigung_z)
    )
    print(
        "Drehgeschwindigkeit: X: %.2f, Y: %.2f, Z: %.2f rad/s"
        % (gyro_x, gyro_y, gyro_z)
    )
    print("")
    time.sleep(1)
```

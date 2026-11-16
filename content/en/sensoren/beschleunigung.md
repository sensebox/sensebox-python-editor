---
name: Acceleration
subtitle: Measure acceleration and angular velocity
image: ../../images/beschleunigung.svg
imageAlt: Three axes for acceleration and rotation
---

Measure acceleration and angular velocity using the built-in IMU.

## Initialise motion sensor

<!-- @slug bewegungssensor-initialisieren -->

Sets up the built-in motion sensor.

```python
import busio
import microcontroller
import adafruit_icm20x

scl = microcontroller.pin.GPIO42
sda = microcontroller.pin.GPIO45
i2c = busio.I2C(scl, sda)
imu = adafruit_icm20x.ICM20948(i2c, address=0x68)
```

## Read acceleration

<!-- @slug beschleunigung-messen -->

Reads acceleration on three axes.

```python
acceleration_x, acceleration_y, acceleration_z = imu.acceleration
print(
    "Acceleration: X: %.2f, Y: %.2f, Z: %.2f m/s^2"
    % (acceleration_x, acceleration_y, acceleration_z)
)
```

## Read angular velocity

<!-- @slug drehgeschwindigkeit-messen -->

Reads angular velocity on three axes.

```python
gyro_x, gyro_y, gyro_z = imu.gyro
print(
    "Angular velocity: X: %.2f, Y: %.2f, Z: %.2f rad/s"
    % (gyro_x, gyro_y, gyro_z)
)
```

## Read motion sensor completely

<!-- @slug bewegungssensor-vollstaendig-auslesen -->

Sets up the sensor and prints motion readings every second.

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
    acceleration_x, acceleration_y, acceleration_z = imu.acceleration
    gyro_x, gyro_y, gyro_z = imu.gyro
    print("Acceleration: X: %.2f, Y: %.2f, Z: %.2f m/s^2" % (acceleration_x, acceleration_y, acceleration_z))
    print("Angular velocity: X: %.2f, Y: %.2f, Z: %.2f rad/s" % (gyro_x, gyro_y, gyro_z))
    print("")
    time.sleep(1)
```

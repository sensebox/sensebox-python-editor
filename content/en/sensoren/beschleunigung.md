---
name: Acceleration
subtitle: Measure acceleration and angular velocity
image: ../../images/beschleunigung.svg
imageAlt: Three axes for acceleration and rotation
---

The IMU is built into the MCU S2, so nothing else needs to be connected.

Add **Initialise motion sensor** first. You can then read acceleration and angular velocity separately; the last example combines every step.

## Initialise motion sensor

<!-- @slug bewegungssensor-initialisieren -->

Set up the I²C bus and the built-in ICM20948 IMU:

```python
import busio
import microcontroller
import adafruit_icm20x

scl = microcontroller.pin.GPIO42
sda = microcontroller.pin.GPIO45
i2c = busio.I2C(scl, sda)
imu = adafruit_icm20x.ICM20948(i2c, address=0x68)
```

<!-- @details -->

This creates the IMU as `imu`. Use this object in the following blocks.

## Read acceleration

<!-- @slug beschleunigung-messen -->

Read acceleration on all three axes:

```python
acceleration_x, acceleration_y, acceleration_z = imu.acceleration
print(
    "Acceleration: X: %.2f, Y: %.2f, Z: %.2f m/s^2"
    % (acceleration_x, acceleration_y, acceleration_z)
)
```

<!-- @details -->

`imu` must already be initialised. Output values with [print](doc:text/werte-ausgeben).

## Read angular velocity

<!-- @slug drehgeschwindigkeit-messen -->

Read angular velocity on all three axes:

```python
gyro_x, gyro_y, gyro_z = imu.gyro
print(
    "Angular velocity: X: %.2f, Y: %.2f, Z: %.2f rad/s"
    % (gyro_x, gyro_y, gyro_z)
)
```

<!-- @details -->

`imu` must already be initialised.

## Read motion sensor completely

<!-- @slug bewegungssensor-vollstaendig-auslesen -->

This complete example initialises the sensor and prints acceleration and angular velocity every second:

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

<!-- @details -->

More information is available in the [senseBox documentation](https://docs.sensebox.de/en/).

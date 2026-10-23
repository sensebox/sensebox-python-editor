---
name: Beschleunigung
subtitle: Beschleunigung und Drehgeschwindigkeit messen
image: ../../images/beschleunigung.svg
imageAlt: Drei Achsen für Beschleunigung und Drehung
---

Die IMU ist auf der MCU S2 verbaut. Du musst hier also nichts weiter anschließen.

Füge zuerst **Bewegungssensor initialisieren** ein. Danach kannst du die Beschleunigung und die Drehgeschwindigkeit getrennt auslesen. Das letzte Beispiel fasst alle Schritte zusammen.

## Bewegungssensor initialisieren

<!-- @slug bewegungssensor-initialisieren -->

Richte den I²C-Bus und die eingebaute ICM20948-IMU ein:

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

Der Block legt die IMU unter dem Namen `imu` an. Verwende dieses Objekt auch in den folgenden Blöcken.

## Beschleunigung auslesen

<!-- @slug beschleunigung-messen -->

Lies die Beschleunigung auf allen drei Achsen aus:

```python
beschleunigung_x, beschleunigung_y, beschleunigung_z = imu.acceleration
print(
    "Beschleunigung: X: %.2f, Y: %.2f, Z: %.2f m/s^2"
    % (beschleunigung_x, beschleunigung_y, beschleunigung_z)
)
```

<!-- @details -->

Der Block setzt voraus, dass `imu` zuvor initialisiert wurde. Die Werte kannst du mit [print](doc:text/werte-ausgeben) ausgeben.

## Drehgeschwindigkeit auslesen

<!-- @slug drehgeschwindigkeit-messen -->

Lies die Drehgeschwindigkeit auf allen drei Achsen aus:

```python
gyro_x, gyro_y, gyro_z = imu.gyro
print(
    "Drehgeschwindigkeit: X: %.2f, Y: %.2f, Z: %.2f rad/s"
    % (gyro_x, gyro_y, gyro_z)
)
```

<!-- @details -->

Der Block setzt voraus, dass `imu` zuvor initialisiert wurde.

## Bewegungssensor vollständig auslesen

<!-- @slug bewegungssensor-vollstaendig-auslesen -->

Dieses vollständige Beispiel initialisiert den Sensor und gibt jede Sekunde Beschleunigung und Drehgeschwindigkeit aus:

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

<!-- @details -->

Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

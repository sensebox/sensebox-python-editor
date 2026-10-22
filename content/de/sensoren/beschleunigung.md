---
name: Beschleunigung
subtitle: Beschleunigung messen
image: ../../images/beschleunigung.svg
imageAlt: Drei Achsen für Beschleunigung und Drehung
---

Der Beschleunigungssensor ist auf der MCU S2 verbaut! Du musst hier also nichts weiter anschließen.

## Temperatur messen

<!-- @slug beschleunigung-messen -->

Dieses Beispiel gibt die Beschleunigungswerte und Gyroskop-Daten jede Sekunde in der Konsole aus:

```python
import time
import busio
import microcontroller
import adafruit_mpu6050

scl = microcontroller.pin.GPIO42
sda = microcontroller.pin.GPIO45

i2c = busio.I2C(scl, sda)
mpu = adafruit_mpu6050.MPU6050(i2c)

while True:
  print("Acceleration: X:%.2f, Y: %.2f, Z: %.2f m/s^2"%(mpu.acceleration))
  print("Gyro X:%.2f, Y: %.2f, Z: %.2f degrees/s"%(mpu.gyro))
  print("")
  time.sleep(1)
```

<!-- @details -->

Die Werte kannst du mit [print](doc:grundlagen/ausgabe) ausgeben.
Weitere Informationen findest du in der [senseBox-Dokumentation](https://docs.sensebox.de).

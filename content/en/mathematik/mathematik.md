---
name: Mathematik
subtitle: Calculate, check, limit, and distribute numbers
image: ../../images/mathematik.svg
---

Calculate, check and convert numbers.

## Number

Sets a numeric value.

```python
number = 123
decimal = 3.14
```

## Basic Arithmetic Operations

<!-- @alternatives Operation -->

Combines numbers using an arithmetic operation.

### Add

```python
result = 5 + 3
```

### Subtract

```python
result = 5 - 3
```

### Multiply

```python
result = 5 * 3
```

### Divide

```python
result = 5 / 3
```

### Powers

```python
result = 5 ** 3
```

## Negative Number

Reverses the sign of a number.

```python
number = 5
result = -number
```

## Single Mathematical Function

<!-- @alternatives Funktion -->

Calculates a mathematical function.

### Square Root

```python
import math

result = math.sqrt(9)
```

### Value

```python
result = abs(-5)
```

### Natural Logarithm

```python
import math

result = math.log(10)
```

### Decimal Logarithm

```python
import math

result = math.log10(100)
```

### Exponential Function

```python
import math

result = math.exp(2)
```

### Powers of 10

```python
result = 10 ** 3
```

## Trigonometric Functions

<!-- @alternatives Funktion -->

Calculates a trigonometric function.

### Sine

```python
import math

result = math.sin(math.radians(45))
```

### Cosine

```python
import math

result = math.cos(math.radians(45))
```

### Tangent

```python
import math

result = math.tan(math.radians(45))
```

### Arc sine

```python
import math

angle = math.degrees(math.asin(0.5))
```

### Arccosine

```python
import math

angle = math.degrees(math.acos(0.5))
```

### Arctangent

```python
import math

angle = math.degrees(math.atan(1))
```

## Mathematical Constant

<!-- @alternatives Konstante -->

Provides a mathematical constant.

### Pi

```python
import math

value = math.pi
```

### Euler's number

```python
import math

value = math.e
```

### Golden ratio

```python
value = (1 + 5 ** 0.5) / 2
```

### Square root of 2

```python
import math

value = math.sqrt(2)
```

### Square root of 1/2

```python
import math

value = math.sqrt(0.5)
```

### Infinity

```python
value = float(“inf”)
```

## Check a number

<!-- @alternatives Eigenschaft -->

Checks a property of a number.

### Even

```python
number = 8
result = number % 2 == 0
```

### Odd

```python
number = 7
result = number % 2 != 0
```

### Prime number

```python
number = 17
is_prime = number >= 2 and all(number % i for i in range(2, int(number ** 0.5) + 1))
```

### Integer

```python
number = 5.0
result = number == int(number)
```

### Positive

```python
result = 5 > 0
```

### Negative

```python
result = -5 < 0
```

### Divisible by

```python
result = 15 % 3 == 0
```

## Increasing or Decreasing a Variable

<!-- @alternatives Änderung -->

Increases or decreases the value of a variable.

### Increment

```python
number = 0
number += 1
```

### Decrement

```python
number = 0
number -= 1
```

## Round

<!-- @alternatives Richtung -->

Rounds a number to an integer.

### Round normally

```python
result = round(3.6)
```

### Round up

```python
import math

result = math.ceil(3.1)
```

### Round down

```python
import math

result = math.floor(3.9)
```

## Remainder of a Division

Calculates the remainder of a division.

```python
remainder = 64 % 10
```

## Limiting a Value

Limits a value to a specified range.

```python
value = 120
lower_limit = 0
upper_limit = 100
limited_value = min(max(value, lower_limit), upper_limit)
```

## Random Integer Value

Generates a random integer including both bounds.

```python
import random

value = random.randint(1, 100)
```

## Random number between 0 and 1

Generates a random number between 0 and 1.

```python
import random

value = random.random()
```

## Map a value

Maps a value linearly to another range.

```python
value = 50
from_min = 0
from_max = 100
to_min = 0
to_max = 255

mapped = (value - from_min) * (to_max - to_min) / (from_max - from_min) + to_min
```

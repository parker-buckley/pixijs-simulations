export class Vector {
    x: number;
    y: number;
  
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  
    // Addition
    add(vector: Vector): Vector {
      this.x += vector.x;
      this.y += vector.y;
      return this; // Returning the updated vector to allow method chaining
    }
  
    // Subtraction
    subtract(vector: Vector): Vector {
      this.x -= vector.x;
      this.y -= vector.y;
      return this; // Returning the updated vector to allow method chaining
    }
  
    // Scalar multiplication
    multiply(scalar: number): Vector {
      this.x *= scalar;
      this.y *= scalar;
      return this; // Returning the updated vector to allow method chaining
    }
  
    // Scalar division
    divide(scalar: number): Vector {
      if (scalar === 0) {
        throw new Error("Cannot divide by zero");
      }
      this.x /= scalar;
      this.y /= scalar;
      return this; // Returning the updated vector to allow method chaining
    }
  
    // Dot product with another vector
    dot(vector: Vector): number {
      return this.x * vector.x + this.y * vector.y;
    }
  
    // Magnitude (length) of the vector
    magnitude(): number {
      return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
  
    // Normalizing the vector (to unit length)
    normalize(): Vector {
      const mag = this.magnitude();
      if (mag === 0) {
        throw new Error("Cannot normalize a zero vector");
      }
      this.x /= mag;
      this.y /= mag;
      return this; // Returning the updated vector to allow method chaining
    }

  }
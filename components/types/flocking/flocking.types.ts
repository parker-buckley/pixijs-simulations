import * as PIXI from "pixi.js";

export class Boid {
    velocity: Vector;
    pixiAnimatedSprite: PIXI.AnimatedSprite;

    constructor( x: number, y:number, pixiApp: PIXI.Application, animationSprites: PIXI.Texture[] ) {
        this.velocity = new Vector(0,0);
        
        this.pixiAnimatedSprite = new PIXI.AnimatedSprite( animationSprites );
        this.pixiAnimatedSprite.x = x
        this.pixiAnimatedSprite.y = y
        this.pixiAnimatedSprite.width = 50; 
        this.pixiAnimatedSprite.height = 50;
        this.pixiAnimatedSprite.anchor.set( 0.5 );
        this.pixiAnimatedSprite.animationSpeed = 0.1;
        this.pixiAnimatedSprite.rotation = Math.atan2( this.velocity.x, this.velocity.y );
        pixiApp.stage.addChild( this.pixiAnimatedSprite );
        this.pixiAnimatedSprite.gotoAndPlay( 0 );
    }
    
    getPosition() {
        return { x: this.pixiAnimatedSprite.x, y: this.pixiAnimatedSprite.y };
    }

    setVelocity( x: number, y: number ) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.pixiAnimatedSprite.rotation = Math.atan2( this.velocity.x, this.velocity.y );
    }

    getVelocity() {
        return this.velocity;
    }

    updatePosition() {
        this.pixiAnimatedSprite.position = new PIXI.Point(
            this.velocity.x + this.pixiAnimatedSprite.x
            , this.velocity.y + this.pixiAnimatedSprite.y
        );
    }
}

class Vector {
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

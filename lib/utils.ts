import { Vector } from "@/components/types/flocking/flocking.types"

export const getRandomSignedNumber = ( range: number ) => {
    const isPositive = (Math.random() < 0.5)

    if( isPositive ) {
        return Math.round( Math.random() * range )
    } else {
        return -1 * Math.round( Math.random() * range )
    }
}

export const angleBetweenVectors = (v1: Vector, v2: Vector) => {
    const dot = v1.x * v2.x + v1.y * v2.y; // Dot product
    const det = v1.x * v2.y - v1.y * v2.x; // Determinant (cross product in 2D)
    return Math.atan2(det, dot); // Angle difference in radians
}

export const radiansToUnitVector = (radians: number) => {
    return new Vector(Math.cos(radians),Math.sin(radians));
}
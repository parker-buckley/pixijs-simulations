import { Boid, Vector } from '../../components/types/flocking/flocking.types'

const SPEED_LIMIT = 3;

export const calculateCohesion = (boids: Boid[], localFlockRadius: number, COHESION_CONST: number ) => {
    for( const boid of boids ) {
        const id = boid.pixiAnimatedSprite.uid;

        const nearNeighbors: Boid[] = [];
        for( const otherBoid of boids ) {
            if( otherBoid.pixiAnimatedSprite.uid === id ) continue;

            const otherBoidPosition = otherBoid.getPosition();
            if( boid.getDistance( otherBoidPosition.x, otherBoidPosition.y ) <= localFlockRadius ) {
                nearNeighbors.push( otherBoid );
            }
        }
        if( !nearNeighbors.length ) continue;
        
        let xSum = 0;
        let ySum = 0;

        for( const neighbor of nearNeighbors ) {
            const position = neighbor.getPosition();
            xSum += position.x;
            ySum += position.y;
        }

        const xAvg = xSum / nearNeighbors.length;
        const yAvg = ySum / nearNeighbors.length;

        const boidPosition = boid.getPosition();
        const positionVector = new Vector( boidPosition.x, boidPosition.y );
        const centerOfMass = new Vector(xAvg, yAvg);

        boid.velocity.add( centerOfMass.subtract(positionVector ).divide(250 - COHESION_CONST) );

        if( boid.velocity.magnitude() > SPEED_LIMIT ) {
            const speedingValue = boid.velocity.magnitude() - SPEED_LIMIT;
            const speedingPercentage = ( speedingValue / SPEED_LIMIT );
            boid.velocity.divide( 1 + speedingPercentage );
        }
    }
}

export const calculateSeparation = (boids: Boid[], localFlockRadius: number, SEPARATION_DISTANCE: number) => {
    for( const boid of boids ) {
        const id = boid.pixiAnimatedSprite.uid;

        const nearNeighbors: Boid[] = [];
        for( const otherBoid of boids ) {
            if( otherBoid.pixiAnimatedSprite.uid === id ) continue;

            const otherBoidPosition = otherBoid.getPosition();
            if( boid.getDistance( otherBoidPosition.x, otherBoidPosition.y ) <= localFlockRadius ) {
                nearNeighbors.push( otherBoid );
            }
        }
        if( !nearNeighbors.length ) continue;

        for( const neighbor of nearNeighbors ) {
            const neighborPosition = neighbor.getPosition();
            if( boid.getDistance(neighborPosition.x, neighborPosition.y) < SEPARATION_DISTANCE ) {
                const boidPosition = boid.getPosition();
                const positionDifference = new Vector( neighborPosition.x, neighborPosition.y )
                        .subtract( new Vector(boidPosition.x, boidPosition.y) );
                boid.velocity.subtract( positionDifference );
            }
        }

        if( boid.velocity.magnitude() > SPEED_LIMIT ) {
            const speedingValue = boid.velocity.magnitude() - SPEED_LIMIT;
            const speedingPercentage = ( speedingValue / SPEED_LIMIT );
            boid.velocity.divide( 1 + speedingPercentage );
        }
    }
}

export const calculateAlignment = (boids: Boid[], localFlockRadius: number, ALIGNMENT_CONST: number) => {
    for( const boid of boids ) {
        const id = boid.pixiAnimatedSprite.uid;

        const nearNeighbors: Boid[] = [];
        for( const otherBoid of boids ) {
            if( otherBoid.pixiAnimatedSprite.uid === id ) continue;

            const otherBoidPosition = otherBoid.getPosition();
            if( boid.getDistance( otherBoidPosition.x, otherBoidPosition.y ) <= localFlockRadius ) {
                nearNeighbors.push( otherBoid );
            }
        }
        if( !nearNeighbors.length ) continue;
        
        let xSum = 0;
        let ySum = 0;

        for( const neighbor of nearNeighbors ) {
            const velocity = neighbor.getVelocity();
            xSum += velocity.x;
            ySum += velocity.y;
        }

        const xAvg = xSum / nearNeighbors.length;
        const yAvg = ySum / nearNeighbors.length;

        boid.velocity.add( new Vector(xAvg,yAvg).divide(15 - ALIGNMENT_CONST) );

        if( boid.velocity.magnitude() > SPEED_LIMIT ) {
            const speedingValue = boid.velocity.magnitude() - SPEED_LIMIT;
            const speedingPercentage = ( speedingValue / SPEED_LIMIT );
            boid.velocity.divide( 1 + speedingPercentage );
        }
    } 
}

export const boundPositions = (boids: Boid[], xMin: number, xMax: number, yMin: number, yMax: number, boundaryMargin: number) => {
    for( const boid of boids ) {
        const boidPosition = boid.getPosition();

        if( boidPosition.x > (xMax - boundaryMargin) ) {
            boid.velocity.x -= 3;
        }
        if( boidPosition.x < (xMin + boundaryMargin) ) {
            boid.velocity.x += 3;
        }
        if( boidPosition.y > (yMax - boundaryMargin) ) {
            boid.velocity.y -= 3;
        }
        if( boidPosition.y < (yMin + boundaryMargin) ) {
            boid.velocity.y += 3;
        }
    } 
}
import * as PIXI from 'pixi.js'
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

export const setupBackground = async ( appRef: React.MutableRefObject<PIXI.Application<PIXI.Renderer> | null>) => {
    if( !appRef.current ) return;

    const [ bg1, bg2 , bg3, bg4 ] = await Promise.all( [
        PIXI.Assets.load<PIXI.Texture>('/BG/1.png')
        , PIXI.Assets.load<PIXI.Texture>('/BG/2.png')
        , PIXI.Assets.load<PIXI.Texture>('/BG/3.png')
        , PIXI.Assets.load<PIXI.Texture>('/BG/4.png')
    ]);

    const bg1Sprite = new PIXI.Sprite( bg1 );
    const bg2Sprite = new PIXI.Sprite( bg2 );
    const bg3Sprite = new PIXI.Sprite( bg3 );
    const bg4Sprite = new PIXI.Sprite( bg4 );

    bg1Sprite.height = appRef.current.screen.height;
    bg1Sprite.width = appRef.current.screen.width;
    bg2Sprite.height = appRef.current.screen.height;
    bg2Sprite.width = appRef.current.screen.width;
    bg3Sprite.height = appRef.current.screen.height;
    bg3Sprite.width = appRef.current.screen.width;
    bg4Sprite.height = appRef.current.screen.height;
    bg4Sprite.width = appRef.current.screen.width;

    bg1Sprite.anchor = 0.5;
    bg2Sprite.anchor = 0.5;
    bg3Sprite.anchor = 0.5;
    bg4Sprite.anchor = 0.5;

    bg1Sprite.x = appRef.current.screen.width / 2;
    bg1Sprite.y = appRef.current.screen.height / 2;
    bg2Sprite.x = appRef.current.screen.width / 2;
    bg2Sprite.y = appRef.current.screen.height / 2;
    bg3Sprite.x = appRef.current.screen.width / 2;
    bg3Sprite.y = appRef.current.screen.height / 2;
    bg4Sprite.x = appRef.current.screen.width / 2;
    bg4Sprite.y = appRef.current.screen.height / 2;

    appRef.current.stage.addChild(bg1Sprite);
    appRef.current.stage.addChild(bg2Sprite);
    appRef.current.stage.addChild(bg3Sprite);
    appRef.current.stage.addChild(bg4Sprite);
}
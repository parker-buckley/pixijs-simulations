import * as PIXI from 'pixi.js'
        
export const velocities = new Map<number, { velocityX: number, velocityY: number}>();
export const BALL_RADIUS = 15;
export const PEG_RADIUS = 20;
export let canBuyBall = true;
export let score = 0;
export let points = 100;

export function setPoints( newPoints: number, pointsText: PIXI.Text ) {
    points = newPoints;
    pointsText.text = 'Points: ' + points;
}

export function createBall( 
    xPosition: number
    , balls: PIXI.Sprite[]
    , ballTexture: PIXI.Texture
    , appRef: React.MutableRefObject<PIXI.Application<PIXI.Renderer> | null>
) {
    if ( !appRef.current ) return;
    
    const ball = new PIXI.Sprite(ballTexture);
    ball.setSize( BALL_RADIUS * 2 );
    ball.anchor.set(0.5);
    ball.x = xPosition
    ball.y = 50; // start position (top of the board)
    velocities.set(ball.uid, { velocityX: 0, velocityY: 0 });
    appRef.current.stage.addChild(ball);
    balls.push( ball );
}

export function setBallVelocity(ballUid: number, velocityX: number, velocityY: number) {
    const preUpdateVelocities = velocities.get(ballUid);

    if( preUpdateVelocities ) {
        velocities.set(ballUid,{
            velocityX: velocityX
            , velocityY: velocityY
        });
    }
};

export function getBallVelocity(ballUid: number ): {velocityX: number, velocityY: number} {
    const velocity = velocities.get(ballUid);

    if( velocity ) {
        return {
            velocityX: velocity.velocityX
            , velocityY: velocity.velocityY
        }
    } else {
        return {
            velocityX: 0
            , velocityY: 0
        }
    }
};

export function updateBalls(
    balls: PIXI.Sprite[]
    , pegs: PIXI.Sprite[]
    , appRef: React.MutableRefObject<PIXI.Application<PIXI.Renderer> | null>
    , scoreZones: {
        left: number;
        right: number;
        score: number;
    }[]
    , scoreText: PIXI.Text
    , pointsText: PIXI.Text
) {
    if( !appRef.current ) return;

    for( const ball of balls ){

        const preUpdateVelocities = velocities.get(ball.uid);

        if( preUpdateVelocities ) {
            velocities.set(ball.uid,{
                velocityX: preUpdateVelocities.velocityX
                , velocityY: preUpdateVelocities.velocityY + 0.05
            });
        }
    
        // Move the ball
        const ballVelocity = getBallVelocity(ball.uid);
        ball.y += ballVelocity.velocityY
        ball.x += ballVelocity.velocityX

        // Check for collisions with pegs
        for (const peg of pegs) {
            const dist = Math.sqrt(Math.pow(ball.x - peg.x, 2) + Math.pow(ball.y - peg.y, 2));
    
            // If the ball hits a peg
            if (dist < BALL_RADIUS + PEG_RADIUS) { // ball radius + peg radius

                const distanceToPegX = Math.abs(ball.x - peg.x);
                const distanceToPegY = Math.abs(ball.y - peg.y);

                if (ball.x <= peg.x) {
                    setBallVelocity(
                        ball.uid
                        , (-0.5 * (distanceToPegX / 10) )
                        , ballVelocity.velocityY - (ballVelocity.velocityY * (distanceToPegY / PEG_RADIUS )) );
                } else {
                    setBallVelocity(
                        ball.uid
                        , (0.5 * (distanceToPegX / 10 ) )
                        , ballVelocity.velocityY - (ballVelocity.velocityY * (distanceToPegY / PEG_RADIUS )) );
                }
            }
        }

        // Check if ball reaches bottom
        if (ball.y > appRef.current.screen.height - (BALL_RADIUS * 2)) {
            calculateScore( ball, scoreZones, scoreText, pointsText );
            ball.destroy();
            for( let i = 0; i < balls.length; i++ ) {
                const ballElement = balls[i];
                if( ballElement.uid === ball.uid ) {
                    balls = balls.splice( i, 1 );
                }
            }
        }
    }
}

export function calculateScore(
    ball: PIXI.Sprite
    , scoreZones: { left: number, right:number, score: number }[]
    , scoreText: PIXI.Text
    , pointsText: PIXI.Text 
) {
    const landingX = ball.x;
    let scoreBonus = 0;

    for( const scoreZone of scoreZones ) {
        if( landingX > scoreZone.left && landingX < scoreZone.right ) {
            scoreBonus = scoreZone.score;
        }
    }

    score += Math.round(scoreBonus);
    points += Math.round(scoreBonus);
    scoreText.text = 'Score: ' + score;
    pointsText.text = 'Points: ' + points;

    if (points >= 10) {
        canBuyBall = true;
    }
}

export const drawScoreZones = (
    scoreZoneGraphics: PIXI.Graphics
    , appRef: React.MutableRefObject<PIXI.Application<PIXI.Renderer> | null>
): { left: number, right:number, score: number }[] => {
        const scoreZones: { left: number, right:number, score: number }[] = [];
        
        if( appRef.current ) {
            const screenWidth = appRef.current.screen.width;
            const screenHeight = appRef.current.screen.height;

            const numScoreZones = 7;
            const scoreZoneWidth = screenWidth / 7;
            const scoreZoneHeight = screenHeight / 20;

            const scoreZoneColorCodes = ['#fa0505', '#ff4040', '#fff830', '#13b804', '#fff830', '#ff4040', '#fa0505'];
            const scoreZonePoints = [ 0, 5, 10, 30, 10, 5, 0];

            for( let i = 0; i < numScoreZones; i++ ) {
                const bottomLeftVertex = i * scoreZoneWidth;
                
                
                scoreZoneGraphics.poly([
                    new PIXI.Point( bottomLeftVertex, screenHeight ) // bottom left
                    , new PIXI.Point( bottomLeftVertex, screenHeight - scoreZoneHeight ) // top left
                    , new PIXI.Point( bottomLeftVertex + scoreZoneWidth, screenHeight - scoreZoneHeight ) // top right
                    , new PIXI.Point( bottomLeftVertex + scoreZoneWidth, screenHeight ) // bottom right
                ]);
                scoreZoneGraphics.fill({ color: scoreZoneColorCodes[i], alpha: 0.5 });

                scoreZones.push({left: bottomLeftVertex, right: bottomLeftVertex + scoreZoneWidth, score: scoreZonePoints[i]});
            
                const scoreText = new PIXI.Text( scoreZonePoints[i] +' Pts', {fontFamily: 'Arial', fontSize: 12, fill: 0x000000});
                scoreText.position.set(bottomLeftVertex + (scoreZoneWidth / 2) - (scoreText.width / 2), screenHeight - (scoreZoneHeight / 2) - (scoreText.height / 2));
                appRef.current?.stage.addChild( scoreText );
            }
        
            return scoreZones;
        }
        return scoreZones;
    }
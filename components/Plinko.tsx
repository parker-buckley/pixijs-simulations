import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const Plinko = () => {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null); // Ref for container
  const appRef = useRef<PIXI.Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect( () => {
    const appReady = new Promise<PIXI.Application>((resolve) => {
      const app = new PIXI.Application();
      appRef.current = app;
      resolve(app);
    });
    
    const drawScoreZones = (scoreZoneGraphics: PIXI.Graphics): { left: number, right:number, score: number }[] => {
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

    const applicationWrapper = async () => {
      const app = await appReady;      
      
      if (pixiContainerRef.current && appRef.current) {
        await app.init({ backgroundColor: 0x1099bb, resizeTo: pixiContainerRef.current });
        canvasRef.current = appRef.current.canvas;
        canvasRef.current.width = pixiContainerRef.current.clientWidth;
        canvasRef.current.height = pixiContainerRef.current.clientHeight;
        canvasRef.current.setAttribute( 'id', 'pixi-canvas ');
        const ballTexture = await PIXI.Assets.load<PIXI.Texture>('/ballBearing.png');
        const pegTexture = await PIXI.Assets.load<PIXI.Texture>('/woodenCircle.png');
            
        // Game variables
        let score = 0;
        let points = 100;
        let canBuyBall = true;
        let ballInPlay = false;
        const BALL_RADIUS = 15;
        const PEG_RADIUS = 20;
        
        // Data structure to store velocities for each sprite
        const velocities = new Map<number, { velocityX: number, velocityY: number}>();
        
        // Create score and points text
        const scoreText = new PIXI.Text('Score: ' + score, {fontFamily: 'Arial', fontSize: 24, fill: 0x000000});
        scoreText.position.set(10, 10);
        app.stage.addChild(scoreText);
        
        const pointsText = new PIXI.Text('Points: ' + points, {fontFamily: 'Arial', fontSize: 24, fill: 0x000000});
        pointsText.position.set(10, 40);
        app.stage.addChild(pointsText);
        
        // Create the Plinko pegs (using sprites now)
        const pegs: PIXI.Sprite[] = [];
        const rowCount = 10;
        const columnCount = 12;
        const colSpacing = app.screen.width / 12 ;
        const rowSpacing = app.screen.height / 10;

        for (let row = 0; row < rowCount; row++) {
            const yPos = 100 + row * rowSpacing;
            for (let col = 0; col < columnCount; col++) {
                const xPos = (col * colSpacing) + (row % 2 === 0 ? 0 : colSpacing / 2);
            
                const peg = new PIXI.Sprite(pegTexture);
                peg.setSize( PEG_RADIUS * 2 );
                peg.anchor.set(0.5); // To center the peg's texture
                peg.x = xPos;
                peg.y = yPos;
                app.stage.addChild(peg);
                pegs.push(peg);
            }
        }

        const scoreZoneGraphics = new PIXI.Graphics();
        const scoreZones = drawScoreZones( scoreZoneGraphics );
        app.stage.addChild(scoreZoneGraphics);
        
        let ball: PIXI.Sprite;

        function createBall( xPosition: number ) {
            ball = new PIXI.Sprite(ballTexture);
            ball.setSize( BALL_RADIUS * 2 );
            ball.anchor.set(0.5);
            ball.x = xPosition
            ball.y = 50; // start position (top of the board)
            velocities.set(ball.uid, { velocityX: 0, velocityY: 0 });
            ballInPlay = true;
            app.stage.addChild(ball);
        }
        
        function setBallVelocity(velocityX: number, velocityY: number) {
            const preUpdateVelocities = velocities.get(ball.uid);

            if( preUpdateVelocities ) {
                velocities.set(ball.uid,{
                    velocityX: velocityX
                    , velocityY: velocityY
                });
            }
        };
        function getBallVelocity(): {velocityX: number, velocityY: number} {
            const velocity = velocities.get(ball.uid);

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

        function updateBall() {
            if (!ballInPlay) return;
        
            const preUpdateVelocities = velocities.get(ball.uid);

            if( preUpdateVelocities ) {
                velocities.set(ball.uid,{
                    velocityX: preUpdateVelocities.velocityX
                    , velocityY: preUpdateVelocities.velocityY + 0.05
                });
            }
        
            // Move the ball
            const ballVelocity = getBallVelocity();
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
                            (-0.5 * (distanceToPegX / 10) )
                            , ballVelocity.velocityY - (ballVelocity.velocityY * (distanceToPegY / PEG_RADIUS )) );
                    } else {
                        setBallVelocity(
                            (0.5 * (distanceToPegX / 10 ) )
                            , ballVelocity.velocityY - (ballVelocity.velocityY * (distanceToPegY / PEG_RADIUS )) );
                    }
                }
            }

            // Check if ball reaches bottom
            if (ball.y > app.screen.height - (BALL_RADIUS * 2)) {
                ballInPlay = false;
                calculateScore( scoreZones );
            }
        }
        
        function calculateScore(scoreZones: { left: number, right:number, score: number }[]) {
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
        
        // Button to buy a ball if you have enough points
        const buyButton = new PIXI.Text('Buy Ball (10 Points) Click Anywhere', {fontFamily: 'Arial', fontSize: 24, fill: 0x000000});
        buyButton.hitArea = app.screen;
        buyButton.interactive = true;
        buyButton.position.set(app.screen.width / 2 - (buyButton.width / 2), 40);
        buyButton.on('mousedown', (event) => {
            if (canBuyBall) {
                points -= 10;
                canBuyBall = false;
                createBall(event.globalX);
            }
        });
        app.stage.addChild(buyButton);

        for ( const pixiContainerChild of pixiContainerRef.current.children) {
            if( 
                pixiContainerChild.getAttribute('id') !== 'pixi-canvas' 
                && pixiContainerChild.tagName === 'CANVAS'
            ) {
                pixiContainerChild.remove();
            }
        }
        pixiContainerRef.current.appendChild(app.canvas);

        app.ticker.add(() =>
        {
            updateBall();
        });
      }
    
      return () => {
        if (appRef.current) {
          appRef.current.destroy(true, { children: true });
          appRef.current = null;
        }
      };
    }

    applicationWrapper()

  }, [ pixiContainerRef, appRef, canvasRef ]);

  return (
    <div ref={pixiContainerRef} className="h-screen">
    </div>
  );
};

export default Plinko;

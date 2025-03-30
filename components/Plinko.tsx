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
    
    const applicationWrapper = async () => {
      const app = await appReady;      
      await app.init({ backgroundColor: 0x1099bb, resizeTo: window, });

      if (pixiContainerRef.current && appRef.current) {
        canvasRef.current = appRef.current.canvas;
        canvasRef.current.setAttribute( 'id', 'pixi-canvas ');
        const ballTexture = await PIXI.Assets.load<PIXI.Texture>('/ballBearing.png');
        const pegTexture = await PIXI.Assets.load<PIXI.Texture>('/woodenCircle.png');


        /* START ChatGPT Code */
            
            // Game variables
            let score = 0;
            let points = 100;
            let canBuyBall = true;
            let ballInPlay = false;
            
            // Data structure to store velocities for each sprite
            const velocities = new Map<number, { velocityX: number, velocityY: number}>();
            
            // Create score and points text
            const scoreText = new PIXI.Text('Score: ' + score, {fontFamily: 'Arial', fontSize: 24, fill: 0xffffff});
            scoreText.position.set(10, 10);
            app.stage.addChild(scoreText);
            
            const pointsText = new PIXI.Text('Points: ' + points, {fontFamily: 'Arial', fontSize: 24, fill: 0xffffff});
            pointsText.position.set(10, 40);
            app.stage.addChild(pointsText);
            
            // Create the Plinko pegs (using sprites now)
            const pegs: PIXI.Sprite[] = [];
            const rowCount = 10;
            const columnCount = 10;
            const pegSpacing = app.screen.width / 10 ;
            
            for (let row = 0; row < rowCount; row++) {
                const yPos = 100 + row * pegSpacing;
                for (let col = 0; col < columnCount; col++) {
                    const xPos = (col * pegSpacing) + (row % 2 === 0 ? 0 : pegSpacing / 2);
                
                    const peg = new PIXI.Sprite(pegTexture);
                    peg.setSize( 40 );
                    peg.anchor.set(0.5); // To center the peg's texture
                    peg.x = xPos;
                    peg.y = yPos;
                    app.stage.addChild(peg);
                    pegs.push(peg);
                }
            }
            
            // Ball logic (using sprite now)
            let ball: PIXI.Sprite;
            function createBall( xPosition: number ) {
                ball = new PIXI.Sprite(ballTexture);
                ball.setSize( 30 );
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

            // Ball bounce logic
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
                    if (dist < 13 + 20) { // ball radius + peg radius
                        const distanceToPegX = Math.abs(ball.x - peg.x);
                        const distanceToPegY = Math.abs(ball.y - peg.y);
                        if (ball.x < peg.x) {
                            setBallVelocity(
                                ballVelocity.velocityX + (-0.5 * (distanceToPegX / 20) )
                                // ballVelocity.velocityX + (-0.5 * (Math.max(ballVelocity.velocityX, distanceToPegX / 20)) )
                                , ballVelocity.velocityY + (-ballVelocity.velocityY * (distanceToPegY / 33 )) );
                        } else {
                            setBallVelocity(
                                ballVelocity.velocityX + (0.5 * (distanceToPegX / 20) )
                                // ballVelocity.velocityX + (0.5 * (Math.max(ballVelocity.velocityX, distanceToPegX / 15)) )
                                , -ballVelocity.velocityY + (-ballVelocity.velocityY * (distanceToPegY / 33 )) );
                        }
                        // ball.y = peg.y + 20 + 15; // prevent ball from overlapping peg
                    }
                }
            
                // Check if ball reaches bottom
                if (ball.y > app.screen.height - 50) {
                    ballInPlay = false;
                    calculateScore();
                }
            }
            
            // Scoring based on where the ball lands
            function calculateScore() {
                const landingX = ball.x;
                const centerX = app.screen.width / 2;
                const distanceFromCenter = Math.abs(centerX - landingX);
            
                // The closer to the center, the more points you get
                const scoreBonus = Math.max(0, 100 - distanceFromCenter);
                score += scoreBonus;
            
                // Update score and points
                points += scoreBonus;
                scoreText.text = 'Score: ' + score;
                pointsText.text = 'Points: ' + points;
            
                // Check if the player can buy a ball
                if (points >= 10) {
                    canBuyBall = true;
                }
            }
            
            // Button to buy a ball if you have enough points
            const buyButton = new PIXI.Text('Buy Ball (10 Points) Click Anywhere', {fontFamily: 'Arial', fontSize: 24, fill: 0xffffff});
            buyButton.hitArea = app.screen;
            buyButton.interactive = true;
            buyButton.position.set(10, 80);
            buyButton.on('mousedown', (event) => {
                if (canBuyBall) {
                    points -= 10;
                    canBuyBall = false;
                    createBall(event.globalX);
                }
            });
            app.stage.addChild(buyButton);
  
        /* END  ChatGPT Code */

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

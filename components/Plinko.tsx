import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import {
    createBall
    , updateBalls
    , PEG_RADIUS
    , drawScoreZones
    , score
    , points
    , setPoints
} from '@/lib/plinko/plinko'

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
      
      if (pixiContainerRef.current && appRef.current) {
        await app.init({ backgroundColor: 0x1099bb, resizeTo: pixiContainerRef.current });
        canvasRef.current = appRef.current.canvas;
        canvasRef.current.width = pixiContainerRef.current.clientWidth;
        canvasRef.current.height = pixiContainerRef.current.clientHeight;
        canvasRef.current.setAttribute( 'id', 'pixi-canvas ');
        
        const ballTexture = await PIXI.Assets.load<PIXI.Texture>('/ballBearing.png');
        const pegTexture = await PIXI.Assets.load<PIXI.Texture>('/woodenCircle.png');
        
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
        const scoreZones = drawScoreZones( scoreZoneGraphics, appRef);
        app.stage.addChild(scoreZoneGraphics);
        
        const balls: PIXI.Sprite[] = [];
        
        // Button to buy a ball if you have enough points
        const buyButton = new PIXI.Text('Buy Ball (10 Points) Click Anywhere', {fontFamily: 'Arial', fontSize: 24, fill: 0x000000});
        buyButton.hitArea = app.screen;
        buyButton.interactive = true;
        buyButton.position.set(10, 80);
        buyButton.on('mousedown', (event) => {
            if (points >= 10) {
                setPoints( points - 10, pointsText );
                createBall(event.globalX, balls, ballTexture, appRef);
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
            updateBalls(balls, pegs, appRef, scoreZones, scoreText, pointsText);
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

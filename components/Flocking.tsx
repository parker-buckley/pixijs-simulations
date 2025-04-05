import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

import { Boid, Vector } from './types/flocking/flocking.types'
import { calculateCohesion, calculateSeparation, calculateAlignment, boundPositions } from '@/lib/flocking/flocking'
import { getRandomSignedNumber } from "@/lib/utils";

const Flocking = () => {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null); // Ref for container
  const appRef = useRef<PIXI.Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  let cohesion = 25;
  let separation = 60;
  let alignment = 10;
  let localFlockRadius = 100;
  let numBoids = 25;
  let boundaryMargin = 50;

  useEffect( () => {
    const appReady = new Promise<PIXI.Application>((resolve) => {
      const app = new PIXI.Application();
      appRef.current = app;
      resolve(app);
    });

    const updateBoidCount = (boids: Boid[], newBoidCount: number, flightFrames: PIXI.Texture[]) => {
      const currentCount = boids.length;
      const boidsToAddOrRemove = newBoidCount - currentCount;
      
      if( boidsToAddOrRemove === 0 ) return;

      if( boidsToAddOrRemove > 0 ) {
        for( let i = 0; i < boidsToAddOrRemove; i++ ) {
          if( appRef.current ) {
            boids.push( new Boid( 
              (appRef.current.screen.width / 2) + + getRandomSignedNumber(screen.width/5)
              , (appRef.current.screen.height / 2) + getRandomSignedNumber(screen.height/5)
              , appRef.current
              , flightFrames
              , new Vector( Math.random(), Math.random())
            ));
          }
        }
      } else {
        for( let i = 0; i < Math.abs(boidsToAddOrRemove); i++ ) { 
          const boidToRemove = boids.pop();
          if( boidToRemove ) {
            boidToRemove.pixiAnimatedSprite.destroy();
          }
        }
      }

    }

    const applicationWrapper = async () => {
      const app = await appReady;      
      
      if (pixiContainerRef.current && appRef.current) {
        await app.init({ backgroundColor: 0x1099bb, resizeTo: pixiContainerRef.current });
        canvasRef.current = appRef.current.canvas;
        canvasRef.current.width = pixiContainerRef.current.clientWidth;
        canvasRef.current.height = pixiContainerRef.current.clientHeight;
        canvasRef.current.setAttribute( 'id', 'pixi-canvas ');
        
        for ( const pixiContainerChild of pixiContainerRef.current.children) {
            if( 
                pixiContainerChild.getAttribute('id') !== 'pixi-canvas' 
                && pixiContainerChild.tagName === 'CANVAS'
            ) {
                pixiContainerChild.remove();
            }
        }
        pixiContainerRef.current.appendChild(app.canvas);


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


        const [ birdFlightFrame1, birdFlightFrame2 , birdFlightFrame3, birdFlightFrame4 ] = await Promise.all( [
          PIXI.Assets.load<PIXI.Texture>('/Animations/birdFlight/flight1.png')
          , PIXI.Assets.load<PIXI.Texture>('/Animations/birdFlight/flight2.png')
          , PIXI.Assets.load<PIXI.Texture>('/Animations/birdFlight/flight3.png')
          , PIXI.Assets.load<PIXI.Texture>('/Animations/birdFlight/flight4.png')
        ]);

        const boids: Boid[] = [];
        updateBoidCount(boids, numBoids, [birdFlightFrame1, birdFlightFrame2 , birdFlightFrame3, birdFlightFrame4]);

        app.ticker.add(() =>
          {
            updateBoidCount(boids, numBoids, [birdFlightFrame1, birdFlightFrame2 , birdFlightFrame3, birdFlightFrame4]);
            calculateCohesion(boids, localFlockRadius, cohesion);
            calculateSeparation(boids, localFlockRadius, separation);
            calculateAlignment(boids, localFlockRadius, alignment);
            boundPositions(boids, app.screen.left, app.screen.right, app.screen.top, app.screen.bottom, boundaryMargin );
            for( const boid of boids ) {
              boid.updatePosition();
            }
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
      <aside id="default-sidebar" className="fixed right-0 top-50 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto bg-transparent">
          <div className="control-panel bg-transparent">
            <h2>Flocking Control Panel</h2>
            <div className="slider-group">
              <label>Cohesion:</label>
              <input 
                type="range" 
                id="cohesionSlider" 
                min="1" 
                max="200" 
                step="2" 
                onChange={(event)=> { cohesion = Number(event.target.value) }}
                ></input>
                <span>{cohesion}</span>
            </div>
            <div className="slider-group">
              <label>Separation:</label>
              <input 
                type="range"
                id="separationSlider"
                min="1"
                max="100"
                step="2"
                onChange={(event)=> { separation = Number(event.target.value) }}
              ></input>
              <span>{separation}</span>
            </div>
            <div className="slider-group">
              <label>Alignment:</label>
              <input 
                type="range" 
                id="alignmentSlider" 
                min="7" 
                max="14" 
                step="0.5" 
                onChange={(event)=> { alignment = Number(event.target.value) }}
                ></input>
                <span>{alignment}</span>
            </div>
            <div className="slider-group">
              <label>Neighbor Radius:</label>
              <input 
                type="range" 
                id="flockRadiusSlider" 
                min="10" 
                max="150" 
                step="5" 
                onChange={(event)=> { localFlockRadius = Number(event.target.value) }}
                ></input>
                <span>{localFlockRadius}</span>
            </div>
            <div className="slider-group">
              <label>Boundary Margin:</label>
              <input 
                type="range" 
                id="boundaryMarginSlider" 
                min="0" 
                max="150" 
                step="5" 
                onChange={(event)=> { boundaryMargin = Number(event.target.value) }}
                ></input>
                <span>{boundaryMargin}</span>
            </div>
            <div className="slider-group">
              <label>Bird Count:</label>
              <input 
                type="range" 
                id="numBoidsSlider" 
                min="0" 
                max="150" 
                step="1" 
                onChange={(event)=> { numBoids = Number(event.target.value) }}
                ></input>
                <span>{numBoids}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Flocking;

import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

import { Boid } from './types/flocking/flocking'

const Flocking = () => {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null); // Ref for container
  const appRef = useRef<PIXI.Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  let cohesion = 5;
  let separation = 5;
  let alignment = 5;

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
        
        for ( const pixiContainerChild of pixiContainerRef.current.children) {
            if( 
                pixiContainerChild.getAttribute('id') !== 'pixi-canvas' 
                && pixiContainerChild.tagName === 'CANVAS'
            ) {
                pixiContainerChild.remove();
            }
        }
        pixiContainerRef.current.appendChild(app.canvas);


        const [ birdFlightFrame1, birdFlightFrame2 , birdFlightFrame3, birdFlightFrame4 ] = await Promise.all( [
          PIXI.Assets.load<PIXI.Texture>('/Animations/birdFlight/flight1.png')
          , PIXI.Assets.load<PIXI.Texture>('/Animations/birdFlight/flight2.png')
          , PIXI.Assets.load<PIXI.Texture>('/Animations/birdFlight/flight3.png')
          , PIXI.Assets.load<PIXI.Texture>('/Animations/birdFlight/flight4.png')
        ]);

        const boid = new Boid( 
          appRef.current.screen.width / 2
          , appRef.current.screen.height / 2
          , appRef.current
          , [ birdFlightFrame1, birdFlightFrame2 , birdFlightFrame3, birdFlightFrame4 ]
        );


        // Rule 1: Boids try to fly towards the centre of mass of neighbouring boids.

        // Rule 2: Boids try to keep a small distance away from other objects (including other boids).


        // Rule 3: Boids try to match velocity with near boids.

        // Limiting the speed

        // Bounding the position
        app.ticker.add(() =>
        {
          boid.updatePosition();
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
                min="0" 
                max="10" 
                step="0.1" 
                onChange={(event)=> { cohesion = Number(event.target.value) }}
                ></input>
            </div>
            <div className="slider-group">
              <label>Separation:</label>
              <input 
                type="range"
                id="separationSlider"
                min="0"
                max="10"
                step="0.1"
                onChange={(event)=> { separation = Number(event.target.value) }}
              ></input>
            </div>
            <div className="slider-group">
              <label>Alignment:</label>
              <input 
                type="range" 
                id="alignmentSlider" 
                min="0" 
                max="10" 
                step="0.1" 
                onChange={(event)=> { alignment = Number(event.target.value) }}
                ></input>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Flocking;

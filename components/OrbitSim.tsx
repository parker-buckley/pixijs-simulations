import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const OrbitSim = () => {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null); // Ref for container
  const appRef = useRef<PIXI.Application | null>(null);

  /* 
    CONSTANTS
  */
  const acceleration = { x: 0, y: 0 };
  const G = 1000; // Gravitational constant (adjust for realistic motion)
  const orbitingBodies: PIXI.Sprite[] = [];
  const velocityVectors: {x: number, y:number}[] = []
  const NUM_STARS = 200;
  const NUM_MOONS = 2;

  const calculateOrbit = (orbitVelocityVector: {x: number, y:number}, orbitingBody: PIXI.Sprite, fixedBody: PIXI.Sprite) => {
    // Compute vector to Earth
    const dx = fixedBody.x - orbitingBody.x;
    const dy = fixedBody.y - orbitingBody.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize vector and compute gravitational force
    const force = G / (distance * distance);
    const ax = (dx / distance) * force;
    const ay = (dy / distance) * force;

    // Update acceleration
    acceleration.x = ax;
    acceleration.y = ay;

    // Update velocity
    orbitVelocityVector.x += acceleration.x;
    orbitVelocityVector.y += acceleration.y;

    // Update moon position
    orbitingBody.x += orbitVelocityVector.x;
    orbitingBody.y += orbitVelocityVector.y;
  }

  const lookAhead = ( 
    nTimes: number
    , orbitVelocityVector: {x: number, y:number}
    , orbitingBody: PIXI.Sprite
    , fixedBody: PIXI.Sprite
    , pixiGraphics: PIXI.Graphics
  ) => {
    const tempSprite = new PIXI.Sprite();
    tempSprite.x = orbitingBody.x;
    tempSprite.y = orbitingBody.y;
    tempSprite.anchor.set( orbitingBody.anchor.x, orbitingBody.anchor.y );
    const tempVelocityVector = { ...orbitVelocityVector };
    const projectedPoints: PIXI.Point[]  = [];

    for( let i = 0; i < nTimes; i++) {
      // Compute vector to Earth
      const dx = fixedBody.x - tempSprite.x;
      const dy = fixedBody.y - tempSprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Normalize vector and compute gravitational force
      const force = G / (distance * distance);
      const ax = (dx / distance) * force;
      const ay = (dy / distance) * force;

      // Update acceleration
      acceleration.x = ax;
      acceleration.y = ay;

      // Update velocity
      tempVelocityVector.x += acceleration.x;
      tempVelocityVector.y += acceleration.y;

      // Update moon position
      tempSprite.x += tempVelocityVector.x;
      tempSprite.y += tempVelocityVector.y;
    
      projectedPoints.push( new PIXI.Point(tempSprite.x, tempSprite.y) );
    }

    
    if( appRef.current ) {
      const universeContainer = appRef.current.stage.getChildByLabel('universe');
      const existingOrbitPathGraphics = universeContainer?.getChildByLabel('orbitPathGraphics');
      
      if( !existingOrbitPathGraphics ) {
        universeContainer?.addChild( pixiGraphics );
        universeContainer?.setChildIndex( pixiGraphics, 0 );
      } else {
        pixiGraphics.getTransform()
        pixiGraphics.fill( '#ffffff' );

        for( const point of projectedPoints ) {
          pixiGraphics.circle( point.x, point.y, 1 );
        }
      }
    }
  }

  useEffect( () => {
    const appReady = new Promise<PIXI.Application>((resolve) => {
      const app = new PIXI.Application();
      appRef.current = app;
      resolve(app)
    });

    const applicationWrapper = async () => {
      const app = await appReady;      

      if (pixiContainerRef.current && appRef.current) {

        await app.init({ background: '#000000', resizeTo: window, });
        pixiContainerRef.current.appendChild(app.canvas);

        const container = new PIXI.Container({label:'universe'});
        const orbitPathGraphics = new PIXI.Graphics({label:'orbitPathGraphics'});
        const backgroundGraphics = new PIXI.Graphics();
        
        for( let i = 0; i < NUM_STARS; i++ ) {
          backgroundGraphics.fill('#ffffff');
          backgroundGraphics.star(
            Math.round(Math.random() * screen.width)
            , Math.round(Math.random() * screen.height)  
            , 4
            , Math.round(Math.random() * 7)
            , 0
            , Math.round( Math.random() * Math.PI)
          );
        }

        app.stage.addChild( backgroundGraphics );
        app.stage.addChild( container );

        const earthTexture = await PIXI.Assets.load<PIXI.Texture>('/earthTransparentBackground.png');
        const moonTexture = await PIXI.Assets.load<PIXI.Texture>('/moonTransparentBackground.png');

        const earth = new PIXI.Sprite(earthTexture);
        earth.setSize( screen.width / 8 );
        earth.y = container.y / 2;
        earth.x = container.x / 2;
        container.addChild(earth);
        earth.anchor.set( 0.5, 0.5 );
        
        for( let i = 0; i < NUM_MOONS; i++ ) {
          const moon = new PIXI.Sprite(moonTexture);
          moon.setSize( screen.width / 10 / Math.round( Math.random() * 4 ) );
          moon.y = container.y + 150 + Math.round( Math.random() * 200);
          moon.x = container.x + 150 + Math.round( Math.random() * 200);
          container.addChild(moon);
          moon.anchor.set( 0.5, 0.5 );

          orbitingBodies.push( moon );
          velocityVectors.push( { 
            x: 1 + Math.round( Math.random() * 0.5 )
            , y: -1 + Math.round( Math.random() * 0.5 )
          } );
        }

        container.x = app.screen.width / 2 + (container.width / 2);
        container.y = app.screen.height / 2 + (container.height / 2);
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;
        
        // for( let i = 0; i < orbitingBodies.length; i ++ ) {
        //   lookAhead( 100, velocityVectors[i], orbitingBodies[i], earth, orbitPathGraphics ); 
        // } 

        app.ticker.add((time) =>
          { 
            for( let i = 0; i < orbitingBodies.length; i ++ ) {
              // lookAhead( 1000, velocityVectors[i], orbitingBodies[i], earth, orbitPathGraphics ); 
              calculateOrbit( velocityVectors[i], orbitingBodies[i], earth);
              orbitingBodies[i].rotation -= 0.005 * time.deltaTime;
            } 
            earth.rotation -= 0.01 * time.deltaTime;
        });
      }
    }

    applicationWrapper()

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [ pixiContainerRef, appRef ]);

  return <div ref={pixiContainerRef} className="h-screen"/>;
};

export default OrbitSim;

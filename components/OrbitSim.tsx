import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

const OrbitSim = () => {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null); // Ref for container
  const appRef = useRef<PIXI.Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ numMoons, setNumMoons ] = useState<number>(1);

  /* 
    CONSTANTS
  */
  const acceleration = { x: 0, y: 0 };
  const G = 1000; // Gravitational constant (adjust for realistic motion)
  const orbitingBodies: PIXI.Sprite[] = [];
  const velocityVectors: {x: number, y:number}[] = []
  const NUM_STARS = 200;
  const NUM_MOONS = numMoons;
  let runPhysics = true;
  let showVelocityVectors = false;
  let showOrbitTrails = true;

  const toggleRunPhysics = () => {
    runPhysics = !runPhysics;
    document.getElementById("pause-physics-checkbox").checked = (runPhysics) ? true: false;
  }
  const toggleShowVelocityVectors = () => {
    showVelocityVectors = !showVelocityVectors;
  }
  const toggleShowOrbitTrails = () => {
    showOrbitTrails = !showOrbitTrails;
  }

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

  const drawOrbitPaths = ( 
    nTimes: number
    , orbitVelocityVector: {x: number, y:number}
    , orbitingBody: PIXI.Sprite
    , fixedBody: PIXI.Sprite
    , pixiGraphics: PIXI.Graphics
  ) => {

    if( !showOrbitTrails ) return;

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
      }
      
      for( const point of projectedPoints ) {
        pixiGraphics.fill( '#ffffff' );
        pixiGraphics.circle( point.x, point.y, 1 );
      }
    }
  }

  const initializeUniverse = async ( 
    appContainer: PIXI.Container
    , backgroundGraphics: PIXI.Graphics 
    , orbitPathGraphics: PIXI.Graphics 
    , velocityVectorGraphics: PIXI.Graphics 
  ): Promise<PIXI.Sprite> => {
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

    const earthTexture = await PIXI.Assets.load<PIXI.Texture>('/orbit-sim/earthTransparentBackground.png');
    const moonTexture = await PIXI.Assets.load<PIXI.Texture>('/orbit-sim/moonTransparentBackground.png');

    const earth = new PIXI.Sprite(earthTexture);
    earth.setSize( screen.width / 8 );
    earth.y = appContainer.y / 2;
    earth.x = appContainer.x / 2;
    appContainer.addChild(earth);
    earth.anchor.set( 0.5, 0.5 );
    
    for( let i = 0; i < NUM_MOONS; i++ ) {
      const moon = new PIXI.Sprite(moonTexture);
      moon.setSize( screen.width / 10 / (Math.round( (Math.random() ) * 4 ) ) + 1);
      moon.y = appContainer.y + 150 + Math.round( Math.random() * 200);
      moon.x = appContainer.x + 150 + Math.round( Math.random() * 200);
      appContainer.addChild(moon);
      moon.anchor.set( 0.5, 0.5 );

      orbitingBodies.push( moon );
      velocityVectors.push( { 
        x: 1 + Math.round( Math.random() * 0.5 )
        , y: -1 + Math.round( Math.random() * 0.5 )
      } );
    }

    addMoonDragEffects( orbitPathGraphics, velocityVectorGraphics, earth );

    return earth;
  }

  const addMoonDragEffects = ( 
    orbitPathGraphics: PIXI.Graphics
    , velocityVectorGraphics: PIXI.Graphics
    , earth: PIXI.Sprite 
  ) => {
    if( appRef.current ) {

      let dragTarget: PIXI.Sprite | null = null;
      appRef.current.stage.hitArea = appRef.current.screen;
      appRef.current.stage.eventMode = 'static';

      for( const orbitingBody of orbitingBodies ) {

        orbitingBody.eventMode = 'static';
        orbitingBody.cursor = 'pointer';
        orbitingBody.on('pointerdown', (event) => {
          orbitPathGraphics.clear();
          toggleRunPhysics();
          dragTarget = orbitingBody;
          
          if (dragTarget) {
            dragTarget.parent.toLocal(event.global, undefined, dragTarget.position );
          }
        }, orbitingBody );
      
        appRef.current?.stage.on('pointermove', (event)=>{
          if (dragTarget) {
            orbitPathGraphics.clear();
            for( let i = 0; i < orbitingBodies.length; i++ ) {
              drawVelocityVectors( velocityVectorGraphics );
              drawOrbitPaths( 2000, velocityVectors[i], orbitingBodies[i], earth, orbitPathGraphics );
            }
            dragTarget.parent.toLocal(event.global, undefined, dragTarget.position );
          }
        });
      }

      appRef.current.stage.on('pointerup', () => {
        toggleRunPhysics();
        
        if (dragTarget)
          {
            dragTarget.alpha = 1;
            dragTarget = null;
          }
      });
    }
  }

  const drawVelocityVectors = ( velocityVectorGraphics: PIXI.Graphics ) => {
    velocityVectorGraphics.clear();
    
    if( showVelocityVectors ) {
      for( let i = 0; i < orbitingBodies.length; i++ ) {
        const velocityVector = velocityVectors[i];
  
        velocityVectorGraphics.moveTo( orbitingBodies[i].position.x, orbitingBodies[i].position.y );
        velocityVectorGraphics.stroke({ width: 3, color: 'green' });
        velocityVectorGraphics.lineTo( 
          orbitingBodies[i].x + velocityVector.x * 50
          , orbitingBodies[i].y + velocityVector.y * 50 
        );
      }
    }
  }

  useEffect( () => {
    const appReady = new Promise<PIXI.Application>((resolve) => {
      const app = new PIXI.Application();
      appRef.current = app;
      resolve(app);
    });
    
    const applicationWrapper = async () => {
      const app = await appReady;      
      await app.init({ background: '#000000', resizeTo: window });

      if( pixiContainerRef.current ) {
        /* 
          For some reason, the app is not destroying the canvas when the use effect re-renders.
          This is a temp fix until I figure it out :(
        */
        for ( const pixiContainerChild of pixiContainerRef.current.children ) {
          if( 
            pixiContainerChild.getAttribute('id') === 'pixi-canvas' 
            && pixiContainerChild.tagName === 'CANVAS'
          ) {
            pixiContainerChild.remove();
          }
        }
      }

      if (pixiContainerRef.current && appRef.current) {

        canvasRef.current = appRef.current.canvas;
        canvasRef.current.setAttribute('id', 'pixi-canvas' );

        const container = new PIXI.Container({label:'universe'});
        const orbitPathGraphics = new PIXI.Graphics({label:'orbitPathGraphics'});
        const velocityVectorGraphics = new PIXI.Graphics();
        const backgroundGraphics = new PIXI.Graphics();

        
        app.stage.addChild( backgroundGraphics );
        app.stage.addChild( container );
        container.addChild( velocityVectorGraphics );

        const earth = await initializeUniverse( container, backgroundGraphics, orbitPathGraphics, velocityVectorGraphics );

        container.x = app.screen.width / 2 + (container.width / 2);
        container.y = app.screen.height / 2 + (container.height / 2);
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;
        
        for( let i = 0; i < orbitingBodies.length; i ++ ) {
            drawOrbitPaths( 2000, velocityVectors[i], orbitingBodies[i], earth, orbitPathGraphics );
        }

        app.ticker.add((time) =>
          {
            drawVelocityVectors( velocityVectorGraphics );
            for( let i = 0; i < orbitingBodies.length; i ++ ) {
              if( runPhysics ) {
                calculateOrbit( velocityVectors[i], orbitingBodies[i], earth); 
                orbitingBodies[i].rotation -= 0.005 * time.deltaTime;
              }
            } 
            earth.rotation -= 0.01 * time.deltaTime;
        });
      }

      if( pixiContainerRef.current ) {
        /* 
          When loading a PIXI Canvas in NextJS, there's a bug that causes two canvases to render.
          We fix this by using a canvas ref and deleting the Canvas generated by PIXI.
          We keep the canvas manually appended to the Pixi container
        */
        for ( const pixiContainerChild of pixiContainerRef.current.children ) {
          if( 
            pixiContainerChild.getAttribute('id') !== 'pixi-canvas' 
            && pixiContainerChild.tagName === 'CANVAS'
          ) {
            pixiContainerChild.remove();
          }
        }
        pixiContainerRef.current.appendChild(app.canvas);
      }

      return () => {
        if (appRef.current) {
          appRef.current.destroy(true, { children: true });
          appRef.current = null;
        }
        if (pixiContainerRef.current) {
          pixiContainerRef.current.remove();
        }
        if (canvasRef.current) {
          canvasRef.current.remove();
        }
      };
    }

    applicationWrapper()
  }, [ pixiContainerRef, appRef, numMoons, setNumMoons, canvasRef, showOrbitTrails, showVelocityVectors ]);

  return (
    <div ref={pixiContainerRef} className="h-screen">
      <aside id="default-sidebar" className="fixed right-0 top-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-800">
            <ul className="space-y-2 font-medium bg-gray-900">
              <li>
                  <a href="#" className="flex items-center p-2 text-white rounded-lg hover:bg-black group">
                    <input 
                      type="checkbox" 
                      id="pause-physics-checkbox"
                      onChange={() => {toggleRunPhysics()}}
                    >
                    </input><span className="ms-3">Pause Physics</span>
                  </a>
              </li>
              <li>
                  <a href="#" className="flex items-center p-2 text-white rounded-lg hover:bg-black group">
                    <input 
                      type="checkbox" 
                      id="orbit-trails-checkbox"
                      onChange={()=>{ toggleShowOrbitTrails()}}
                    ></input><span className="ms-3">Show Orbit Trails</span>
                  </a>
              </li>
              <li>
                  <a href="#" className="flex items-center p-2 text-white rounded-lg hover:bg-black group">
                    <input 
                      type="checkbox"
                      id="velocity-vectors-checkbox"
                      onChange={()=>{ toggleShowVelocityVectors();}}
                    ></input><span className="ms-3">Show Velocity Vectors</span>
                  </a>
              </li>
              <li>
                  <a href="#" className="flex items-center p-2 text-white rounded-lg hover:bg-black group">
                    <input
                      type="number" 
                      id="num-moons" 
                      className="text-black text-center" 
                      max={10} 
                      min={1} 
                      defaultValue={NUM_MOONS}
                      onChange={(event)=>{ setNumMoons( Number(event.currentTarget.value) )}}
                    >
                      </input>
                    <span className="ms-3">Moon Count</span>
                  </a>
              </li>
            </ul>
        </div>
      </aside>
    </div>
  );
};

export default OrbitSim;

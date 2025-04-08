import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

import { generateBgTexture, generateTerrain, generateTilemap, getColor } from "@/lib/perlinNoise/perlinNoise";

const Ecosystem = () => {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null); // Ref for container
  const appRef = useRef<PIXI.Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [ scale, setScale ] = useState<number>( 10 );

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

        const tilemapGraphics = new PIXI.Graphics();
        appRef.current.stage.addChild(tilemapGraphics);
        
        generateBgTexture(appRef, tilemapGraphics, scale);

        app.ticker.add(() =>
          {
            /* game loop */
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

  }, [ pixiContainerRef, appRef, canvasRef, scale ]);

  return (
    <div ref={pixiContainerRef} className="h-screen">
      <aside id="default-sidebar" className="fixed right-0 top-50 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto bg-transparent">
          <div className="control-panel bg-transparent">
            <h2 className="text-black">Procedural Generation</h2>
            <div className="slider-group">
              <input
                type="range" 
                min="2"
                max="20"
                step="1"
                onChange={(newScale)=> { setScale(Number(newScale.target.value)) }}
                ></input>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Ecosystem;

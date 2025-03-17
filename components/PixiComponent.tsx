import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const PixiComponent = () => {
  const pixiContainerRef = useRef(null);

  useEffect(() => {
    if (pixiContainerRef.current) {
        // Create the PixiJS application
        const app = new PIXI.Application({
          width: 800, // Set the desired width
          height: 600, // Set the desired height
          backgroundColor: 0x1099bb,
        });
        appRef.current = app;
  
        // Append the canvas to the container
        pixiContainerRef.current.appendChild(app.view);
  
        // Add a basic PixiJS graphic (e.g., a rectangle)
        const rectangle = new PIXI.Graphics();
        rectangle.beginFill(0xde3249);
        rectangle.drawRect(50, 50, 100, 100);
        rectangle.endFill();
        app.stage.addChild(rectangle);
  
        // Cleanup function
        return () => {
          app.destroy(true, { children: true });
          pixiContainerRef.current?.removeChild(app.view);
        };
      }
  }, []);

  return <div ref={pixiContainerRef} />;
};

export default PixiComponent;

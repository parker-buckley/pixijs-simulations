import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const PixiComponent = () => {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null); // Ref for container

  useEffect( () => {
    const applicationWrapper = async () => {
      // Ensure the container ref exists
      const app = new PIXI.Application();
      if (pixiContainerRef.current) {

        await app.init({ background: '#1099bb', resizeTo: window, });
        pixiContainerRef.current.appendChild(app.canvas);

        const container = new PIXI.Container();
        app.stage.addChild(container);

        // Load the bunny texture
        const earthTexture = await PIXI.Assets.load<PIXI.Texture>('/earthTransparentBackground.png');
        const moonTexture = await PIXI.Assets.load<PIXI.Texture>('/moonTransparentBackground.png');
        const earth = new PIXI.Sprite(earthTexture);
        const moon = new PIXI.Sprite(moonTexture);
        
        earth.setSize( screen.width / 8 );
        moon.setSize( screen.width / 12 );

        
        earth.y = container.y / 2;
        earth.x = container.x / 2;
        container.addChild(earth);

        moon.y = container.y + 200;
        moon.x = container.x + 200;
        container.addChild(moon);

        earth.anchor.set( 0.5, 0.5 );
        moon.anchor.set( 0.5, 0.5 );

        // Move the container to the center
        container.x = app.screen.width / 2 + (container.width / 2);
        container.y = app.screen.height / 2 + (container.height / 2);

        // Center the bunny sprites in local container coordinates
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;

        // Initial velocity and acceleration
        const velocity = { x: 1.5, y: -1.5 };
        const acceleration = { x: 0, y: 0 };
        const G = 1000; // Gravitational constant (adjust for realistic motion)

        console.log(earth.x);
        console.log(earth.y);
        console.log(moon.x);
        console.log(moon.y);

        // Listen for animate update
        app.ticker.add((time) =>
        {
            // Compute vector to Earth
            const dx = earth.x - moon.x;
            const dy = earth.y - moon.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Normalize vector and compute gravitational force
            const force = G / (distance * distance);
            const ax = (dx / distance) * force;
            const ay = (dy / distance) * force;

            // Update acceleration
            acceleration.x = ax;
            acceleration.y = ay;

            // Update velocity
            velocity.x += acceleration.x;
            velocity.y += acceleration.y;

            // Update moon position
            moon.x += velocity.x;
            moon.y += velocity.y;

            // Continuously rotate the container!
            // * use delta to create frame-independent transform *
            earth.rotation -= 0.01 * time.deltaTime;
            moon.rotation -= 0.005 * time.deltaTime;
        });
      }
    }

    applicationWrapper()
  }, []);

  return <div ref={pixiContainerRef} className="h-screen"/>;
};

export default PixiComponent;

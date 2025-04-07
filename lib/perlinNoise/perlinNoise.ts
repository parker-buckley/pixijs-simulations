import * as PIXI from 'pixi.js'
import { Vector } from "@/components/types/global";

export const generateTerrain = () => {
    return true;
}

function fade(t: number): number {
    // Fade function to smooth the transition between values
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
    // Linear interpolation between a and b
    return a + t * (b - a);
}

function grad(hash: number, p: {x: number, y: number}): number {
    // Random gradient vector, simplified for 2D
    const h = hash & 15;
    const u = h < 8 ? p.x : p.y;
    const v = h < 4 ? p.y : h === 12 || h === 14 ? p.x : 0;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
}

function noise(x: number, y: number, octaves: number = 1, persistence: number = 0.5, p: number[]): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxAmplitude = 0;

    for (let i = 0; i < octaves; i++) {
        const X = Math.floor(x * frequency) & 255;
        const Y = Math.floor(y * frequency) & 255;
        
        const xf = x * frequency - Math.floor(x * frequency);
        const yf = y * frequency - Math.floor(y * frequency);
        
        const u = fade(xf);
        const v = fade(yf);
        
        const aa = p[p[X] + Y];
        const ab = p[p[X] + Y + 1];
        const ba = p[p[X + 1] + Y];
        const bb = p[p[X + 1] + Y + 1];
        
        const gAA = grad(aa, {x: xf, y: yf});
        const gAB = grad(ab, {x: xf, y: yf - 1});
        const gBA = grad(ba, {x: xf - 1, y: yf});
        const gBB = grad(bb, {x: xf - 1, y: yf - 1});
        
        const x1 = lerp(gAA, gBA, u);
        const x2 = lerp(gAB, gBB, u);

        total += lerp(x1, x2, v) * amplitude;

        maxAmplitude += amplitude;

        frequency *= 2;
        amplitude *= persistence;
    }

    return total / maxAmplitude;
}

const p: number[] = Array(512).fill(0).map((_, i) => i); // Permutation table (size 512)
for (let i = 0; i < 256; i++) {
    const j = Math.floor(Math.random() * 256);
    [p[i], p[j]] = [p[j], p[i]];
    p[i + 256] = p[i];  // Duplicate the values for ease of use with values larger than 255
}

export function generateTilemap(m: number, n: number, scale: number, octaves: number = 4, persistence: number = 0.5): number[][] {
    const tilemap: number[][] = [];


    for (let i = 0; i < m; i++) {
        tilemap[i] = [];
        for (let j = 0; j < n; j++) {
            // Scale the x, y coordinates to zoom in/out on the noise
            const noiseValue = noise(i / scale, j / scale, octaves, persistence, p);
            
            // Map the noise value to a tile (e.g., 0 for water, 1 for land, etc.)
            const tileValue = noiseValue; // Just an example threshold
            tilemap[i][j] = tileValue;
        }
    }

    return tilemap;
}


function getColor(value:number) {
    let color;
  
    switch (true) {
      // Dark Blue (Most Negative Values)
      case (value <= -0.8):
        color = "#00008B"; // Dark Blue
        break;
      case (value <= -0.6):
        color = "#0000A0";
        break;
      case (value <= -0.4):
        color = "#0000B3";
        break;
  
      // Light Blue
      case (value <= -0.2):
        color = "#1A1AFF"; // Light Blue
        break;
      case (value <= 0):
        color = "#4D4DFF"; // Lighter Blue
  
      // Light Brown (Near Zero)
      case (value <= 0.2):
        color = "#D9B38C"; // Light Brown
        break;
      case (value <= 0.4):
        color = "#B5A17D"; // Lighter Brown
  
      // Dark Brown
      case (value <= 0.6):
        color = "#6E5D47"; // Darker Brown
        break;
      case (value <= 0.8):
        color = "#4A4C32"; // Dark Brown
  
      // Light Green
      case (value <= 0.9):
        color = "#2D5122"; // Light Green
        break;
  
      // Dark Green (Most Positive Values)
      case (value >= 1):
        color = "#003C09"; // Dark Green
        break;
      default:
        color = "#FFFFFF"; // Default if no match
        break;
    }
  
    return color;
  }
  

export const generateBgTexture = (
    appRef: React.MutableRefObject<PIXI.Application<PIXI.Renderer> | null>
    , tilemapGraphics: PIXI.Graphics
    , scale: number
) => {

    if( !appRef.current ) return; 
    const app = appRef.current;

    const horizontalTileCount = 100;
    const tileWidth = app.screen.width / horizontalTileCount;
    const tileHeight = tileWidth
    const verticalTileCount = Math.ceil( app.screen.height / tileHeight )

    const tilemapMatrix = generateTilemap( verticalTileCount , horizontalTileCount , scale );

    for( let i = 0; i < verticalTileCount; i++ ) {
        for( let j = 0; j < horizontalTileCount; j++ ) {
            const hexCode = getColor(tilemapMatrix[i][j]);

            if( tilemapMatrix[i][j] === 1 ) {
                tilemapGraphics.rect( j*tileWidth, i*tileHeight, tileWidth, tileHeight );
                tilemapGraphics.fill(hexCode);
                tilemapGraphics.stroke();
            } else {
                tilemapGraphics.rect( j*tileWidth, i*tileHeight, tileWidth, tileHeight );
                tilemapGraphics.fill(hexCode);
                tilemapGraphics.stroke();
            }
        }
    }
}
  
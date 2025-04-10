import { Sprite, Texture, Assets, Application, Renderer, Point } from 'pixi.js'
import { SpriteMatrix, TileType, TileTypeTextureMap } from '@/components/types/ecosystem/ecosystem.types';


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

export function generatePerlinNoiseMatrix(m: number, n: number, scale: number, octaves: number = 4, persistence: number = 0.5): number[][] {
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


function getTileType(value:number): TileType {
  let tileType: TileType;

  switch (true) {
    // Dark Blue (Most Negative Values)
    case (value <= -0.5):
      tileType = TileType.DeepWater
      break;
    case (value <= -0.4):
      tileType = TileType.DeepWater
      break;
    case (value <= -0.3):
      tileType = TileType.DeepWater
      break;
    case (value <= -0.2):
      tileType = TileType.ShallowWater
      break;
    case (value <= -0.1):
      tileType = TileType.ShallowWater
    case (value <= 0.1):
      tileType = TileType.Beach
      break;
    case (value <= 0.2):
      tileType = TileType.Grass
      break;
    case (value <= 0.3):
      tileType = TileType.Grass
      break;
    case (value <= 0.4):
      tileType = TileType.Grass
      break;
    case (value <= 0.5):
      tileType = TileType.Forest
      break;

    // Dark Green (Most Positive Values)
    case (value >= 0.5):
      tileType = TileType.Forest
      break;
    default:
      tileType = TileType.DenseForest
      break;
  }

  return tileType;
}
  
const loadTileTypeTextureMap = async (): Promise<TileTypeTextureMap> => {
  const tileSetBasePath = '/ecosystem/unknown-horizons-tiles';
  
  const textures = await Promise.all( [
    Assets.load<Texture>(`${tileSetBasePath}/deep0/straight/0/0.png`)
    , Assets.load<Texture>(`${tileSetBasePath}/shallow0/straight/0/0.png`)
    , Assets.load<Texture>(`${tileSetBasePath}/beach0/straight/0/0.png`)
    , Assets.load<Texture>(`${tileSetBasePath}/grass0/straight/0/0.png`)
    , Assets.load<Texture>(`${tileSetBasePath}/grass0/straight/0/0.png`)
    , Assets.load<Texture>(`${tileSetBasePath}/grass0/straight/0/0.png`)
  ]);

  return {
    [TileType.DeepWater]: textures[0] 
    , [TileType.ShallowWater]: textures[1] 
    , [TileType.Beach]: textures[2] 
    , [TileType.Grass]: textures[3] 
    , [TileType.Forest]: textures[4] 
    , [TileType.DenseForest]: textures[5]
  }
}

export const generateSpriteMatrix = async (
    appRef: React.MutableRefObject<Application<Renderer> | null>
    , scale: number
): Promise<SpriteMatrix> => {

  if( !appRef.current ) return []; 
  
  const spriteMatrix: SpriteMatrix = [];
  const app = appRef.current;

  const tileTypeTextureMap = await loadTileTypeTextureMap();

  const horizontalTileCount = 50;
  const tileWidth = app.screen.width / horizontalTileCount;
  const tileHeight = tileWidth;
  const verticalTileCount = Math.ceil( app.screen.height / tileHeight );

  const perlinNoiseMatrix = generatePerlinNoiseMatrix( verticalTileCount , horizontalTileCount , scale );

  for( let i = 0; i < verticalTileCount; i++ ) {
    const row: {tileType: TileType, sprite: Sprite}[] = [];
    for( let j = 0; j < horizontalTileCount; j++ ) {
      const tileType = getTileType(perlinNoiseMatrix[i][j]);
      const sprite = new Sprite(tileTypeTextureMap[tileType]);

      app.stage.addChild( sprite );
      sprite.position = new Point( j * tileWidth, i * tileHeight );
      sprite.width = tileWidth;
      sprite.height = tileHeight;
      row.push({tileType, sprite});
    }
    spriteMatrix.push( row );
  }

  return spriteMatrix;
}
  
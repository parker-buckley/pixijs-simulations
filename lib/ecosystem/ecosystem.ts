import { Sprite, Texture, Assets, Application, Renderer, Point } from 'pixi.js'
import { BlendTextures, PlantSpriteMatrix, SpriteMatrix, TileType, TileTypeTextureMap } from '@/components/types/ecosystem/ecosystem.types';


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

/* 
  The permunation matrix is effectively the seed for the perlin noise.
  Moving this to a const ensures that, regardless of the perlin noise octaves or other configurations, the seed data will remain the same between generations.
  This will allow us to generate different "flavors" of the tilemap without changing the overall map layout.
*/
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
    case (value <= -0.2):
      tileType = TileType.DeepWater
      break;
    case (value <= -0.1):
      tileType = TileType.ShallowWater
      break;
    case (value <= -0.05):
      tileType = TileType.Beach
    case (value <= 0.00):
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
  
  const deepWaterTexture = await Assets.load<Texture>(`${tileSetBasePath}/deep0/straight/0/0.png`);
  const shallowWaterTexture = await Assets.load<Texture>(`${tileSetBasePath}/shallow0/straight/0/0.png`);
  const beachTexture = await Assets.load<Texture>(`${tileSetBasePath}/beach0/straight/0/0.png`);
  const grassTexture = await Assets.load<Texture>(`${tileSetBasePath}/grass0/straight/0/0.png`);

  return {
    [TileType.DeepWater]: deepWaterTexture
    , [TileType.ShallowWater]: shallowWaterTexture
    , [TileType.Beach]: beachTexture
    , [TileType.Grass]: grassTexture
    , [TileType.Forest]: grassTexture
    , [TileType.DenseForest]: grassTexture
  }
}

export const generatePlantSpriteMatrix = async (
  appRef: React.MutableRefObject<Application<Renderer> | null>
  , horizontalTileCount: number
  , verticalTileCount: number
  , perlinNoiseMatrix: number[][]
) => {

  if( !appRef.current ) return []; 

  const grassTextures = await Promise.all([
    Assets.load<Texture>(`/ecosystem/plant-assets/grasses/grasses01.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/grasses/grasses02.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/grasses/grasses03.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/grasses/grasses04.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/grasses/grasses05.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/weeds/weed01.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/weeds/weed02.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/weeds/weed03.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/weeds/weed04.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/weeds/weed05.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/weeds/weed06.png`)
  ]);
  const shrubTextures = await Promise.all([
    Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub1-01.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub1-02.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub1-03.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub1-04.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub1-05.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub2-01.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub2-02.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub2-03.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub2-04.png')
    , Assets.load<Texture>('/ecosystem/plant-assets/shrubs/shrub2-05.png')
  ]);
  const treeTextures = await Promise.all([
    Assets.load<Texture>(`/ecosystem/plant-assets/trees/pine-none01.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/trees/pine-none02.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/trees/pine-none03.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/trees/pine-none04.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/trees/pine-none05.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/trees/pine-none06.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/trees/pine-none07.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/trees/pine-none08.png`)
  ]);
  const cactusTextures = await Promise.all([
    Assets.load<Texture>(`/ecosystem/plant-assets/cacti/cactus01.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/cacti/cactus02.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/cacti/cactus03.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/cacti/cactus04.png`)
  ]);
  const waterPlantTextures = await Promise.all([
    Assets.load<Texture>(`/ecosystem/plant-assets/water-plants/bamboo01.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/water-plants/bamboo02.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/water-plants/bamboo03.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/water-plants/bamboo04.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/water-plants/bamboo05.png`)
    , Assets.load<Texture>(`/ecosystem/plant-assets/water-plants/bamboo06.png`)
  ]);
  
  const plantMatrix: PlantSpriteMatrix = [];
  const app = appRef.current;

  const tileWidth = app.screen.width / horizontalTileCount;
  const tileHeight = tileWidth;

  for( let i = 0; i < verticalTileCount; i++ ) {
    const row: {tileType: TileType, sprite: Sprite | undefined}[] = [];
    for( let j = 0; j < horizontalTileCount; j++ ) {
      const tileType = getTileType(perlinNoiseMatrix[i][j]);

      let plantSprite: Sprite | undefined;

      if( tileType === TileType.Forest ) {
        if(Math.random() < 0.25 ){
          const treeIndex = Math.round( Math.random() * (treeTextures.length - 1) );
          plantSprite = new Sprite(treeTextures[treeIndex]);

          app.stage.addChild( plantSprite );
          
        }
      }
      if( tileType === TileType.Grass ) {
        if(Math.random() < 0.5 ){
          const grassIndex = Math.round( Math.random() * (grassTextures.length - 1) );
          plantSprite = new Sprite(grassTextures[grassIndex]);
          app.stage.addChild( plantSprite );
          
        }
        if(Math.random() < 0.01 ){
          const shrubIndex = Math.round( Math.random() * (shrubTextures.length - 1) );
          plantSprite = new Sprite(shrubTextures[shrubIndex]);
          app.stage.addChild( plantSprite );
          
        }
      }
      if( tileType === TileType.Beach ) {
        if(Math.random() < 0.01 ){
          const cactusIndex = Math.round( Math.random() * (cactusTextures.length - 1) );
          plantSprite = new Sprite(cactusTextures[cactusIndex]);
          app.stage.addChild( plantSprite );
          
        }
      }
      if( tileType === TileType.ShallowWater ) {
        if(Math.random() < 0.1 ){
          const waterPlantIndex = Math.round( Math.random() * (waterPlantTextures.length - 1) );
          plantSprite = new Sprite(waterPlantTextures[waterPlantIndex]);
          app.stage.addChild( plantSprite );
        }
      }

      if( plantSprite ) {
        plantSprite.position = new Point( j * tileWidth, i * tileHeight );
        plantSprite.anchor.set( 0.5, 1 );
        plantSprite.zIndex = 1000;
      }

      row.push({tileType, sprite: plantSprite});
    }
    plantMatrix.push( row );
  }
}

export const generateBackgroundSpriteMatrix = async (
    appRef: React.MutableRefObject<Application<Renderer> | null>
    , horizontalTileCount: number
    , verticalTileCount: number
    , perlinNoiseMatrix: number[][]
): Promise<SpriteMatrix> => {

  if( !appRef.current ) return []; 
  
  const spriteMatrix: SpriteMatrix = [];
  const app = appRef.current;

  const tileTypeTextureMap = await loadTileTypeTextureMap();
  const tileWidth = app.screen.width / horizontalTileCount;
  const tileHeight = tileWidth;

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
  
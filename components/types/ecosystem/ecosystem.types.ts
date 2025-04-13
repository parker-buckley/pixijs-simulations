import { Texture, Sprite } from 'pixi.js'

export enum TileType {
    DeepWater = 'deep_water'
    , ShallowWater = 'shallow_water'
    , Beach = 'beach'
    , Grass = 'grass'
    , Forest = 'forest'
    , DenseForest = 'dense_forest'
}

export type TileTypeTextureMap = Record<TileType, Texture>;

export type SpriteMatrix = { tileType: TileType, sprite: Sprite }[][];

export type PlantSpriteMatrix = { tileType: TileType, sprite: Sprite | undefined }[][];
"use client"

import React from 'react'

export default function Nav(
  { isOrbitSimEnabled
    , setIsOrbitSimEnabled 
    , isPlinkoEnabled
    , setIsPlinkoEnabled 
    , isFlockingEnabled
    , setIsFlockingEnabled 
    , isPerlinNoiseEnabled
    , setIsPerlinNoiseEnabled 
  }: {
    isOrbitSimEnabled: boolean
    , setIsOrbitSimEnabled: React.Dispatch<React.SetStateAction<boolean>>
    , isPlinkoEnabled: boolean
    , setIsPlinkoEnabled: React.Dispatch<React.SetStateAction<boolean>>
    , isFlockingEnabled: boolean
    , setIsFlockingEnabled: React.Dispatch<React.SetStateAction<boolean>>
    , isPerlinNoiseEnabled: boolean
    , setIsPerlinNoiseEnabled: React.Dispatch<React.SetStateAction<boolean>>
  }
) {
    /* 
      Sim Ideas: 
        1. Ants: Food source, tracers, and wandering mechanics. Basic animations?
        6. Fire Sim
        7. Ecosystem Sim ( Perlin Noise -> Procedural Tile Gen -> Plant SpriteSheet )
    */

    return (
      <div className="w-full flex-grow flex-row lg:flex items-center lg:w-auto hidden">
        <div className="text-base xl:mx-8">
            <button 
                onClick={() => {
                  setIsOrbitSimEnabled(!isOrbitSimEnabled);
                  if(isFlockingEnabled) setIsFlockingEnabled(!isFlockingEnabled);
                  if(isPlinkoEnabled) setIsPlinkoEnabled(!isPlinkoEnabled);
                  if(isPerlinNoiseEnabled) setIsPlinkoEnabled(!isPerlinNoiseEnabled);
                }}
                disabled={isOrbitSimEnabled}
                className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                Orbit Sim
            </button>
            <button 
                onClick={() => {
                  setIsPlinkoEnabled(!isPlinkoEnabled);
                  if(isFlockingEnabled) setIsFlockingEnabled(!isFlockingEnabled);
                  if(isOrbitSimEnabled) setIsOrbitSimEnabled(!isOrbitSimEnabled);
                  if(isPerlinNoiseEnabled) setIsPerlinNoiseEnabled(!isPerlinNoiseEnabled);
                }}
                disabled={isPlinkoEnabled}
                className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                Plinko
            </button>
            <button 
                onClick={() => {
                  setIsFlockingEnabled(!isFlockingEnabled);
                  if(isOrbitSimEnabled) setIsOrbitSimEnabled(!isOrbitSimEnabled);
                  if(isPlinkoEnabled) setIsPlinkoEnabled(!isPlinkoEnabled);
                  if(isPerlinNoiseEnabled) setIsPerlinNoiseEnabled(!isPerlinNoiseEnabled);
                }}
                disabled={isFlockingEnabled}
                className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                Flocking
            </button>
            <button 
                onClick={() => {
                  setIsPerlinNoiseEnabled(!isPerlinNoiseEnabled);
                  if(isFlockingEnabled) setIsFlockingEnabled(!isFlockingEnabled);
                  if(isOrbitSimEnabled) setIsOrbitSimEnabled(!isOrbitSimEnabled);
                  if(isPlinkoEnabled) setIsPlinkoEnabled(!isPlinkoEnabled);
                }}
                disabled={isPerlinNoiseEnabled}
                className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                Perlin Noise
            </button>
        </div>
      </div>
    )
  }
"use client"

import React from 'react'

export default function Nav(
  { isOrbitSimEnabled
    , setIsOrbitSimEnabled 
    , isPlinkoEnabled
    , setIsPlinkoEnabled 
    , isFlockingEnabled
    , setIsFlockingEnabled 
  }: {
    isOrbitSimEnabled: boolean
    , setIsOrbitSimEnabled: React.Dispatch<React.SetStateAction<boolean>>
    , isPlinkoEnabled: boolean
    , setIsPlinkoEnabled: React.Dispatch<React.SetStateAction<boolean>>
    , isFlockingEnabled: boolean
    , setIsFlockingEnabled: React.Dispatch<React.SetStateAction<boolean>>
  }
) {
    /* 
      Sim Ideas: 
        1. Ants: Food source, tracers, and wandering mechanics. Basic animations?
        2. Game of Life!
        3. Procedural Rocket Jump Minigame
        5. Boids Flocking
        6. Fire Sim
        7. Ecosystem Sim
        9. Maze Generator
    */

    return (
      <div className="w-full flex-grow flex-row lg:flex items-center lg:w-auto hidden">
        <div className="text-base mt-2 xl:mx-8">
            <button 
                onClick={() => {
                  if(isFlockingEnabled) setIsFlockingEnabled(!isFlockingEnabled);
                  setIsOrbitSimEnabled(!isOrbitSimEnabled);
                  if(isPlinkoEnabled) setIsPlinkoEnabled(!isPlinkoEnabled);
                }}
                disabled={isOrbitSimEnabled}
                className="block lg:inline-block text-md font-bold sm:hover:bg-transparent rounded-lg m-1">
                Orbit Sim
            </button>
            <button 
                onClick={() => {
                  if(isFlockingEnabled) setIsFlockingEnabled(!isFlockingEnabled);
                  if(isOrbitSimEnabled) setIsOrbitSimEnabled(!isOrbitSimEnabled);
                  setIsPlinkoEnabled(!isPlinkoEnabled);
                }}
                disabled={isPlinkoEnabled}
                className="block lg:inline-block text-md font-bold sm:hover:bg-transparent rounded-lg m-1">
                Plinko
            </button>
            <button 
                onClick={() => {
                  setIsFlockingEnabled(!isFlockingEnabled);
                  if(isOrbitSimEnabled) setIsOrbitSimEnabled(!isOrbitSimEnabled);
                  if(isPlinkoEnabled) setIsPlinkoEnabled(!isPlinkoEnabled);
                }}
                disabled={isFlockingEnabled}
                className="block lg:inline-block text-md font-bold sm:hover:bg-transparent rounded-lg m-1">
                Flocking
            </button>
        </div>
      </div>
    )
  }
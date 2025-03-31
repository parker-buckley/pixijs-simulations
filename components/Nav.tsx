"use client"

import React from 'react'

export default function Nav(
  { isOrbitSimEnabled
    , setIsOrbitSimEnabled 
    , isPlinkoEnabled
    , setIsPlinkoEnabled 
  }: {
    isOrbitSimEnabled: boolean
    , setIsOrbitSimEnabled: React.Dispatch<React.SetStateAction<boolean>>
    , isPlinkoEnabled: boolean
    , setIsPlinkoEnabled: React.Dispatch<React.SetStateAction<boolean>>
  }
) {
    /* 
      Sim Ideas: 
        1. Orbital Mechanics:  Sliders for num stars, gravity constant, num moons, and initial velocity / vector
        2. Ants: Food source, tracers, and wandering mechanics. Basic animations?
        3. Game of Life!
        4. Procedural Rocket Jump Minigame
        5. Traffic Sim
        6. Boids Flocking
        7. Fire Sim
        8. Ecosystem Sim
        9. Maze Generator
        10. Tree generator
    */

    return (
      <div className="w-full flex-grow flex-row lg:flex items-center lg:w-auto hidden">
        <div className="text-base mt-2 xl:mx-8">
            <button 
                onClick={() => {
                  setIsOrbitSimEnabled(!isOrbitSimEnabled);
                  setIsPlinkoEnabled(!isPlinkoEnabled);
                }}
                disabled={isOrbitSimEnabled}
                className="block lg:inline-block text-md font-bold sm:hover:bg-transparent rounded-lg m-1">
                Orbit Sim
            </button>
            <button 
                onClick={() => {
                  setIsPlinkoEnabled(!isPlinkoEnabled);
                  setIsOrbitSimEnabled(!isOrbitSimEnabled);
                }}
                disabled={isPlinkoEnabled}
                className="block lg:inline-block text-md font-bold sm:hover:bg-transparent rounded-lg m-1">
                Plinko
            </button>
        </div>
      </div>
    )
  }
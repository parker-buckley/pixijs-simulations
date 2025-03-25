"use client"

import React from 'react'

export default function Nav(
  { isOrbitSimEnabled, setIsOrbitSimEnabled }
  : {isOrbitSimEnabled: boolean, setIsOrbitSimEnabled: React.Dispatch<React.SetStateAction<boolean>>}
) {
    return (
      <div className="w-full flex-grow flex-row lg:flex items-center lg:w-auto hidden">
        <div className="text-sm mt-2 xl:mx-8">
            <button 
                onClick={() => setIsOrbitSimEnabled(!isOrbitSimEnabled)}
                disabled={isOrbitSimEnabled}
                className="block lg:inline-block text-md font-bold sm:hover:bg-transparent rounded-lg">
                Orbit Sim
            </button>
        </div>
      </div>
    )
  }
"use client"

import Link from 'next/link'
import React from 'react'

export default function Nav() {
    /* 
      Sim Ideas: 
        1. Ants: Food source, tracers, and wandering mechanics. Basic animations?
        6. Fire Sim
        7. Ecosystem Sim ( Perlin Noise -> Procedural Tile Gen -> Plant SpriteSheet )
    */

    return (
      <div className="w-full flex-grow flex-row lg:flex items-center lg:w-auto hidden">
        <div className="text-base xl:mx-8">
            <Link href={'/orbit-sim'}>
              <button 
                  className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                  Planetary Orbits
              </button>
            </Link>
            <Link href={'/flocking'}>
              <button 
                  className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                  Flocking
              </button>
            </Link>
            <Link href={'/plinko'}>
              <button 
                  className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                  Orbit Sim
              </button>
            </Link>
            <Link href={'/perlin-noise'}>
              <button 
                  className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                  Perlin Noise
              </button>
            </Link>
            <Link href={'/ecosystem'}>
              <button 
                  className="block lg:inline-block text-md font-bold m-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                  Ecosystem Sim
              </button>
            </Link>
        </div>
      </div>
    )
  }
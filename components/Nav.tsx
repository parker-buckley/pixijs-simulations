"use client"

import React from 'react'

export default function Nav() {
    return (
      <div className="w-full flex-grow flex-row lg:flex items-center lg:w-auto hidden">
        <div className="text-sm mt-2 xl:mx-8">
            <a href="#home"
                className="block lg:inline-block text-md font-bold sm:hover:bg-transparent rounded-lg">
                HOME
            </a>
        </div>
      </div>
    )
  }
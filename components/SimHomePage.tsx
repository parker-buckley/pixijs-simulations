"use client"

import React from 'react'
import PixiComponent from './PixiComponent'

export default function SimHomePage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-1 p-4 flex flex-col">
        <PixiComponent></PixiComponent>
      </div>
    </div>
  )
}
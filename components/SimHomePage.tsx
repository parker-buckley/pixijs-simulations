"use client"

import React, { useState } from 'react'
import PixiComponent from './PixiComponent'
import Nav from './Nav'

export default function SimHomePage() {
  
  const [ isOrbitSimEnabled, setIsOrbitSimEnabled ] = useState<boolean>( true );

  return (
    <div className="flex-row h-screen bg-background">
        <Nav isOrbitSimEnabled={isOrbitSimEnabled} setIsOrbitSimEnabled={setIsOrbitSimEnabled}></Nav>
        { isOrbitSimEnabled && <PixiComponent></PixiComponent>}
    </div>
  )
}
"use client"

import React, { useState } from 'react'
import OrbitSim from './OrbitSim'
import Nav from './Nav'

export default function SimHomePage() {
  
  const [ isOrbitSimEnabled, setIsOrbitSimEnabled ] = useState<boolean>( true );

  return (
    <div className="flex-row h-screen bg-background">
        <Nav isOrbitSimEnabled={isOrbitSimEnabled} setIsOrbitSimEnabled={setIsOrbitSimEnabled}></Nav>
        { isOrbitSimEnabled && <OrbitSim></OrbitSim>}
    </div>
  )
}
"use client"

import React, { useState } from 'react'
import OrbitSim from './OrbitSim'
import Plinko from './Plinko'
import Flocking from './Flocking'
import Nav from './Nav'

export default function SimHomePage() {
  
  const [ isOrbitSimEnabled, setIsOrbitSimEnabled ] = useState<boolean>( false );
  const [ isPlinkoEnabled, setIsPlinkoEnabled ] = useState<boolean>( false );
  const [ isFlockingEnabled, setIsFlockingEnabled ] = useState<boolean>( true );

  return (
    <div className="flex-row h-screen bg-background">
        <Nav 
          isOrbitSimEnabled={isOrbitSimEnabled} 
          setIsOrbitSimEnabled={setIsOrbitSimEnabled}
          isPlinkoEnabled={isPlinkoEnabled} 
          setIsPlinkoEnabled={setIsPlinkoEnabled}
          isFlockingEnabled={isFlockingEnabled} 
          setIsFlockingEnabled={setIsFlockingEnabled}
        ></Nav>
        { isOrbitSimEnabled && <OrbitSim></OrbitSim>}
        { isPlinkoEnabled && <Plinko></Plinko>}
        { isFlockingEnabled && <Flocking></Flocking>}
    </div>
  )
}
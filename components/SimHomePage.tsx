"use client"

import React, { useState } from 'react'
import OrbitSim from './OrbitSim'
import Plinko from './Plinko'
import Nav from './Nav'

export default function SimHomePage() {
  
  const [ isOrbitSimEnabled, setIsOrbitSimEnabled ] = useState<boolean>( true );
  const [ isPlinkoEnabled, setIsPlinkoEnabled ] = useState<boolean>( false );

  return (
    <div className="flex-row h-screen bg-background">
        <Nav 
          isOrbitSimEnabled={isOrbitSimEnabled} 
          setIsOrbitSimEnabled={setIsOrbitSimEnabled}
          isPlinkoEnabled={isPlinkoEnabled} 
          setIsPlinkoEnabled={setIsPlinkoEnabled}
        ></Nav>
        { isOrbitSimEnabled && <OrbitSim></OrbitSim>}
        { isPlinkoEnabled && <Plinko></Plinko>}
    </div>
  )
}
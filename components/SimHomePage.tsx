"use client"

import React from 'react'
import PixiComponent from './PixiComponent'
import Nav from './Nav'

export default function SimHomePage() {
  return (
    <div className="flex-row h-screen bg-background">
        <Nav></Nav>
        <PixiComponent></PixiComponent>
    </div>
  )
}
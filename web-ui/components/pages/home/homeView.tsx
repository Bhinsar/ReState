'use client'

import React from 'react'
import Hero from '@/components/pages/home/components/hero'
import PropertyList from '@/components/pages/home/components/propertyList'
import TrendingProperty from './components/trendingProperty'

function HomeView() {
    return (
        <main>
            <Hero />
            <PropertyList />
            <TrendingProperty />
        </main>
    )
}

export default HomeView
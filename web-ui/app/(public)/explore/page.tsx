import { Metadata } from 'next'
import React from 'react'

import ExploreView from '@/components/pages/explore/exploreView';
import Loading from '@/components/common/loading';

export const metadata: Metadata = {
    title: "Explore Properties",
    description: "Explore properties",
}
function ExplorePage() {
    return (
        <>
            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
                <ExploreView />
            </React.Suspense>
        </>
    )
}

export default ExplorePage
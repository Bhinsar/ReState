import React from 'react';
import {Metadata} from "next";
import HomeView from '@/components/pages/home/homeView';

export const metadata: Metadata = {
    title: 'Home',
    description: 'Find your dream property',
};
function Home() {
    return (
        <HomeView />
    );
}

export default Home;
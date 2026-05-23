import React from 'react';
import ProfileView from '@/components/pages/profile/ProfileView';

export const metadata = {
    title: 'My Profile | ReState',
    description: 'View and edit your ReState profile, change your password, and manage your account settings.',
};

export default function ProfilePage() {
    return <ProfileView />;
}
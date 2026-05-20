import React from 'react';
import ResetPassword from '@/components/pages/resetPassword/resetPassword';

interface PageProps {
    params: Promise<{ token: string }> | { token: string };
}

export default async function ResetPasswordPage({ params }: PageProps) {
    const resolvedParams = await params;
    return (
        <ResetPassword token={decodeURIComponent(resolvedParams.token)} />
    );
}

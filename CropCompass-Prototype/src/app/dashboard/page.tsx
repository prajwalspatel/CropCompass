
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the homepage where the dashboard now lives.
export default function DashboardRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/#tools');
    }, [router]);

    return null; 
}

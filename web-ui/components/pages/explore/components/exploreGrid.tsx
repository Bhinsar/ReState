import React, { useEffect, useRef } from 'react';
import PropertyCard from '@/components/common/propertyCard';
import Loading from '@/components/common/loading';
import ErrorIcons from '@/components/common/errorIcons';
import { Search, Loader2 } from 'lucide-react';
import { InfiniteData } from '@tanstack/react-query';
import { ApiResponse } from '@/services/api';
import { PropertySummaryResponse } from '@/services/properties/properties.Interface';

interface ExploreGridProps {
    isLoading: boolean;
    error: Error | null | unknown;
    data?: InfiniteData<ApiResponse<PropertySummaryResponse[]>, unknown>;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
}

export default function ExploreGrid({
    isLoading,
    error,
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
}: ExploreGridProps) {
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center">
                <ErrorIcons message={error instanceof Error ? error.message : 'Error loading properties'} />
            </div>
        );
    }

    if (!data?.pages[0]?.data || data.pages[0].data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No properties found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.pages.map((page, i) => (
                    <React.Fragment key={i}>
                        {page.data.map((property) => (
                            <PropertyCard key={property.propertyId} property={property} />
                        ))}
                    </React.Fragment>
                ))}
            </div>
                {hasNextPage && (
                    isFetchingNextPage ?
                        <div className="flex items-center justify-center mt-12">
                            <Loading />
                        </div> :    
                        <div ref={observerTarget} />
                )}
            {/* {hasNextPage && (
                <div ref={observerTarget} className="flex justify-center pt-8 pb-4 w-full">
                    {isFetchingNextPage ? (
                        <div className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                            <span className="font-medium">Loading more properties...</span>
                        </div>
                    ) : (
                        <div className="h-10" /> 
                    )}
                </div>
            )} */}
        </div>
    );
}

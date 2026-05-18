import ErrorIcons from '@/components/common/errorIcons';
import Loading from '@/components/common/loading';
import PropertyCard from '@/components/common/propertyCard';
import { useGetProperty } from '@/hooks/useProperty';
import { Info } from 'lucide-react';
import React from 'react'
import Titles from './titles';

function PropertyList() {
    const {
        data,
        isFetching,
        isLoading,
        error,
    } = useGetProperty(4);
    
    if (isLoading) {
        return (
            <div className='max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 min-h-[50vh] flex items-center justify-center'>
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorIcons message={error instanceof Error ? error.message : 'We could not load the properties at this time.'}/>
        );
    }

    const isEmpty = !data?.pages[0]?.data || data.pages[0].data.length === 0;

    return (
        <section className='bg-slate-50/50 py-16 sm:py-24'>
            <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8'>
                <Titles
                    title='Nearby Properties'
                    description='Find your dream home nearby with our curated selection of properties.'
                />

                {isEmpty ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">No properties found</h3>
                        <p className="text-slate-500 text-lg">Check back later for new exclusive listings.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10'>
                        {data?.pages.map((page, i) => (
                            <React.Fragment key={i}>
                                {page.data.map((property) => (
                                    <PropertyCard key={property.propertyId} property={property} />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* {hasNextPage && !isEmpty && (
                    <div className='mt-16 flex justify-center'>
                        <button 
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className='px-8 py-3.5 rounded-full bg-slate-900 text-white font-semibold shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center gap-3'
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Loading more...
                                </>
                            ) : (
                                'Load More Properties'
                            )}
                        </button>
                    </div>
                )} */}
            </div>
        </section>
    )
}

export default PropertyList
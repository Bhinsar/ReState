import { PropertyCard } from '@/components/common/propertyCard'
import { useGetProperty } from '@/hooks/useProperty'
import { PropertyResponse } from '@/services/properties/properties.Interface'
import React, { useEffect, useRef } from 'react'
import Titles from '../../home/components/titles'


function SimilarProperties({ property }: { property: PropertyResponse }) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetProperty({
        size: 10,
        propertyType: property.propertyType,
        listingType: property.listingType,
        // minBedrooms: property.bedrooms || undefined,
        // minBathrooms: property.bathrooms || undefined,
        city: property.address?.city,
        state: property.address?.state,
    })

    const nextPages = useRef<HTMLDivElement>(null)

    const isEmpty = !data?.pages[0]?.data || data.pages[0].data.length === 0;

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (nextPages.current) {
            observer.observe(nextPages.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <section className='bg-slate-50/50 py-16 sm:py-24'>
            <div className='max-w-8xl px-4 sm:px-6 lg:px-8'>
                {!isEmpty && (
                    <div className='gap-8 mx-[0px]!'>
                        <Titles
                            position='text-left'
                            title='Similar Properties'
                        />
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10'>
                            {data?.pages.map((page, i) => (
                                <React.Fragment key={i}>
                                    {page.data.map((property) => (
                                        <PropertyCard key={property.propertyId} property={property} />
                                    ))}
                                </React.Fragment>
                            ))}
                            {hasNextPage && (
                                <div ref={nextPages} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default SimilarProperties
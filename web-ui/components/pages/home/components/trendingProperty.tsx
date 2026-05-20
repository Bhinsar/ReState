import { useGetTrendingProperty } from '@/hooks/useProperty';
import { useGeolocation } from '@/hooks/useGeolocation';
import React from 'react'
import Titles from './titles'
import ErrorIcons from '@/components/common/errorIcons';
import Loading from '@/components/common/loading';
import PropertyCard from '@/components/common/propertyCard';

function TrendingProperty() {
    const { latitude, longitude } = useGeolocation();
    const {
        data,
        isFetching,
        isLoading,
        error,
    } = useGetTrendingProperty({
        size: 8,
        latitude,
        longitude
    });
  return (
    <section className='py-10 md:py-14 lg:py-16'>
            <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8'>
               
                {isLoading ? (
                    <div className='max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 min-h-[50vh] flex items-center justify-center'>
                        <Loading />
                    </div>
                ) : error ? (
                    <ErrorIcons message={error instanceof Error ? error.message : 'We could not load the properties at this time.'}/>
                ) : (
                 <>
                 <Titles
                    title='Most Popular Properties'
                    description='Discover the most popular properties in your area.'
                />
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10'>
                    
                    {data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.data.map((property) => (
                                <PropertyCard key={property.propertyId} property={property} />
                            ))}
                        </React.Fragment>
                    ))}
                </div>
                </>
                )}
            </div>
        </section>
  )
}

export default TrendingProperty
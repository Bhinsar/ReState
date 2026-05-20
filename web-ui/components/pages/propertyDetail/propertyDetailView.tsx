'use client'

import React from 'react';
import ErrorIcons from '@/components/common/errorIcons';
import Loading from '@/components/common/loading';
import { useGetPropertyById } from '@/hooks/useProperty';
import PropertyGallery from './components/propertyGallery';
import PropertyHeader from './components/propertyHeader';
import PropertyOverview from './components/propertyOverview';
import PropertyMap from './components/propertyMap';
import PropertyAgent from './components/propertyAgent';
import SimilarProperties from './components/similarProperties';

function PropertyDetailView({ id }: { id: string }) {
  const { data: response, error, isLoading, isFetching } = useGetPropertyById(id);

  if (isLoading || isFetching) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorIcons message={error instanceof Error ? error.message : 'We could not load the property at this time.'} />
    )
  }

  if (!response) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-slate-500 text-lg'>Property not found</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <PropertyGallery images={response.images} />
        <PropertyHeader property={response} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <PropertyOverview property={response} />
            <PropertyMap address={response.address} />

          </div>

          <div className="lg:w-1/3">
            <PropertyAgent owner={response.owner} />
          </div>
        </div>
        <SimilarProperties property={response} />
      </div>
    </div>
  )
}

export default PropertyDetailView
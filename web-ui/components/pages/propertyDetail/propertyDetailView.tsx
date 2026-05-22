'use client'

import React, { useEffect, useState } from 'react';
import ErrorIcons from '@/components/common/errorIcons';
import Loading from '@/components/common/loading';
import { useGetPropertyById } from '@/hooks/useProperty';
import PropertyGallery from './components/propertyGallery';
import PropertyHeader from './components/propertyHeader';
import PropertyOverview from './components/propertyOverview';
import PropertyMap from './components/propertyMap';
import PropertyAgent from './components/propertyAgent';
import SimilarProperties from './components/similarProperties';
import { Button } from '@/components/ui/button';
import { PropertyResponse, PropertySummaryResponse } from '@/services/properties/properties.Interface';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import PropertyModal from '@/components/pages/myProperties/components/PropertyModal';
import DeleteConfirmModal from '@/components/pages/myProperties/components/DeleteConfirmModal';
import { Edit, Trash2 } from 'lucide-react';

function PropertyDetailView({ id }: { id: string }) {
  const { data: response, error, isLoading, isFetching } = useGetPropertyById(id);
  const { user } = useAuthStore();
  const router = useRouter();
  const [isOwer, setIsOwer]= useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<PropertyResponse | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PropertySummaryResponse | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (user?.email && response?.owner?.email && user.email === response.owner.email) {
      setIsOwer(true);
    }
  }, [user, response]);

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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEdit = () => {
    if (!response) return;
    setEditTarget(response);
    setIsEditOpen(true);
  };

  const handleDelete = () => {
    if (!response) return;
    setDeleteTarget({
      propertyId: response.propertyId,
      title: response.title,
      price: response.price,
      propertyType: response.propertyType,
      listingType: response.listingType,
      status: response.status,
      bedrooms: response.bedrooms,
      bathrooms: response.bathrooms,
      areaSqft: response.areaSqft,
      city: response.address?.city ?? '',
      state: response.address?.state ?? '',
      primaryImageUrl: response.images?.[0]?.imageUrl ?? '',
      createdAt: response.createdAt,
    });
    setIsDeleteOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {isOwer && (
          <div className="flex gap-4 mb-6 justify-end">
            <Button
              onClick={() => handleEdit()}
              className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-semibold rounded-xl px-5 py-2.5"
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Edit Property
            </Button>
            <Button
              onClick={() => handleDelete()}
              variant="destructive"
              className="font-semibold rounded-xl px-5 py-2.5"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Property
            </Button>
          </div>
        )}
        <PropertyGallery images={response.images} />
        <PropertyHeader property={response} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <PropertyOverview property={response} />
            <PropertyMap address={response.address} />

          </div>

          <div className="lg:w-1/3">
            <PropertyAgent owner={response.owner} isOwer={isOwer} />
          </div>
        </div>
        <SimilarProperties property={response} />
      </div>

      <PropertyModal
        isOpen={isEditOpen}
        property={editTarget}
        onClose={() => {
          setIsEditOpen(false);
          setEditTarget(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        propertyId={deleteTarget?.propertyId ?? ''}
        propertyTitle={deleteTarget?.title ?? ''}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onSuccess={() => {
          router.push('/my-properties');
        }}
      />
    </div>
  )
}

export default PropertyDetailView
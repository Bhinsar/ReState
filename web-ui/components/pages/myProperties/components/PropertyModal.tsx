'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus, Pencil, Home, DollarSign, BedDouble, Bath, Maximize2,
    FileText, Tag, ArrowUpDown, Activity, MapPin, RefreshCw
} from 'lucide-react';
import {
    PropertyType,
    ListingType,
    PropertyStatus,
    PropertyResponse,
} from '@/services/properties/properties.Interface';
import { addressResponse } from '@/services/addresses/address.interface';
import { useCreateProperty, useUpdateProperty } from '@/hooks/useProperty';
import { useGetAllAddresses } from '@/hooks/useAddress';
import AddressModal from '@/components/common/AddressModal';
import { propertySchema } from './PropertySchema';
import FormInput from '@/components/common/fromInput';
import ImageUpload from './ImageUpload';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type PropertyFormData = z.infer<typeof propertySchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const enumToOptions = (e: Record<string, string>) =>
    Object.values(e).map((v) => ({
        value: v,
        label: v.charAt(0) + v.slice(1).toLowerCase().replace('_', ' '),
    }));

const propertyTypeOptions = enumToOptions(PropertyType);
const listingTypeOptions   = enumToOptions(ListingType);
const statusOptions        = enumToOptions(PropertyStatus);

// ─── Props ────────────────────────────────────────────────────────────────────
interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property?: PropertyResponse | null;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose, property }) => {
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const createProperty = useCreateProperty();
    const updateProperty = useUpdateProperty();
    const { data: addresses, refetch: refetchAddresses } = useGetAllAddresses();

    const isEditMode = !!property;

    const {
        control,
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PropertyFormData, unknown, PropertyFormData>({
        resolver: zodResolver(propertySchema) as any,
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            propertyType: PropertyType.APARTMENT,
            listingType: ListingType.SALE,
            status: PropertyStatus.DRAFT,
            bedrooms: 1,
            bathrooms: 1,
            areaSqft: 0,
            addressId: '',
            images: [],
        },
    });

    const selectedAddressId = watch('addressId');

    // Populate or reset form values based on whether `property` prop is provided
    useEffect(() => {
        if (isOpen) {
            if (property) {
                reset({
                    title: property.title,
                    description: property.description,
                    price: property.price,
                    propertyType: property.propertyType,
                    listingType: property.listingType,
                    status: property.status,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    areaSqft: property.areaSqft,
                    addressId: property.address?.addressId ?? '',
                    images: property.images ?? [],
                });
            } else {
                reset({
                    title: '',
                    description: '',
                    price: 0,
                    propertyType: PropertyType.APARTMENT,
                    listingType: ListingType.SALE,
                    status: PropertyStatus.DRAFT,
                    bedrooms: 1,
                    bathrooms: 1,
                    areaSqft: 0,
                    addressId: '',
                    images: [],
                });
            }
        }
    }, [isOpen, property, reset]);

    const onSubmit = (data: PropertyFormData) => {
        if (isEditMode && property) {
            updateProperty.mutate(
                { id: property.propertyId, data },
                {
                    onSuccess: () => {
                        reset();
                        onClose();
                    },
                }
            );
        } else {
            createProperty.mutate(
                data,
                {
                    onSuccess: () => {
                        reset();
                        onClose();
                    },
                }
            );
        }
    };

    const handleAddressCreated = (address: addressResponse) => {
        refetchAddresses();
        setValue('addressId', address.addressId, { shouldValidate: true });
    };

    const isPending = createProperty.isPending || updateProperty.isPending || isSubmitting;

    // Dynamic UI configurations based on mode
    const titleText = isEditMode ? 'Edit Property' : 'Create New Property';
    const descText = isEditMode ? property?.title : 'Fill in the details to list your property';
    const submitText = isPending 
        ? (isEditMode ? 'Saving…' : 'Creating…') 
        : (isEditMode ? 'Save Changes' : 'Create Property');
    const headerIcon = isEditMode 
        ? <Pencil className="w-5 h-5 text-indigo-600" /> 
        : <Plus className="w-5 h-5 text-blue-600" />;
    const headerIconBg = isEditMode ? 'bg-indigo-50' : 'bg-blue-50';
    const submitBtnCls = isEditMode 
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white gap-2' 
        : 'bg-blue-600 hover:bg-blue-700 text-white gap-2';

    return (
        <>
            <Dialog open={isOpen && (!isEditMode || !!property)} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
                    className="w-[96vw] max-w-2xl sm:max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden"
                    showCloseButton={false}
                >
                    {/* ── Header ───────────────────────────────────────────── */}
                    <DialogHeader className="flex-row items-center gap-3 px-6 py-5 border-b border-border">
                        <div className={`w-9 h-9 shrink-0 rounded-xl ${headerIconBg} flex items-center justify-center`}>
                            {headerIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-base font-bold text-slate-800">
                                {titleText}
                            </DialogTitle>
                            <DialogDescription className="text-xs truncate mt-0.5">
                                {descText}
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon-sm" type="button" onClick={onClose}>
                            <span className="sr-only">Close</span>✕
                        </Button>
                    </DialogHeader>

                    {/* ── Body ─────────────────────────────────────────────── */}
                    <div className="overflow-y-auto flex-1 px-6 py-5">
                        <form id="property-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            <ImageUpload control={control} name="images" />

                            {/* Title */}
                            <FormInput
                                name="title"
                                control={control}
                                label="Property Title"
                                placeholder="e.g. Modern 2BHK in Whitefield"
                                startIcon={<Home />}
                            />

                            {/* Description */}
                            <FormInput
                                name="description"
                                control={control}
                                label="Description"
                                placeholder="Describe the property, amenities, surroundings..."
                                type="textarea"
                            />

                            {/* Price */}
                            <FormInput
                                name="price"
                                control={control}
                                label="Price (₹)"
                                placeholder="e.g. 5000000"
                                startIcon={<DollarSign />}
                            />

                            {/* Property Type / Listing Type / Status */}
                            <div className={isEditMode ? "grid grid-cols-3 gap-4" : "grid grid-cols-2 gap-4"}>
                                <FormInput
                                    name="propertyType"
                                    control={control}
                                    label="Property Type"
                                    type="select"
                                    startIcon={<Tag />}
                                    options={propertyTypeOptions}
                                    placeholder="Select type"
                                />
                                <FormInput
                                    name="listingType"
                                    control={control}
                                    label="Listing Type"
                                    type="select"
                                    startIcon={<ArrowUpDown />}
                                    options={listingTypeOptions}
                                    placeholder="Select listing"
                                />
                                {isEditMode && (
                                    <FormInput
                                        name="status"
                                        control={control}
                                        label="Status"
                                        type="select"
                                        startIcon={<Activity />}
                                        options={statusOptions}
                                        placeholder="Select status"
                                    />
                                )}
                            </div>

                            {/* Bedrooms / Bathrooms / Area */}
                            <div className="grid grid-cols-3 gap-4">
                                <FormInput
                                    name="bedrooms"
                                    control={control}
                                    label="Bedrooms"
                                    placeholder="e.g. 2"
                                    startIcon={<BedDouble />}
                                />
                                <FormInput
                                    name="bathrooms"
                                    control={control}
                                    label="Bathrooms"
                                    placeholder="e.g. 2"
                                    startIcon={<Bath />}
                                />
                                <FormInput
                                    name="areaSqft"
                                    control={control}
                                    label="Area (sqft)"
                                    placeholder="e.g. 1200"
                                    startIcon={<Maximize2 />}
                                />
                            </div>

                            {/* Address Selector */}
                            <div className="space-y-2">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <FormInput
                                            name="addressId"
                                            control={control}
                                            label="Address"
                                            placeholder="Select an address..."
                                            startIcon={<MapPin />}
                                            type="select"
                                            options={addresses?.map((addr) => ({
                                                value: addr.addressId,
                                                label: `${addr.address}, ${addr.city}, ${addr.state}`,
                                            })) || []}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => refetchAddresses()}
                                        title="Refresh addresses"
                                        className="mb-0.5 shrink-0 rounded-full border-2 border-gray-300"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>

                                {selectedAddressId && addresses && (() => {
                                    const addr = addresses.find(a => a.addressId === selectedAddressId);
                                    return addr ? (
                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-xs text-blue-700">
                                                📍 {addr.address}
                                                {addr.plotNumber ? `, ${addr.plotNumber}` : ''}
                                                {addr.landmark ? `, Near ${addr.landmark}` : ''}{' '}
                                                — {addr.city}, {addr.state} {addr.pinCode}
                                            </p>
                                        </div>
                                    ) : null;
                                })()}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add a New Address
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* ── Footer ───────────────────────────────────────────── */}
                    <DialogFooter className="p-8 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="property-form"
                            disabled={isPending}
                            className={submitBtnCls}
                        >
                            {isPending && (
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {submitText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Nested Address Modal */}
            <AddressModal
                isOpen={isAddressModalOpen}
                mode="create"
                onClose={() => setIsAddressModalOpen(false)}
                onSuccess={handleAddressCreated}
            />
        </>
    );
};

export default PropertyModal;

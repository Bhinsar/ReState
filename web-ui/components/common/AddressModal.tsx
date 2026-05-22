'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Building2, Navigation, Hash, Layers, Landmark, Globe, MailOpen, Map } from 'lucide-react';
import { addressResponse, addressCreateRequest } from '@/services/addresses/address.interface';
import { useCreateAddress, useUpdateAddress } from '@/hooks/useAddress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const addressSchema = z.object({
    address: z.string().min(3, 'Street address is required'),
    plotNumber: z.string().optional(),
    floor: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(2, 'Country is required'),
    pinCode: z.string().min(4, 'Pin code is required'),
    latitude: z.coerce.number().min(-90).max(90, 'Enter a valid latitude'),
    longitude: z.coerce.number().min(-180).max(180, 'Enter a valid longitude'),
});

type AddressFormData = z.infer<typeof addressSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────
export type AddressModalMode = 'create' | 'edit' | 'view';

interface AddressModalProps {
    isOpen: boolean;
    mode: AddressModalMode;
    existingAddress?: addressResponse | null;
    onClose: () => void;
    onSuccess?: (address: addressResponse) => void;
}

// ─── Field Component ─────────────────────────────────────────────────────────
interface FieldProps {
    label: string;
    error?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    required?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, error, icon, children, required }) => (
    <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {icon}
            {label}
            {required && <span className="text-blue-500 ml-0.5">*</span>}
        </label>
        {children}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                {error}
            </p>
        )}
    </div>
);

// ─── Input Styles ─────────────────────────────────────────────────────────────
const inputClass = (hasError?: boolean, disabled?: boolean) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 bg-white
   transition-all duration-200 outline-none
   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
   placeholder:text-slate-300
   ${hasError ? 'border-red-300 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'}
   ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`;

// ─── Component ────────────────────────────────────────────────────────────────
const AddressModal: React.FC<AddressModalProps> = ({
    isOpen,
    mode,
    existingAddress,
    onClose,
    onSuccess,
}) => {
    const isView = mode === 'view';
    const isEdit = mode === 'edit';

    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormData, unknown, AddressFormData>({
        resolver: zodResolver(addressSchema) as any,
        defaultValues: {
            address: '',
            plotNumber: '',
            floor: '',
            landmark: '',
            city: '',
            state: '',
            country: 'India',
            pinCode: '',
            latitude: 0,
            longitude: 0,
        },
    });

    // Pre-fill form when editing
    useEffect(() => {
        if (existingAddress && (isEdit || isView)) {
            reset({
                address: existingAddress.address,
                plotNumber: existingAddress.plotNumber ?? '',
                floor: existingAddress.floor ?? '',
                landmark: existingAddress.landmark ?? '',
                city: existingAddress.city,
                state: existingAddress.state,
                country: existingAddress.country,
                pinCode: existingAddress.pinCode,
                latitude: existingAddress.latitude,
                longitude: existingAddress.longitude,
            });
        } else if (mode === 'create') {
            reset({
                address: '',
                plotNumber: '',
                floor: '',
                landmark: '',
                city: '',
                state: '',
                country: 'India',
                pinCode: '',
                latitude: 0,
                longitude: 0,
            });
        }
    }, [existingAddress, mode, reset, isEdit, isView]);

    const onSubmit = async (data: AddressFormData) => {
        const payload: addressCreateRequest = {
            address: data.address,
            plotNumber: data.plotNumber || undefined,
            floor: data.floor || undefined,
            landmark: data.landmark || undefined,
            city: data.city,
            state: data.state,
            country: data.country,
            pinCode: data.pinCode,
            latitude: data.latitude,
            longitude: data.longitude,
        };

        if (isEdit && existingAddress?.addressId) {
            updateAddress.mutate(
                { id: existingAddress.addressId, data: payload },
                {
                    onSuccess: (result) => {
                        onSuccess?.(result);
                        onClose();
                    },
                }
            );
        } else {
            createAddress.mutate(payload, {
                onSuccess: (result) => {
                    onSuccess?.(result);
                    onClose();
                },
            });
        }
    };

    const isPending = createAddress.isPending || updateAddress.isPending || isSubmitting;
    const title =
        mode === 'create' ? 'Add New Address' : mode === 'edit' ? 'Edit Address' : 'Address Details';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="w-[96vw] max-w-2xl sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
                showCloseButton={false}
            >
                {/* ── Header ───────────────────────────────────────────── */}
                <DialogHeader className="flex-row items-center gap-3 px-6 py-5 border-b border-border">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <DialogTitle className="text-base font-bold text-slate-800">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-xs mt-0.5">
                            {mode === 'view'
                                ? 'Saved address details'
                                : 'Fill in the address information below'}
                        </DialogDescription>
                    </div>
                    <Button variant="ghost" size="icon-sm" type="button" onClick={onClose}>
                        <span className="sr-only">Close</span>✕
                    </Button>
                </DialogHeader>

                {/* ── Scrollable Body ───────────────────────────────────── */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    <form id="address-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Street Address */}
                        <Field
                            label="Street Address"
                            error={errors.address?.message}
                            icon={<MapPin className="w-3.5 h-3.5" />}
                            required
                        >
                            <input
                                {...register('address')}
                                disabled={isView}
                                placeholder="e.g. 42, MG Road"
                                className={inputClass(!!errors.address, isView)}
                            />
                        </Field>

                        {/* Plot / Floor */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="Plot / House No."
                                error={errors.plotNumber?.message}
                                icon={<Hash className="w-3.5 h-3.5" />}
                            >
                                <input
                                    {...register('plotNumber')}
                                    disabled={isView}
                                    placeholder="e.g. Plot 7B"
                                    className={inputClass(!!errors.plotNumber, isView)}
                                />
                            </Field>
                            <Field
                                label="Floor"
                                error={errors.floor?.message}
                                icon={<Layers className="w-3.5 h-3.5" />}
                            >
                                <input
                                    {...register('floor')}
                                    disabled={isView}
                                    placeholder="e.g. 3rd Floor"
                                    className={inputClass(!!errors.floor, isView)}
                                />
                            </Field>
                        </div>

                        {/* Landmark */}
                        <Field
                            label="Landmark"
                            error={errors.landmark?.message}
                            icon={<Landmark className="w-3.5 h-3.5" />}
                        >
                            <input
                                {...register('landmark')}
                                disabled={isView}
                                placeholder="e.g. Near Central Park"
                                className={inputClass(!!errors.landmark, isView)}
                            />
                        </Field>

                        {/* City / State */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="City"
                                error={errors.city?.message}
                                icon={<Building2 className="w-3.5 h-3.5" />}
                                required
                            >
                                <input
                                    {...register('city')}
                                    disabled={isView}
                                    placeholder="e.g. Bangalore"
                                    className={inputClass(!!errors.city, isView)}
                                />
                            </Field>
                            <Field
                                label="State"
                                error={errors.state?.message}
                                icon={<Building2 className="w-3.5 h-3.5" />}
                                required
                            >
                                <input
                                    {...register('state')}
                                    disabled={isView}
                                    placeholder="e.g. Karnataka"
                                    className={inputClass(!!errors.state, isView)}
                                />
                            </Field>
                        </div>

                        {/* Country / Pin Code */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="Country"
                                error={errors.country?.message}
                                icon={<Globe className="w-3.5 h-3.5" />}
                                required
                            >
                                <input
                                    {...register('country')}
                                    disabled={isView}
                                    placeholder="India"
                                    className={inputClass(!!errors.country, isView)}
                                />
                            </Field>
                            <Field
                                label="Pin Code"
                                error={errors.pinCode?.message}
                                icon={<MailOpen className="w-3.5 h-3.5" />}
                                required
                            >
                                <input
                                    {...register('pinCode')}
                                    disabled={isView}
                                    placeholder="e.g. 560001"
                                    className={inputClass(!!errors.pinCode, isView)}
                                />
                            </Field>
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="Latitude"
                                error={errors.latitude?.message}
                                icon={<Navigation className="w-3.5 h-3.5" />}
                                required
                            >
                                <input
                                    {...register('latitude')}
                                    type="number"
                                    step="any"
                                    disabled={isView}
                                    placeholder="e.g. 12.9716"
                                    className={inputClass(!!errors.latitude, isView)}
                                />
                            </Field>
                            <Field
                                label="Longitude"
                                error={errors.longitude?.message}
                                icon={<Navigation className="w-3.5 h-3.5 rotate-90" />}
                                required
                            >
                                <input
                                    {...register('longitude')}
                                    type="number"
                                    step="any"
                                    disabled={isView}
                                    placeholder="e.g. 77.5946"
                                    className={inputClass(!!errors.longitude, isView)}
                                />
                            </Field>
                        </div>

                        {/* ── Map Placeholder ─────────────────────────────────── */}
                        <div className="mt-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                <Map className="w-3.5 h-3.5" />
                                Location Preview
                            </label>
                            <div
                                className="w-full h-52 rounded-xl bg-slate-900 flex flex-col items-center justify-center gap-3
                                           border border-slate-700 relative overflow-hidden"
                            >
                                {/* Grid overlay for map feel */}
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage:
                                            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                                        backgroundSize: '32px 32px',
                                    }}
                                />
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-center z-10">
                                    <p className="text-slate-300 text-sm font-semibold">Map Coming Soon</p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Interactive map will be integrated here
                                    </p>
                                </div>
                                {/* Corner decoration */}
                                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-slate-500 text-[10px] font-mono">
                                        {'{lat, lng}'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* ── Footer ───────────────────────────────────────────── */}
                {!isView ? (
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="address-form"
                            disabled={isPending}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPending ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                isEdit ? 'Update Address' : 'Save Address'
                            )}
                        </Button>
                    </DialogFooter>
                ) : (
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddressModal;

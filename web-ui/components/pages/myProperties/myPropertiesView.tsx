'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Home, TrendingUp, CheckCircle2, Archive,
    Search, SlidersHorizontal, Building2, ChevronDown,
    Loader2, AlertCircle, RefreshCw, LayoutGrid
} from 'lucide-react';
import {
    PropertySummaryResponse,
    PropertyResponse,
    PropertyFilterRequest,
    PropertyType,
    ListingType,
    PropertyStatus,
} from '@/services/properties/properties.Interface';
import { useOwnerProperties, useOwnerMetrics } from '@/hooks/useProperty';
import PropertyModal from './components/PropertyModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import HeroHeader from './components/HeroHeader';
import Filters from './components/Filters';
import PropertyCard from '@/components/common/propertyCard';


// ─── Select style ─────────────────────────────────────────────────────────────
const selectCls = 'pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none cursor-pointer hover:border-slate-300 transition-all';

// ─── Main View ────────────────────────────────────────────────────────────────
function MyPropertiesView() {
    const router = useRouter();

    // ── Filter state ──────────────────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<PropertyStatus | ''>('');
    const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
    const [listingFilter, setListingFilter] = useState<ListingType | ''>('');

    // ── Modal state ───────────────────────────────────────────────────────────
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<PropertyResponse | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PropertySummaryResponse | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // ── Query filter ──────────────────────────────────────────────────────────
    const queryFilter: Omit<PropertyFilterRequest, 'page'> = {
        size: 12,
        search: search || undefined,
        propertyStatus: statusFilter || undefined,
        propertyType: typeFilter || undefined,
        listingType: listingFilter || undefined,
    };

    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        error,
        refetch,
    } = useOwnerProperties(queryFilter);

    const {
        data: metrics,
        isLoading: isMetricsLoading,
    } = useOwnerMetrics();

    // ── Flatten pages ─────────────────────────────────────────────────────────
    const allProperties = data?.pages.flatMap((page) => page.data) ?? [];
    const totalCount = data?.pages[0]?.pagination?.totalElements ?? 0;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit =async (summary: PropertySummaryResponse) => {
        // We need the full PropertyResponse for the edit form
        // So we fetch it on-demand
        try {
            const { PropertyService } = await import('@/services/properties/properties.Service');
            const full = await PropertyService.getPropertyById(summary.propertyId);
            setEditTarget(full);
            setIsEditOpen(true);
        } catch {
            // fallback: open with minimal data
            setEditTarget({
                propertyId: summary.propertyId,
                title: summary.title,
                description: '',
                price: summary.price,
                propertyType: summary.propertyType,
                listingType: summary.listingType,
                status: summary.status,
                bedrooms: summary.bedrooms,
                bathrooms: summary.bathrooms,
                areaSqft: summary.areaSqft,
                createdAt: summary.createdAt,
                updatedAt: summary.createdAt,
                owner: { id: '', firstName: '', lastName: '', email: '', phoneNumber: '', avatarUrl: '' },
                address: { addressId: '', address: summary.city, city: summary.city, state: summary.state, country: '', pinCode: '', latitude: 0, longitude: 0 },
                images: [],
                viewCount: 0,
            });
            setIsEditOpen(true);
        }
    };

    const handleDelete = (property: PropertySummaryResponse) => {
        setDeleteTarget(property);
        setIsDeleteOpen(true);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="min-h-screen bg-slate-50">
                {/* ── Hero Header ─────────────────────────────────────────────── */}
                <HeroHeader
                    totalCount={metrics?.totalListing ?? 0}
                    available={metrics?.available ?? 0}
                    soldOrRented={(metrics?.sold ?? 0) + (metrics?.rented ?? 0)}
                    drafts={metrics?.draft ?? 0}
                    isLoading={isLoading || isMetricsLoading}
                    setIsCreateOpen={setIsCreateOpen}
                />

                {/* ── Filters ─────────────────────────────────────────────────── */}
                <Filters
                    search={search}
                    setSearch={setSearch}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    listingFilter={listingFilter}
                    setListingFilter={setListingFilter}
                    refetch={refetch}
                    allProperties={allProperties}
                    totalCount={totalCount}
                    selectCls={selectCls}
                />
                {/* ── Content ──────────────────────────────────────────────────── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-8">

                    {/* Loading skeleton */}
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white border border-slate-100 overflow-hidden animate-pulse">
                                    <div className="h-48 bg-slate-100" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                                        <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                                        <div className="h-px bg-slate-100" />
                                        <div className="flex gap-4">
                                            <div className="h-3 bg-slate-100 rounded-full w-12" />
                                            <div className="h-3 bg-slate-100 rounded-full w-12" />
                                            <div className="h-3 bg-slate-100 rounded-full w-16" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {error && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-700 font-semibold">Failed to load properties</p>
                                <p className="text-slate-400 text-sm mt-1">
                                    {error instanceof Error ? error.message : 'Something went wrong'}
                                </p>
                            </div>
                            <button
                                onClick={() => refetch()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold
                                        rounded-xl hover:bg-blue-700 transition-colors active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" /> Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && !error && allProperties.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-5">
                            <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-inner">
                                <Building2 className="w-12 h-12 text-blue-300" />
                            </div>
                            <div className="text-center max-w-sm">
                                <h3 className="text-lg font-bold text-slate-700">No properties yet</h3>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                                    {search || statusFilter || typeFilter || listingFilter
                                        ? 'No properties match your current filters. Try clearing them.'
                                        : "You haven't listed any properties. Get started by adding your first listing."}
                                </p>
                            </div>
                            {!search && !statusFilter && !typeFilter && !listingFilter && (
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600
                                            text-white text-sm font-semibold rounded-xl
                                            shadow-lg shadow-blue-200 hover:shadow-xl
                                            transition-all duration-200 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Your First Property
                                </button>
                            )}
                        </div>
                    )}

                    {/* Property Grid */}
                    {!isLoading && allProperties.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {allProperties.map((property) => (
                                    <PropertyCard
                                        key={property.propertyId}
                                        property={property}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        forOwner={true}                                        
                                    />
                                ))}
                            </div>

                            {/* Load More */}
                            {hasNextPage && (
                                <div className="flex justify-center mt-10">
                                    <button
                                        id="load-more-properties"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200
                                                text-slate-700 font-semibold text-sm rounded-xl
                                                hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700
                                                transition-all duration-200 active:scale-95
                                                disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {isFetchingNextPage ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading more…
                                            </>
                                        ) : (
                                            <>
                                                Load More Properties
                                                <ChevronDown className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── FAB (Mobile) ─────────────────────────────────────────────── */}
                <button
                    id="fab-create-property"
                    onClick={() => setIsCreateOpen(true)}
                    className="fixed bottom-24 right-5 md:hidden w-14 h-14 rounded-full
                            bg-linear-to-br from-blue-600 to-indigo-600
                            text-white shadow-2xl shadow-blue-400/40
                            flex items-center justify-center z-40
                            hover:shadow-blue-400/60 active:scale-95 transition-all duration-200"
                >
                    <Plus className="w-6 h-6" />
                </button>

            </div>
            {/* ── Modals ───────────────────────────────────────────────────── */}
            <PropertyModal
                isOpen={isCreateOpen || isEditOpen}
                property={isEditOpen ? editTarget : null}
                onClose={() => {
                    setIsCreateOpen(false);
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
            />
        </div>
    );
}

export default MyPropertiesView;
import { ListingType, PropertyStatus, PropertySummaryResponse, PropertyType } from '@/services/properties/properties.Interface'
import { ChevronDown, LayoutGrid, RefreshCw, Search } from 'lucide-react'
import React from 'react'

function Filters({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    listingFilter,
    setListingFilter,
    refetch,
    allProperties,
    totalCount,
    selectCls
}: {
    search: string
    setSearch: (search: string) => void
    statusFilter: PropertyStatus | ''
    setStatusFilter: (status: PropertyStatus | '') => void
    typeFilter: PropertyType | ''
    setTypeFilter: (type: PropertyType | '') => void
    listingFilter: ListingType | ''
    setListingFilter: (listing: ListingType | '') => void
    refetch: () => void
    allProperties: PropertySummaryResponse[]
    totalCount: number
    selectCls: string
}) {
  return (
    <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-50">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="search-properties"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search properties…"
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm
                                           text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500/20
                                           focus:border-blue-400 hover:border-slate-300 transition-all placeholder:text-slate-300"
                            />
                        </div>

                        {/* Status */}
                        <div className="relative">
                            <select
                                id="filter-status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | '')}
                                className={selectCls}
                            >
                                <option value="">All Statuses</option>
                                {Object.values(PropertyStatus).map(s => (
                                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Property Type */}
                        <div className="relative">
                            <select
                                id="filter-type"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as PropertyType | '')}
                                className={selectCls}
                            >
                                <option value="">All Types</option>
                                {Object.values(PropertyType).map(t => (
                                    <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Listing Type */}
                        <div className="relative">
                            <select
                                id="filter-listing"
                                value={listingFilter}
                                onChange={(e) => setListingFilter(e.target.value as ListingType | '')}
                                className={selectCls}
                            >
                                <option value="">Rent & Sale</option>
                                {Object.values(ListingType).map(l => (
                                    <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Refresh */}
                        <button
                            id="refresh-properties"
                            onClick={() => refetch()}
                            title="Refresh"
                            className="p-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50
                                       text-slate-400 hover:text-blue-500 transition-all duration-200"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Count label */}
                        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>{allProperties.length} of {totalCount} shown</span>
                        </div>
                    </div>
                </div>
            </div>

  )
}

export default Filters
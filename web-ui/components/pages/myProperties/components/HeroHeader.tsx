import { Archive, Building2, CheckCircle2, Home, Plus, TrendingUp } from 'lucide-react'
import React from 'react'

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    gradient: string;
    description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient, description }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient} shadow-lg`}>
        <div className="absolute inset-0 bg-white/5" style={{
            backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)'
        }} />
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight mb-0.5">{value}</div>
            <div className="text-sm font-semibold opacity-90">{label}</div>
            {description && <div className="text-xs opacity-60 mt-0.5">{description}</div>}
        </div>
    </div>
);

function HeroHeader({
    totalCount,
    available,
    soldOrRented,
    drafts,
    isLoading,
    setIsCreateOpen
}: {
    totalCount: number
    available: number
    soldOrRented: number
    drafts: number
    isLoading: boolean
    setIsCreateOpen: (open: boolean) => void
}) {
  return (
    <div className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 10%, white 0%, transparent 40%)'
                    }}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-blue-200 text-sm font-medium">My Properties</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Property Dashboard
                            </h1>
                            <p className="text-blue-200 text-sm mt-1">
                                Manage and track all your real estate listings in one place
                            </p>
                        </div>
                        <button
                            id="create-property-btn"
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-white text-blue-700 font-bold text-sm
                                       rounded-xl shadow-xl hover:shadow-2xl hover:bg-blue-50
                                       transition-all duration-200 active:scale-95 self-start md:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Property
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <StatCard
                            label="Total Listings"
                            value={isLoading ? '—' : totalCount}
                            icon={<Home className="w-4 h-4 text-white" />}
                            gradient="bg-white/10 backdrop-blur-sm border border-white/20"
                            description="All your properties"
                        />
                        <StatCard
                            label="Available"
                            value={isLoading ? '—' : available}
                            icon={<CheckCircle2 className="w-4 h-4 text-white" />}
                            gradient="bg-white/10 backdrop-blur-sm border border-white/20"
                            description="Ready to view"
                        />
                        <StatCard
                            label="Sold / Rented"
                            value={isLoading ? '—' : soldOrRented}
                            icon={<TrendingUp className="w-4 h-4 text-white" />}
                            gradient="bg-white/10 backdrop-blur-sm border border-white/20"
                            description="Completed deals"
                        />
                        <StatCard
                            label="Drafts"
                            value={isLoading ? '—' : drafts}
                            icon={<Archive className="w-4 h-4 text-white" />}
                            gradient="bg-white/10 backdrop-blur-sm border border-white/20"
                            description="Unpublished"
                        />
                    </div>
                </div>
            </div>
  )
}

export default HeroHeader
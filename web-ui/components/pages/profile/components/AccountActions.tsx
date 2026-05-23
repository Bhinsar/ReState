'use client';

import React from 'react';
import { LogOut, Trash2, ChevronRight, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { SectionCard } from './shared';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

// ─── Account Actions section ──────────────────────────────────────────────────
interface AccountActionsProps {
    onLogout: () => void;
    isDeleting: boolean;
    onDeleteConfirm: () => void;
}

export default function AccountActions({
    onLogout,
    isDeleting,
    onDeleteConfirm,
}: AccountActionsProps) {
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

    return (
        <SectionCard title="Account Actions" icon={<Shield className="w-4 h-4" />}>
            <div className="space-y-3">

                {/* Log out */}
                <button
                    id="logout-btn"
                    onClick={onLogout}
                    className="cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-xl
                               hover:bg-slate-50 text-slate-700 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <LogOut className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold">Log Out</p>
                            <p className="text-xs text-slate-400 mt-0.5">Sign out of your account</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Delete account */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>

                    <button
                        id="delete-account-btn"
                        onClick={() => setIsDeleteOpen(true)}
                        className="cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-xl
                                   hover:bg-red-50 text-red-500 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold">Delete Account</p>
                                <p className="text-xs text-red-300 mt-0.5">Permanently remove all your data</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-300 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <DialogContent showCloseButton={!isDeleting}>
                        <DialogHeader>
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-1">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <DialogTitle className="text-center text-base font-bold text-slate-900">
                                Delete Account
                            </DialogTitle>
                            <DialogDescription className="text-center leading-relaxed">
                                This action is{' '}
                                <span className="font-semibold text-red-500">permanent and irreversible</span>.
                                All your data, listings, and history will be deleted.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="sm:flex-row gap-3">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                disabled={isDeleting}
                                className="cursor-pointer flex-1 h-11 rounded-xl border-2 border-slate-200 text-sm font-semibold
                                           text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                id="confirm-delete-btn"
                                onClick={onDeleteConfirm}
                                disabled={isDeleting}
                                className="cursor-pointer flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white
                                           text-sm font-semibold transition-colors disabled:opacity-60
                                           flex items-center justify-center gap-2"
                            >
                                {isDeleting
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Trash2 className="w-4 h-4" />
                                }
                                Delete Forever
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </SectionCard>
    );
}

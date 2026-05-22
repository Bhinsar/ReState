'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useDeleteProperty } from '@/hooks/useProperty';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    propertyId: string;
    propertyTitle: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    propertyId,
    propertyTitle,
    onClose,
    onSuccess,
}) => {
    const deleteProperty = useDeleteProperty();

    const handleDelete = () => {
        deleteProperty.mutate(propertyId, {
            onSuccess: () => {
                onSuccess?.();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[96vw] max-w-md sm:max-w-md" showCloseButton={false}>
                {/* Icon + Header */}
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="pt-1">
                            <DialogTitle className="text-base font-bold text-slate-800">
                                Delete Property
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-sm text-slate-500 leading-relaxed">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-slate-700">"{propertyTitle}"</span>?
                                This action cannot be undone and will permanently remove the listing.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Warning banner */}
                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                        All associated images and data will also be removed from the platform.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={deleteProperty.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteProperty.isPending}
                        className="gap-2"
                    >
                        {deleteProperty.isPending ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Property
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteConfirmModal;

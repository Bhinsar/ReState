import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressService } from "@/services/addresses/address.Service";
import { addressCreateRequest } from "@/services/addresses/address.interface";
import { toast } from "sonner";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const addressKeys = {
    all: ['addresses'] as const,
    detail: (id: string) => ['address', id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useGetAllAddresses = () => {
    return useQuery({
        queryKey: addressKeys.all,
        queryFn: () => AddressService.getAllAddresses(),
    });
};

export const useGetAddressById = (id: string) => {
    return useQuery({
        queryKey: addressKeys.detail(id),
        queryFn: () => AddressService.getAddressById(id),
        enabled: !!id,
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: addressCreateRequest) => AddressService.createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
            toast.success("Address saved successfully!");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to save address.");
        },
    });
};

export const useUpdateAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: addressCreateRequest }) =>
            AddressService.updateAddress(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
            queryClient.invalidateQueries({ queryKey: addressKeys.detail(id) });
            toast.success("Address updated successfully!");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to update address.");
        },
    });
};

export const useDeleteAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AddressService.deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
            toast.success("Address deleted successfully!");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to delete address.");
        },
    });
};

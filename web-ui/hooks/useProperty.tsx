import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PropertyService } from "@/services/properties/properties.Service";
import { PropertyFilterRequest, PropertyUpdate } from "@/services/properties/properties.Interface";
import { toast } from "sonner";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const propertyKeys = {
    all: ['properties'] as const,
    trending: ['trending-properties'] as const,
    owner: ['owner-properties'] as const,
    detail: (id: string) => ['property', id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useGetProperty = (filter: Omit<PropertyFilterRequest, 'page'>) => {
    return useInfiniteQuery({
        queryKey: [...propertyKeys.all, filter],
        initialPageParam: 0,
        queryFn: ({ pageParam }: { pageParam: number }) =>
            PropertyService.getAllProperties({ ...filter, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasNext) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
    });
};

export const useGetTrendingProperty = (filter: Omit<PropertyFilterRequest, 'page'>) => {
    return useInfiniteQuery({
        queryKey: [...propertyKeys.trending, filter],
        initialPageParam: 0,
        queryFn: ({ pageParam }: { pageParam: number }) =>
            PropertyService.getTrendingProperties({ ...filter, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasNext) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
    });
};

export const useGetPropertyById = (propertyId: string) => {
    return useQuery({
        queryKey: propertyKeys.detail(propertyId),
        queryFn: () => PropertyService.getPropertyById(propertyId),
        enabled: !!propertyId,
    });
};

export const useOwnerProperties = (filter: Omit<PropertyFilterRequest, 'page'>) => {
    return useInfiniteQuery({
        queryKey: [...propertyKeys.owner, filter],
        initialPageParam: 0,
        queryFn: ({ pageParam }: { pageParam: number }) =>
            PropertyService.getOwnerProperties({ ...filter, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasNext) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PropertyUpdate) => PropertyService.createProperty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.owner });
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
            toast.success("Property created successfully!");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to create property.");
        },
    });
};

export const useUpdateProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: PropertyUpdate }) =>
            PropertyService.updateProperty(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.owner });
            queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
            toast.success("Property updated successfully!");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to update property.");
        },
    });
};

export const useDeleteProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (propertyId: string) => PropertyService.deleteProperty(propertyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.owner });
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
            toast.success("Property deleted successfully!");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to delete property.");
        },
    });
};

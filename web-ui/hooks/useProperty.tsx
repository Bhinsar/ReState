import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services/properties/properties.Service";
import { PropertyFilterRequest } from "@/services/properties/properties.Interface";

export const useGetProperty = (filter: Omit<PropertyFilterRequest, 'page'>) => {
    return useInfiniteQuery({
        queryKey: ['properties', filter],
        initialPageParam: 0,
        queryFn: ({pageParam} : {pageParam: number}) => PropertyService.getAllProperties({ ...filter, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasNext) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        }
    });
}


export const useGetTrendingProperty = (filter: Omit<PropertyFilterRequest, 'page'>) => {
    return  useInfiniteQuery({
        queryKey: ['trending-properties', filter],
        initialPageParam: 0,
        queryFn: ({pageParam} : {pageParam: number}) => PropertyService.getTrendingProperties({ ...filter, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasNext) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        }
    });
}


export const useGetPropertyById = (propertyId: string) => {
    return useQuery({
        queryKey: ['property', propertyId],
        queryFn: () => PropertyService.getPropertyById(propertyId),
    });
}


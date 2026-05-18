import { useInfiniteQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services/properties/properties.Service";

export const useGetProperty = (limit: number) => {
    return useInfiniteQuery({
        queryKey: ['properties'],
        initialPageParam: 0,
        queryFn: ({pageParam} : {pageParam: number}) => PropertyService.getAllProperties(pageParam, limit),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasNext) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        }
    });
}


export const useGetTrendingProperty = (limit: number) => {
    return  useInfiniteQuery({
        queryKey: ['trending-properties'],
        initialPageParam: 0,
        queryFn: ({pageParam} : {pageParam: number}) => PropertyService.getTrendingProperties(pageParam, limit),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasNext) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        }
    });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "@/services/notifications/notification.Service";

export function useNotifications(enabled: boolean = true) {
  const queryClient = useQueryClient();

  // Query to fetch all notifications
  const {
    data: response,
    isLoading: isNotificationsLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getAllNotifications(),
    enabled,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5000,
  });

  // Query to fetch unread notification count
  const {
    data: unreadCount = 0,
    isLoading: isUnreadLoading,
  } = useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: () => NotificationService.unreadCount(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5000,
  });

  // Mutation to mark a single notification as read
  const readNotificationMutation = useMutation({
    mutationFn: (id: string) => NotificationService.readNotification(id),
    onSuccess: () => {
      // Invalidate both notifications list and unread count to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mutation to mark all notifications as read
  const readAllNotificationsMutation = useMutation({
    mutationFn: () => NotificationService.readAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = response?.data || [];

  return {
    notifications,
    unreadCount,
    isLoading: isNotificationsLoading || isUnreadLoading,
    error,
    readNotification: readNotificationMutation.mutate,
    isReading: readNotificationMutation.isPending,
    readAllNotifications: readAllNotificationsMutation.mutate,
    isReadingAll: readAllNotificationsMutation.isPending,
  };
}

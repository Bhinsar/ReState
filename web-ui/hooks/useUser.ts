import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/users/user.Service";
import { MediaService } from "@/services/media/media.Service";
import { UpdateUserReq } from "@/services/users/user.Interface";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "sonner";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const userKeys = {
    me: ['user', 'me'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useGetMe = () => {
    const storedAvatarUrl = useAuthStore((s) => s.user?.avatarUrl);

    return useQuery({
        queryKey: userKeys.me,
        queryFn: async () => {
            const data = await UserService.getMe();
            // Prefer the auth store's avatarUrl when it differs from the DB value
            // (workaround until backend persists avatarUrl updates to DB).
            const resolvedAvatarUrl =
                storedAvatarUrl && storedAvatarUrl !== data.avatarUrl
                    ? storedAvatarUrl
                    : data.avatarUrl;
            return { ...data, avatarUrl: resolvedAvatarUrl };
        },
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useUpdateMe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateUserReq) => UserService.updateMe(data),
        onSuccess: (updated) => {
            queryClient.setQueryData(userKeys.me, updated);
            toast.success("Profile updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to update profile");
        },
    });
};

export const useUploadAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ file, profile }: {
            file: File;
            profile: Awaited<ReturnType<typeof UserService.getMe>>;
        }) => {
            const media = await MediaService.uploadImage(file);
            const updated = await UserService.updateMe({
                firstName:   profile.firstName,
                lastName:    profile.lastName,
                phoneNumber: profile.phoneNumber,
                countryCode: profile.countryCode,
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(),
                avatarUrl:   media.secure_url,
            });
            // Always reflect the uploaded URL regardless of what the DB echoes back
            return { ...updated, avatarUrl: media.secure_url };
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(userKeys.me, updated);
            toast.success("Avatar updated");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to upload avatar");
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
            UserService.changePassword(currentPassword, newPassword),
        onSuccess: () => {
            toast.success("Password changed successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to change password. Check your current password.");
        },
    });
};

export const useDeleteMe = () => {
    return useMutation({
        mutationFn: () => UserService.deleteMe(),
        onSuccess: () => {
            toast.success("Account deleted");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Failed to delete account");
        },
    });
};

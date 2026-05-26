export const NOTIFICATION_ENDPOINTS = {
    GET_ALL: '/notifications',
    READ_ALL: '/notifications/read-all',
    READ_ONE: (id: string)=> `/notifications/${id}/read`,
    UNREAD_COUNT: '/notifications/unread-count'
}
export interface NotificationResponse{
    id:string,
    title:string,
    body:string,
    type:string,
    propertyId:string,
    propertyTitle:string,
    isRead:boolean,
    createdAt:string
}
    
export enum NotificationType {
        PROPERTY_INTEREST="PROPERTY_INTEREST",
        NEW_MESSAGE="NEW_MESSAGE",
        TRADE_REQUEST="TRADE_REQUEST",
        TRADE_ACCEPTED="TRADE_ACCEPTED",
        TRADE_REJECTED="TRADE_REJECTED",
        PROPERTY_APPROVED="PROPERTY_APPROVED",
        SYSTEM="SYSTEM"
    }
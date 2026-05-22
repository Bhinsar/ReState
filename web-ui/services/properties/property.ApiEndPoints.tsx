export enum propertyApiEndPoints {
    GET_ALL_PROPERTIES = '/properties',
    GET_PROPERTY_BY_ID = '/properties',
    CREATE_PROPERTY = '/properties',
    UPDATE_PROPERTY = '/properties/{id}',
    DELETE_PROPERTY = '/properties/{id}',    
    GET_PROPERTIES_BY_USER = '/properties/me',    
    GET_TRENDING_PROPERTIES = '/properties/trending',
    GET_MY_METRICS = '/properties/me/metrics',
}
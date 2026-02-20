const APP_NAME = 'Timora Live Chat'
const COMPANY_NAME = 'JAF Digital Group Inc.'
const API_URL = import.meta.env.VITE_MODE === 'production'
    ? (import.meta.env.VITE_APP_API_URL_PROD || '')
    : import.meta.env.VITE_APP_API_URL_DEV;

const SOCKET_URL = import.meta.env.VITE_MODE === 'production'
    ? (import.meta.env.VITE_SOCKET_URL || '')
    : (import.meta.env.VITE_SOCKET_URL);

const ROLES = {
    CENTRAL_ADMIN: {
        label: 'Central Admin',
        value: 'CENTRAL_ADMIN'
    },
    CUSTOMER_SUPPORT: {
        label: 'Customer Support',
        value: 'CUSTOMER_SUPPORT'
    },
    CUSTOMER: {
        label: 'Customer',
        value: 'CUSTOMER'
    },
}

export {
    APP_NAME,
    ROLES,
    COMPANY_NAME,
    API_URL,
    SOCKET_URL
}
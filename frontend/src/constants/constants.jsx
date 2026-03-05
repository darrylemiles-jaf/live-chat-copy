const APP_NAME = 'Timora Live Chat'

const COMPANY_URL = import.meta.env.VITE_MODE === 'production'
    ? (import.meta.env.VITE_APP_COMPANY_URL_PROD || '')
    : (import.meta.env.VITE_APP_COMPANY_URL_DEV || '')

const COMPANY_NAME = 'JAF Digital Group Inc.'

const API_URL = import.meta.env.VITE_MODE === 'production'
    ? (import.meta.env.VITE_APP_API_URL_PROD || '')
    : import.meta.env.VITE_APP_API_URL_DEV;

const SOCKET_URL = import.meta.env.VITE_MODE === 'production'
    ? (import.meta.env.VITE_SOCKET_URL_PROD || '')
    : (import.meta.env.VITE_SOCKET_URL_DEV);

const ROLES = {
    CENTRAL_ADMIN: {
        label: 'Admin',
        value: 'admin'
    },
    CUSTOMER_SUPPORT: {
        label: 'Customer Support',
        value: 'support'
    },
    CLIENT: {
        label: 'Client',
        value: 'client'
    },
}

export {
    APP_NAME,
    ROLES,
    COMPANY_NAME,
    COMPANY_URL,
    API_URL,
    SOCKET_URL
}
const Env = {
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    DEBUG: process.env.EXPO_PUBLIC_DEBUG==="true",
    DEBUG_FORCE_LOGIN_QR: process.env.EXPO_PUBLIC_DEBUG_FORCE_LOGIN_QR,
};

export default Env;
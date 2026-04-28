import CryptoJS from "crypto-js";

const SECRET_KEY =
    process.env.NEXT_PUBLIC_SECRET_KEY || "your-fallback-secret-key";

export const secureStorage = {
    // 1. Encrypt and Save
    setItem: (key: string, value: any) => {
        if (typeof window === "undefined") return; // Guard for server-side

        if (!SECRET_KEY) {
            console.warn(
                "SecureStorage: SECRET_KEY is not defined. Data will not be encrypted properly."
            );
            return;
        }

        try {
            // Encrypt the value
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(value),
                SECRET_KEY
            ).toString();

            // Save to local storage
            localStorage.setItem(key, encrypted);
        } catch (error) {
            console.error("Encryption error:", error);
        }
    },

    // 2. Decrypt and Read
    getItem: (key: string) => {
        if (typeof window === "undefined") return null;

        if (!SECRET_KEY) {
            console.warn("SecureStorage: SECRET_KEY is missing, cannot decrypt.");
            return null;
        }

        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;

            // Decrypt the value
            const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
                // Handle case where decryption fails (unavailable key or bad data)
                return null;
            }

            return JSON.parse(decrypted);
        } catch (error) {
            console.warn(
                "SecureStorage: Decryption failed for key:",
                key,
                "clearing item."
            );
            localStorage.removeItem(key); // Clear invalid data
            return null;
        }
    },

    // 3. Remove Item
    removeItem: (key: string) => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(key);
        }
    },

    clear: () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
        }
    },
};

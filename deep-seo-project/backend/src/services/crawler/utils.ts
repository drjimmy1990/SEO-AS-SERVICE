import { URL } from 'url';

export const normalizeUrl = (url: string): string => {
    try {
        const parsed = new URL(url);
        // Remove hash
        parsed.hash = '';
        // Normalize trailing slash: remove it for consistency
        let normalized = parsed.toString();
        if (normalized.endsWith('/') && normalized.length > 1) {
            normalized = normalized.slice(0, -1);
        }
        return normalized;
    } catch (e) {
        return url; // Return original if parsing fails (caller handles validation)
    }
};

export const isInternalLink = (url: string, baseDomain: string): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.hostname === baseDomain || parsed.hostname.endsWith(`.${baseDomain}`);
    } catch (e) {
        return false;
    }
};

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

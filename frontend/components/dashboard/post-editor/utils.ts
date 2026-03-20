export const normalizeUrl = (url: string) => {
    if (!url) return "";
    // If it starts with / or has a protocol, return as is
    if (url.startsWith('/') || /^[a-z]+:\/\//i.test(url)) {
        return url;
    }
    // Otherwise add https://
    return `https://${url}`;
};

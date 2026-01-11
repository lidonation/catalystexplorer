/**
 * Converts catalyst ID from old format to new format: id.catalyst://cardano/{hash}
 */
function convertCatalystIdFormat(catalystId: string): string {
    if (!catalystId) return '';
    
    // Check if it's already in the new format
    if (catalystId.startsWith('id.catalyst://cardano/')) {
        return catalystId;
    }
    
    // Parse the old format: id.catalyst://Name@cardano/hash/version/index
    const match = catalystId.match(/id\.catalyst:\/\/(.+?)@cardano\/([^/]+)(?:\/.*)?/);
    
    if (match) {
        const [, , hash] = match;
        return `id.catalyst://cardano/${hash}`;
    }
    
    // If it doesn't match expected pattern, return as is
    return catalystId;
}

/**
 * Formats a catalyst ID for display by converting to new format, decoding HTML entities and truncating if necessary
 */
export function formatCatalystId(catalystId: string, maxLength?: number): string {
    if (!catalystId) return '';
    
    // Convert to new format first
    const converted = convertCatalystIdFormat(catalystId);
    
    // Decode HTML entities if present
    const decoded = decodeHtmlEntities(converted);
    
    // If maxLength is specified, truncate and add ellipsis
    if (maxLength && decoded.length > maxLength) {
        return decoded.substring(0, maxLength) + '...';
    }
    
    return decoded;
}

/**
 * Decodes HTML entities in a string
 */
function decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Formats catalyst ID with visual separators for better readability
 */
export function formatCatalystIdWithSeparators(catalystId: string, chunkSize = 8): string {
    const formatted = formatCatalystId(catalystId);
    
    // Add separators every chunkSize characters for better readability
    return formatted.replace(new RegExp(`(.{${chunkSize}})`, 'g'), '$1 ').trim();
}

/**
 * Returns the display version (truncated) and full version of catalyst ID
 */
export function getCatalystIdDisplayData(catalystId: string): {
    displayText: string;
    fullText: string;
    isLong: boolean;
} {
    const fullText = formatCatalystId(catalystId);
    const isLong = fullText.length > 32;
    const displayText = isLong ? formatCatalystId(catalystId, 32) : fullText;
    
    return {
        displayText,
        fullText,
        isLong
    };
}
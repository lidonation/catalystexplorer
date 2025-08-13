/**
 * Get the UUID identifier from a data object
 */
export function getUuid(data: { uuid: string }): string {
    return data.uuid;
}

/**
 * Check if the given ID is a UUID format
 */
export function isUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Check if the given ID is a hash format (encoded by HashIdService)
 */
export function isHash(id: string): boolean {
    return !isUuid(id) && id.length > 0;
}

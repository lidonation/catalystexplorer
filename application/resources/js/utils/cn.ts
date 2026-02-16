import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function for merging class names with clsx
 * @param inputs - Class names to merge
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}
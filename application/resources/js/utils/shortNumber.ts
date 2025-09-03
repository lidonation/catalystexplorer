export function shortNumber(value?: number | null, digits = 0) {
    if (!value) {
        return '0';
    }
    if (typeof value == 'string') {
        value = parseFloat(value);
    }
    if (Math.abs(value) >= 1_000_000_000_000) {
        return (value / 1_000_000_000_000).toFixed(digits) + 'T';
    }
    if (Math.abs(value) >= 1_000_000_000) {
        return (value / 1_000_000_000).toFixed(digits) + 'B';
    }
    if (Math.abs(value) >= 1_000_000) {
        return (value / 1_000_000).toFixed(digits) + 'M';
    }
    if (Math.abs(value) >= 1_000) {
        return (value / 1_000).toFixed(digits) + 'k';
    }

    return value.toFixed(digits);
}

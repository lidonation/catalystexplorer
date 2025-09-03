export const adaFormat = (value: any): string => {
    if (value === undefined || value === null) return ' ';

    try {
        const numValue = Number(value);
        if (Number.isNaN(numValue)) return ' ';

        const adaValue = numValue / 1000000;
        const formattedValue = Math.floor(adaValue).toLocaleString();
        return `${formattedValue} ADA`;
    } catch (e) {
        console.error('Error formatting voting power:', e);
        return ' ';
    }
};

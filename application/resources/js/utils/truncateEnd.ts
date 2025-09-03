export const truncateEnd = (text: string | undefined, maxLength: number) => {
    if (!text) return '';

    if (text.length <= maxLength) {
        return text;
    }

    const truncateLength = maxLength - 3;

    return `${text.substring(0, truncateLength)}...`;
};

const maxLabelLength = 20;

export const truncateMiddle = (
    text: string,
    maxLength: number = maxLabelLength,
    startChars: number = 6,
    endChars: number = 6,
) => {
    if (!text) return '';

    if (text.length <= maxLength) {
        return text;
    }

    if (maxLength < startChars + endChars + 6) {
        const charsPerSide = Math.floor(maxLength - 6);
        startChars = charsPerSide;
        endChars = charsPerSide;
    }

    return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`;
};

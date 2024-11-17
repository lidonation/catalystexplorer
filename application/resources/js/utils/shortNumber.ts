export function shortNumber(value: number|null, digits = 0, locale: string = 'en-US') {
    // Nine Zeroes for Billions
    return Math.abs(Number(value)) >= 1.0e+9

        ? (Math.abs(Number(value)) / 1.0e+9).toFixed(digits) + "B"
        // Six Zeroes for Millions
        : Math.abs(Number(value)) >= 1.0e+6

            ? (Math.abs(Number(value)) / 1.0e+6).toFixed(digits) + "M"
            // Three Zeroes for Thousands
            : Math.abs(Number(value)) >= 1.0e+3

                ? (Math.abs(Number(value)) / 1.0e+3).toFixed(digits) + "K"

                : Math.abs(Number(value));
}

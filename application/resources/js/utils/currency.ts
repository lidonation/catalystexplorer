import { shortNumber } from "./shortNumber";

export function currency(value: number, currency: string = 'USD', locale: string = 'en-US', maximumFractionDigits = 0) {
    if (typeof value !== "number") {
        return value;
    }
    switch (currency) {
        case 'ADA':
            return shortNumber(value, maximumFractionDigits, locale) + ' ₳';
        case 'NO_CURRENCY':
            return value;
        default:
            const formatter = new Intl.NumberFormat(locale, {
                style: 'currency',
                notation: 'compact',
                currency,
                maximumFractionDigits
            });
            return formatter.format(value);
        default:
            return shortNumber(value, maximumFractionDigits, locale).toString();
    }
}

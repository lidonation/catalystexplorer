import { shortNumber } from './shortNumber';

export function currency(
    value: number,
    maximumFractionDigits = 2,
    currency: string = 'USD',
    locale: string = 'en-US',
) {
    switch (currency) {
        case 'ADA':
            return shortNumber(value, maximumFractionDigits) + ' ₳';
        case 'NO_CURRENCY':
            return value;
        default:
            const formatter = new Intl.NumberFormat(locale, {
                style: 'currency',
                notation: 'compact',
                currency,
                maximumFractionDigits,
            });
            return formatter.format(value);
    }
}

export function currencySymbol(currency: string) {
    switch (currency.toUpperCase()) {
        case 'USD':
        case 'USDM':
            return '$';
        case 'ADA':
            return '₳';
        default:
            return '$';
    }
}

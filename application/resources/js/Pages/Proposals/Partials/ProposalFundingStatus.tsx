import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function ProposalFundingStatus({ funding_status = 'pending' }) {
    const { t } = useLaravelReactI18n();
    let bgColor = '';
    let textColor = '';
    let status = '';

    if (funding_status === 'pending') {
        bgColor = '';
        textColor = '';
        status = t('funding.status.pending');
    } else if (funding_status === 'withdrawn') {
        bgColor = '';
        textColor = '';
        status = t('funding.status.withdrawn');
    } else if (funding_status === 'complete') {
        bgColor = 'bg-success-light';
        textColor = 'text-success';
        status = t('funding.status.fullyPaid');
    } else if (funding_status === 'funded') {
        bgColor = 'bg-eye-logo';
        textColor = 'text-primary';
        status = t('funding.status.funded');
    } else if (funding_status === 'leftover') {
        bgColor = 'bg-eye-logo';
        textColor = 'text-primary';
        status = t('funding.status.funded');
    }
    if (
        funding_status === 'not_approved' ||
        funding_status === 'over_budget' ||
        !funding_status
    ) {
        bgColor = '';
        textColor = '';
        status = t('funding.status.notFunded');
    }

    return (
        <span
            className={`inline-flex items-center justify-center rounded-md border px-1 py-0 text-xs ${textColor} ${bgColor}`}
            data-testid={`proposal-funding-status-${funding_status}`}
        >
            {status}
        </span>
    );
}

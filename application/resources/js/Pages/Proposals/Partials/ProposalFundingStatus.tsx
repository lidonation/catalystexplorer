export default function ProposalFundingStatus({ funding_status = 'pending' }) {
    let bgColor = '';
    let textColor = '';
    let status = '';

    if (funding_status === 'pending') {
        bgColor = '';
        textColor = '';
        status = 'Pending';
    } else if (funding_status === 'withdrawn') {
        bgColor = '';
        textColor = '';
        status = 'Withdrawn';
    } else if (funding_status === 'complete') {
        bgColor = 'bg-success-light';
        textColor = 'text-success';
        status = 'Fully Paid';
    } else if (funding_status === 'funded') {
        bgColor = 'bg-eye-logo';
        textColor = 'text-primary';
        status = 'Funded';
    } else if (funding_status === 'leftover') {
        bgColor = 'bg-eye-logo';
        textColor = 'text-primary';
        status = 'Funded';
    }
    if (
        funding_status === 'not_approved' ||
        funding_status === 'over_budget' ||
        !funding_status
    ) {
        bgColor = '';
        textColor = '';
        status = 'Not Funded';
    }

    return (
        <span
            className={`rounded-md border px-1 py-0 text-xs inline-flex items-center justify-center ${textColor} ${bgColor}`}
        >
            {status}
        </span>
    );
}

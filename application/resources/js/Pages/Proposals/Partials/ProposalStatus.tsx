export default function ProposalStatus({
    status = 'pending',
    funding_status = 'funded',
}: {
    status: null | string;
    funding_status: undefined | string;
}) {
    let statusColor = '';
    let projectStatus = '';

    if (status === 'pending') {
        statusColor = 'bg-primary';
        projectStatus = 'Vote Pending';
    } else if (funding_status === 'withdrawn') {
        statusColor = 'bg-light';
        projectStatus = 'Withdrawn';
    } else if (status === 'complete') {
        statusColor = 'bg-success';
        projectStatus = 'Complete';
    } else if (status === 'in_progress') {
        statusColor = 'bg-primary';
        projectStatus = 'In progress';
    } else if (status === 'unfunded') {
        statusColor = 'bg-accent-secondary';
        projectStatus = 'Unfunded';
    }

    return (
        <span className="bg-background text-content inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm">
            <span className={`size-2 rounded-full ${statusColor}`}></span>
            {projectStatus}
        </span>
    );
}

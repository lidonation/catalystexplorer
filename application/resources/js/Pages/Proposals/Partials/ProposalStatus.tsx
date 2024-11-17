export default function ProposalStatus({
    status = 'pending',
    funding_status = 'funded',
}) {
    let statusColor = '';
    let projectStatus = '';

    if (status === 'pending') {
        statusColor = 'bg-primary';
        projectStatus = 'Vote Pending';
    } else if (status === 'complete') {
        statusColor = 'bg-success';
        projectStatus = 'Complete';
    } else if (status === 'in_progress') {
        statusColor = 'bg-primary';
        projectStatus = 'In progress';
    } else if (!['funded', 'leftover'].includes(funding_status)) {
        statusColor = 'bg-accent-secondary';
        projectStatus = 'Unfunded';
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-background px-2 py-1 text-sm text-content">
            <span className={`size-2 rounded-full ${statusColor}`}></span>
            {projectStatus}
        </span>
    );
}

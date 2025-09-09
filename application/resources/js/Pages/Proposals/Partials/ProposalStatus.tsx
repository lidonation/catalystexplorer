import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function ProposalStatus({
    status = 'pending',
    funding_status = 'funded',
}: {
    status: null | string;
    funding_status: undefined | string;
}) {
    const { t } = useLaravelReactI18n();
    let statusColor = '';
    let projectStatus = '';

    if (status === 'pending') {
        statusColor = 'bg-primary';
        projectStatus = t('project.status.votePending');
    } else if (funding_status === 'withdrawn') {
        statusColor = 'bg-light';
        projectStatus = t('project.status.withdrawn');
    } else if (status === 'complete') {
        statusColor = 'bg-success';
        projectStatus = t('project.status.complete');
    } else if (status === 'in_progress') {
        statusColor = 'bg-primary';
        projectStatus = t('project.status.inProgress');
    } else if (status === 'unfunded') {
        statusColor = 'bg-accent-secondary';
        projectStatus = t('project.status.unfunded');
    }

    return (
        <span className="bg-background text-content inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm">
            <span className={`size-2 rounded-full ${statusColor}`}></span>
            {projectStatus}
        </span>
    );
}

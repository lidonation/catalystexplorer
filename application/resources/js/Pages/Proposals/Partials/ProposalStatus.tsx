export default function ProposalStatus({ status = 'pending' }) {
    let statusColor;

    return (
        <span className="inline-flex items-center rounded-full bg-background px-2 py-1 text-sm text-content">
            <span className={`size-2 rounded-full`}></span>
            <span
                className="mr-1.5 h-1.5 w-1.5 rounded-full bg-background "
                aria-hidden="true"
            ></span>
            {status}
        </span>
    );
}

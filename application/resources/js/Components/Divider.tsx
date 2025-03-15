import { PageProps } from '@/types';

interface DividerPageProps extends Record<string, unknown> {
    className?: string;
    dotted?: boolean;
}

export default function Divider({
    className,
    dotted = false,
}: PageProps<DividerPageProps>) {
    if (dotted) {
        return (
            <hr className="border-content-light my-2 border-t-2 border-dotted" />
        );
    }
    return <hr className={`border-content-light my-2 border-t ${className}`} />;
}

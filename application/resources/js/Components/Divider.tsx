import { PageProps } from '@/types';

interface DividerPageProps extends Record<string, unknown> {
    className?: string;
}

export default function Divider({ className }: PageProps<DividerPageProps>) {
    return <hr className={`border-content-light my-2 border-t ${className}`} />;
}

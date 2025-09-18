import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SecondaryLink from '@/Components/SecondaryLink';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { router } from '@inertiajs/react';
import Content from '../Partials/WorkflowContent';
import WorkflowLayout from '../WorkflowLayout';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

interface SuccessProps {
    bookmarkCollection: BookmarkCollectionData;
}

export default function Success({ bookmarkCollection }: SuccessProps) {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    
    const myListsRoute = localizedRoute('my.lists.index');
    const manageListRoute = localizedRoute('my.lists.manage', {
        bookmarkCollection: bookmarkCollection.id,
    });

    return (
        <WorkflowLayout
            title="Accept Invitation"
            asideInfo=""
        >
            <Content>
                <div className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded p-8 md:w-3/4 md:shadow-sm">
                        <Title level="4" className="mx-4 text-center font-bold">
                            Invitation Accepted!
                        </Title>
                        <VerificationBadge size={80} />
                        <Paragraph
                            size="sm"
                            className="text-gray-persist mt-4 text-center max-w-md"
                        >
                            You have successfully joined "{bookmarkCollection.title}". 
                            You can now contribute to this bookmark collection.
                        </Paragraph>

                        <div className="flex flex-col gap-3 w-full max-w-md mt-6">
                            <PrimaryLink
                                href={manageListRoute}
                                className="w-full text-sm lg:px-8 lg:py-3 text-center"
                            >
                                <span>Manage This List</span>
                            </PrimaryLink>
                            
                            <SecondaryLink
                                href={myListsRoute}
                                className="w-full text-sm lg:px-8 lg:py-3"
                            >
                                <span>See My Lists</span>
                            </SecondaryLink>
                        </div>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
}
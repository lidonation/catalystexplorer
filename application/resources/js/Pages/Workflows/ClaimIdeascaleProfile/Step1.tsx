import { ProfileWorkflowProps } from '@/Pages/CompletedProjectNfts/Partials/ProfileWorkflow.jsx';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import { SearchParams } from '../../../../types/search-params';
import WorkflowLayout from '../WorkflowLayout';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import ProfileList from '@/Pages/CompletedProjectNfts/Partials/ProfileList';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Content } from '@radix-ui/react-popover';
import { t } from 'i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';

const Step1: React.FC<ProfileWorkflowProps & { filters: SearchParams }> = (
    props: ProfileWorkflowProps & { filters: SearchParams },
) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    return (
        <WorkflowLayout asideInfo="">
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
              
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={activeStep == 1}
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryLink
                    href={!selectedProfiles.length ? '' : nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={!selectedProfiles.length}
                    onClick={(e) =>
                        !selectedProfiles.length && e.preventDefault()
                    }
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step1;

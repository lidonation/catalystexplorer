import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import { useEffect } from 'react';
import CatalystProfileForm from './Partials/CatalystProfileForm';
import ErrorComponent from './Partials/Error';

interface SuccessStepProps {
    stepDetails: any[];
    activeStep: number;
    catalystProfile: App.DataTransferObjects.CatalystProfileData
    catalystId?: string;
    stakeAddress?: string;
}

export default function Error({
    stepDetails,
    activeStep,
    catalystProfile,
    stakeAddress,
    catalystId
}: SuccessStepProps) {
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.drepSignUp.index', {
        step: activeStep - 1,
    });

    // const nextStep = localizedRoute('workflows.drepSignUp.index', {
    //     step: activeStep + 1,
    //     catalystDrep,
    // });
    useEffect(()=>{
        console.log(catalystId);
        console.log(stakeAddress);
    })

    const { t } = useLaravelReactI18n();

    return (
        <WorkflowLayout
            title="Claim Catalyst Profile"
            asideInfo={stepDetails[activeStep - 1]?.info || ''}
            disclaimer={t('workflows.voterList.prototype')}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                    {
                        catalystProfile ? (
                            <CatalystProfileForm catalystProfile={catalystProfile} />
                        ): (
                            <ErrorComponent/>
                        )
                    }
                </div>
            </Content>
            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                {/* <PrimaryLink
                    href={nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <span>{t('profileWorkflow.next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink> */}
            </Footer>
        </WorkflowLayout>
    );
}

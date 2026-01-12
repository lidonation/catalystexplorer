import XIcon from "@/Components/svgs/XIcon";
import ShareButton from "./ShareButton";
import FacebookIcon from "@/Components/svgs/FacebookIcon";
import LinkedInIcon from "@/Components/svgs/LinkedInIcons";
import { useLaravelReactI18n } from "laravel-react-i18n";

interface ShareButtonsBarProps {
    proposalUrl: string;
    proposalTitle: string;
    customMessage?: string;
}

export default function ShareButtonsBar({
    proposalUrl,
    proposalTitle,
    customMessage,
}: ShareButtonsBarProps) {
    const { t } = useLaravelReactI18n();

    const encodedUrl = encodeURIComponent(proposalUrl);

    const handleTwitterShare = () => {
        window.open(
            `https://twitter.com/intent/tweet?url=${encodedUrl}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleFacebookShare = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleLinkedInShare = () => {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    return (
        <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-semibold text-content">
                {t('shareCard.shareOn')}
            </h3>
            <div className="flex flex-col gap-2.5 sm:flex-row">
                <ShareButton
                    icon={<XIcon width={20} height={20} />}
                    label="X (Twitter)"
                    onClick={handleTwitterShare}
                    bgColor="bg-social-twitter"
                />
                <ShareButton
                    icon={<FacebookIcon width={20} height={20} />}
                    label="Facebook"
                    onClick={handleFacebookShare}
                    bgColor="bg-social-facebook"
                />
                <ShareButton
                    icon={<LinkedInIcon width={20} height={20} />}
                    label="LinkedIn"
                    onClick={handleLinkedInShare}
                    bgColor="bg-social-linkedin"
                />
            </div>
        </div>
    );
}

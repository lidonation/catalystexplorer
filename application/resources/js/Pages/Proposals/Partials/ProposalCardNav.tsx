export default function ProposalCardNav({
    quickPitchView,
    toggleLocalQuickPitchView,
    hasQuickPitch,
    t,
}: {
    quickPitchView: boolean;
    toggleLocalQuickPitchView: (view: boolean) => void;
    hasQuickPitch: boolean;
    t: (key: string) => string;
}) {
    return (
        <nav className="border-b" aria-label="Project details navigation">
            <ul className="flex justify-between">
                <li className="w-1/2">
                    <button
                        type="button"
                        onClick={() => toggleLocalQuickPitchView(false)}
                        className={`w-full border-b-2 pb-3 font-semibold ${!quickPitchView ? 'border-primary text-primary' : 'border-transparent text-content'
                            }`}
                    >
                        {t('details')}
                    </button>
                </li>
                <li className="flex w-1/2 items-center justify-center">
                    <button
                        type="button"
                        onClick={() => toggleLocalQuickPitchView(true)}
                        disabled={!hasQuickPitch}
                        className={`flex items-center gap-1 pb-3 font-semibold ${quickPitchView ? 'border-b-2 border-primary text-primary' : 'border-transparent'
                            } ${!hasQuickPitch ? 'cursor-not-allowed opacity-60' : 'text-content hover:text-primary'}`}
                    >
                        <span>{t('proposals.quickPitch')}</span>
                        {!hasQuickPitch && (
                            <span className="text-dark-persist rounded-full bg-content-light px-2 py-1 text-xs">
                                {t('notSet')}
                            </span>
                        )}
                    </button>
                </li>
            </ul>
        </nav>
    );
};

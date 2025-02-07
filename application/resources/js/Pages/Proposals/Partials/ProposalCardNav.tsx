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
                        className={`w-full border-b-2 pb-3 font-semibold ${
                            !quickPitchView
                                ? 'border-primary text-primary'
                                : 'text-content border-transparent'
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
                        className={`flex items-center gap-1 pb-3 font-semibold ${
                            quickPitchView
                                ? 'border-primary text-primary border-b-2'
                                : 'border-transparent'
                        } ${!hasQuickPitch ? 'cursor-not-allowed opacity-60' : 'text-content hover:text-primary'}`}
                    >
                        <span>{t('proposals.quickPitch')}</span>
                        {!hasQuickPitch && (
                            <span className="text-dark-persist bg-content-light rounded-full px-2 py-1 text-xs">
                                {t('notSet')}
                            </span>
                        )}
                    </button>
                </li>
            </ul>
        </nav>
    );
}

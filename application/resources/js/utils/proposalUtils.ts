import ProposalData = App.DataTransferObjects.ProposalData;

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


export function randomizeQuickPitches(proposals: ProposalData[]): ProposalData[] {
    if (!proposals || proposals.length === 0) {
        return [];
    }
    
    return shuffleArray(proposals);
}


import ProposalData = App.DataTransferObjects.ProposalData;

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function categorizeQuickPitches(
    proposals: ProposalData[], 
    featuredCount: number = 3
): { featured: ProposalData[]; regular: ProposalData[] } {
    if (!proposals || proposals.length === 0) {
        return { featured: [], regular: [] };
    }

    if (proposals.length < featuredCount) {
        return {
            featured: [],
            regular: shuffleArray(proposals),
        };
    }

    const shuffledProposals = shuffleArray(proposals);

    const featured = shuffledProposals.slice(0, featuredCount);
    const regular = shuffledProposals.slice(featuredCount);

    return {
        featured: shuffleArray(featured),
        regular: shuffleArray(regular),  
    };
}

export function randomizeQuickPitches(proposals: ProposalData[]): ProposalData[] {
    if (!proposals || proposals.length === 0) {
        return [];
    }
    
    return shuffleArray(proposals);
}

export interface QuickPitchLayoutItem {
    proposal: ProposalData;
    type: 'featured' | 'regular';
    gridSpan: number;
}

type RowPattern = 'featured-regular' | 'regular-regular-regular' | 'regular-featured';

export function createMixedQuickPitchLayout(
    featured: ProposalData[], 
    regular: ProposalData[]
): QuickPitchLayoutItem[] {
    if (!featured.length && !regular.length) {
        return [];
    }

    const featuredItems: QuickPitchLayoutItem[] = featured.map(proposal => ({
        proposal,
        type: 'featured' as const,
        gridSpan: 2
    }));

    const regularItems: QuickPitchLayoutItem[] = regular.map(proposal => ({
        proposal,
        type: 'regular' as const,
        gridSpan: 1
    }));

    const allItems = [...featuredItems, ...regularItems];
    return shuffleArray(allItems);
}

export function organizeQuickPitchRows(
    mixedItems: QuickPitchLayoutItem[]
): QuickPitchLayoutItem[][] {
    if (mixedItems.length === 0) {
        return [];
    }

    const featuredItems = mixedItems.filter(item => item.type === 'featured');
    const regularItems = mixedItems.filter(item => item.type === 'regular');
    
    const rows: QuickPitchLayoutItem[][] = [];
    let featuredIndex = 0;
    let regularIndex = 0;

    const getAvailablePatterns = (): RowPattern[] => {
        const available: RowPattern[] = [];
        
        if (featuredIndex < featuredItems.length && regularIndex < regularItems.length) {
            available.push('featured-regular');
        }
        
        if (regularIndex + 2 < regularItems.length) {
            available.push('regular-regular-regular');
        }
        
        if (regularIndex < regularItems.length && featuredIndex < featuredItems.length) {
            available.push('regular-featured');
        }
        
        return available;
    };

    while (featuredIndex < featuredItems.length || regularIndex < regularItems.length) {
        const availablePatterns = getAvailablePatterns();
        
        if (availablePatterns.length === 0) {
            let row: QuickPitchLayoutItem[] = [];
            
            if (featuredIndex < featuredItems.length) {
                row.push(featuredItems[featuredIndex]);
                featuredIndex++;
            } else if (regularIndex < regularItems.length) {
                row.push(regularItems[regularIndex]);
                regularIndex++;
            }
            
            if (row.length > 0) {
                rows.push(row);
            }
            continue;
        }
        
        const randomIndex = Math.floor(Math.random() * availablePatterns.length);
        const currentPattern = availablePatterns[randomIndex];
        let row: QuickPitchLayoutItem[] = [];
        let canCreateRow = false;

        switch (currentPattern) {
            case 'featured-regular':
                if (featuredIndex < featuredItems.length && regularIndex < regularItems.length) {
                    row = [featuredItems[featuredIndex], regularItems[regularIndex]];
                    featuredIndex++;
                    regularIndex++;
                    canCreateRow = true;
                } else if (regularIndex + 2 < regularItems.length) {
                    row = [
                        regularItems[regularIndex],
                        regularItems[regularIndex + 1],
                        regularItems[regularIndex + 2]
                    ];
                    regularIndex += 3;
                    canCreateRow = true;
                }
                break;

            case 'regular-regular-regular':
                if (regularIndex + 2 < regularItems.length) {
                    row = [
                        regularItems[regularIndex],
                        regularItems[regularIndex + 1],
                        regularItems[regularIndex + 2]
                    ];
                    regularIndex += 3;
                    canCreateRow = true;
                } else if (featuredIndex < featuredItems.length && regularIndex < regularItems.length) {
                    row = [featuredItems[featuredIndex], regularItems[regularIndex]];
                    featuredIndex++;
                    regularIndex++;
                    canCreateRow = true;
                }
                break;

            case 'regular-featured':
                if (regularIndex < regularItems.length && featuredIndex < featuredItems.length) {
                    row = [regularItems[regularIndex], featuredItems[featuredIndex]];
                    regularIndex++;
                    featuredIndex++;
                    canCreateRow = true;
                } else if (regularIndex + 2 < regularItems.length) {
                    row = [
                        regularItems[regularIndex],
                        regularItems[regularIndex + 1],
                        regularItems[regularIndex + 2]
                    ];
                    regularIndex += 3;
                    canCreateRow = true;
                }
                break;
        }

        if (canCreateRow && row.length > 0) {
            rows.push(row);
        }
    }

    return rows;
}


export interface PaymentScheduleItem {
    amount: number;
    monthOffset: number;
    type: 'initial' | 'operational' | 'holdback' | 'final';
}

export interface MilestonePaymentSchedule {
    milestoneNumber: number;
    milestoneCost: number;
    statedDeliveryMonth: number;
    payments: PaymentScheduleItem[];
    totalPayment: number;
}

export interface UpcomingPaymentResult {
    amount: number;
    date: string;
    breakdown: PaymentScheduleItem[];
    milestoneNumber: number;
}


const hasMilestonePoaSignoff = (milestone: App.DataTransferObjects.MilestoneData): boolean => {
    if (!milestone.poas || !Array.isArray(milestone.poas)) return false;
    
    for (const poa of milestone.poas) {
        if (poa.signoffs && Array.isArray(poa.signoffs) && poa.signoffs.length > 0) {
            return true;
        }
    }
    return false;
};


export const getUpcomingPaymentData = (proposal: App.DataTransferObjects.ProposalData): UpcomingPaymentResult | null => {
    const schedule = proposal?.schedule;
    const startDateStr = schedule?.starting_date;
    const milestones = schedule?.milestones ?? [];
    const fundsDistributed = schedule?.funds_distributed ?? 0;
    const budget = schedule?.budget ?? 0;
    
    if (!startDateStr || milestones.length === 0) return null;
    

    if (fundsDistributed >= budget) return null;
    
   
    const milestoneMap = new Map<number, App.DataTransferObjects.MilestoneData>();
    
    for (const m of milestones) {
        milestoneMap.set(m.milestone, m);
    }

    const milestoneSignoffs = new Map<number, boolean>();
    
    for (const m of milestones) {
        const currentVersion = milestoneMap.get(m.milestone);
    
        if (currentVersion && m.cost === currentVersion.cost && hasMilestonePoaSignoff(m)) {
            milestoneSignoffs.set(m.milestone, true);
        }
    }
    

    const sortedMilestones = Array.from(milestoneMap.values()).sort((a, b) => a.milestone - b.milestone);
    const totalMilestones = sortedMilestones.length;
    
   
    const hasSignoff = (milestoneNum: number): boolean => milestoneSignoffs.get(milestoneNum) ?? false;
    
    const HOLDBACK_RATE = 0.20;
    const OPERATIONAL_RATE = 0.80;
    
    let totalUnlocked = 0;
    const breakdown: PaymentScheduleItem[] = [];
    
    
    const m1 = sortedMilestones[0];
    const m1Operational = m1.cost * OPERATIONAL_RATE;
    totalUnlocked += m1Operational;
    breakdown.push({
        amount: m1Operational,
        monthOffset: 0,
        type: 'initial'
    });
    
   
    for (let i = 0; i < totalMilestones; i++) {
        const currentMilestone = sortedMilestones[i];
        const nextMilestone = i + 1 < totalMilestones ? sortedMilestones[i + 1] : null;
        const isNextFinal = i + 1 === totalMilestones - 1;
        const currentHasSignoff = hasSignoff(currentMilestone.milestone);
    
        
        if (currentHasSignoff) {
         
            const holdback = currentMilestone.cost * HOLDBACK_RATE;
            totalUnlocked += holdback;
            breakdown.push({
                amount: holdback,
                monthOffset: 0,
                type: 'holdback'
            });
            
            if (nextMilestone) {
                if (isNextFinal) {
                    if (hasSignoff(nextMilestone.milestone)) {
                        totalUnlocked += nextMilestone.cost;
                        breakdown.push({
                            amount: nextMilestone.cost,
                            monthOffset: 0,
                            type: 'final'
                        });
                    }
                } else {
                    const nextOperational = nextMilestone.cost * OPERATIONAL_RATE;
                    totalUnlocked += nextOperational;
                    breakdown.push({
                        amount: nextOperational,
                        monthOffset: 0,
                        type: 'operational'
                    });
                }
            }
        }
    }
    
    const upcomingPayment = totalUnlocked - fundsDistributed;
    
    if (upcomingPayment <= 0) return null;
    
    const paymentDate = new Date();
    
    return {
        amount: Math.round(upcomingPayment * 100) / 100,
        date: paymentDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }),
        breakdown: breakdown.filter(b => b.amount > 0),
        milestoneNumber: sortedMilestones[totalMilestones - 1]?.milestone ?? 1
    };
};


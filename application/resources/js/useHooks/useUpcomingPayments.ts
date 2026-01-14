
export interface PaymentScheduleItem {
    amount: number;
    description: string;
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
    description: string;
    breakdown: PaymentScheduleItem[];
    milestoneNumber: number;
}

const isMilestonePoaApproved = (milestone: App.DataTransferObjects.MilestoneData): boolean => {
    if (!milestone.poas || !Array.isArray(milestone.poas)) return false;
    
    for (const poa of milestone.poas) {
        if (poa.signoffs && Array.isArray(poa.signoffs) && poa.signoffs.length > 0) {
            return true;
        }
        if (poa.reviews && Array.isArray(poa.reviews)) {
            const approvals = poa.reviews.filter((r: any) => r.content_approved === true);
            if (approvals.length >= 2) {
                return true;
            }
        }
    }
    return false;
};

export const getUpcomingPaymentData = (proposal: App.DataTransferObjects.ProposalData): UpcomingPaymentResult | null => {
    const schedule = proposal?.schedule;
    const startDateStr = schedule?.starting_date;
    const milestones = schedule?.milestones ?? [];
    const fundsDistributed = schedule?.funds_distributed ?? 0;
    
    if (!startDateStr || milestones.length === 0) return null;
    
    const sortedMilestones = [...milestones].sort((a, b) => a.milestone - b.milestone);
    
    const HOLDBACK_PERCENTAGE = 0.20;
    const OPERATIONAL_PERCENTAGE = 0.80;
    
    const allPayments: Array<{
        amount: number;
        description: string;
        milestoneNumber: number;
        type: 'initial' | 'operational' | 'holdback' | 'final';
        cumulativeTotal: number;
        unlockedByMilestoneIndex: number;
    }> = [];
    
    let runningTotal = 0;
    let monthCounter = 0;
    
    for (let i = 0; i < sortedMilestones.length; i++) {
        const milestone = sortedMilestones[i];
        const previousMilestone = i > 0 ? sortedMilestones[i - 1] : null;
        const isLastMilestone = i === sortedMilestones.length - 1;
        
        const milestoneCost = milestone.cost;
        const operationalAmount = milestoneCost * OPERATIONAL_PERCENTAGE;
        const duration = Math.max(milestone.month, 1);
        const monthlyPayment = operationalAmount / duration;
        
        if (i === 0) {
            for (let m = 0; m < duration; m++) {
                runningTotal += monthlyPayment;
                allPayments.push({
                    amount: monthlyPayment,
                    description: m === 0 ? 'Initial payment' : `Month ${monthCounter}`,
                    milestoneNumber: milestone.milestone,
                    type: 'initial',
                    cumulativeTotal: runningTotal,
                    unlockedByMilestoneIndex: -1
                });
                monthCounter++;
            }
        } else if (isLastMilestone) {
            const prevHoldback = previousMilestone!.cost * HOLDBACK_PERCENTAGE;
            
            runningTotal += prevHoldback;
            allPayments.push({
                amount: prevHoldback,
                description: `Month ${monthCounter} (remaining 20% of M${i})`,
                milestoneNumber: milestone.milestone,
                type: 'holdback',
                cumulativeTotal: runningTotal,
                unlockedByMilestoneIndex: i - 1
            });
            monthCounter++;
            
            runningTotal += milestoneCost;
            allPayments.push({
                amount: milestoneCost,
                description: `Month ${monthCounter} (Last payment occurs after Project Closeout approval.)`,
                milestoneNumber: milestone.milestone,
                type: 'final',
                cumulativeTotal: runningTotal,
                unlockedByMilestoneIndex: i
            });
            monthCounter++;
        } else {
            const prevHoldback = previousMilestone!.cost * HOLDBACK_PERCENTAGE;
            
            if (duration === 1) {
                runningTotal += prevHoldback + monthlyPayment;
                allPayments.push({
                    amount: prevHoldback + monthlyPayment,
                    description: `Month ${monthCounter} (remaining 20% of M${i}) + Month ${monthCounter}`,
                    milestoneNumber: milestone.milestone,
                    type: 'holdback',
                    cumulativeTotal: runningTotal,
                    unlockedByMilestoneIndex: i - 1
                });
                monthCounter++;
            } else {
                runningTotal += prevHoldback;
                allPayments.push({
                    amount: prevHoldback,
                    description: `Month ${monthCounter} (remaining 20% of M${i})`,
                    milestoneNumber: milestone.milestone,
                    type: 'holdback',
                    cumulativeTotal: runningTotal,
                    unlockedByMilestoneIndex: i - 1
                });
                
                for (let m = 0; m < duration; m++) {
                    runningTotal += monthlyPayment;
                    allPayments.push({
                        amount: monthlyPayment,
                        description: `Month ${monthCounter}`,
                        milestoneNumber: milestone.milestone,
                        type: 'operational',
                        cumulativeTotal: runningTotal,
                        unlockedByMilestoneIndex: i - 1
                    });
                    monthCounter++;
                }
            }
        }
    }
    
    let highestApprovedMilestoneIndex = -1;
    for (let i = 0; i < sortedMilestones.length; i++) {
        if (isMilestonePoaApproved(sortedMilestones[i])) {
            highestApprovedMilestoneIndex = i;
        }
    }

    let totalUnlockedPending = 0;
    const pendingPayments: Array<{amount: number; description: string; type: string; milestoneNumber: number}> = [];
    
    for (const payment of allPayments) {
        const isNotPaid = payment.cumulativeTotal > fundsDistributed;
        const isUnlocked = payment.unlockedByMilestoneIndex <= highestApprovedMilestoneIndex;
        
        if (isNotPaid && isUnlocked) {
            totalUnlockedPending += payment.amount;
            pendingPayments.push({
                amount: payment.amount,
                description: payment.description,
                type: payment.type,
                milestoneNumber: payment.milestoneNumber
            });
        }
    }
    
    if (totalUnlockedPending === 0) return null;
    
    const paymentDate = new Date();
    
    return {
        amount: Math.round(totalUnlockedPending * 100) / 100,
        date: paymentDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }),
        description: 'to be distributed in next batch',
        breakdown: pendingPayments.map(p => ({
            amount: p.amount,
            description: p.description,
            monthOffset: 0,
            type: p.type as 'initial' | 'operational' | 'holdback' | 'final'
        })),
        milestoneNumber: pendingPayments[0]?.milestoneNumber ?? 1
    };
};


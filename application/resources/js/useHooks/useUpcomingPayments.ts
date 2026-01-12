export const getUpcomingPaymentData = (proposal: App.DataTransferObjects.ProposalData) => {
    const startDateStr = proposal?.schedule?.starting_date;
    const milestones = proposal?.schedule?.milestones ?? [];
    
    if (!startDateStr || milestones.length === 0) return null;

    let cumulativeMonths = 0;
    let currentMilestone = null;

    for (const m of milestones) {
        if (m.current) {
            currentMilestone = m;
            break;
        }
        cumulativeMonths += m.month; 
    }

    if (!currentMilestone) return null;

    const totalCost = currentMilestone.cost;
    const holdbackAmount = totalCost * 0.20;
    const operationalBudget = totalCost - holdbackAmount;
    const duration = Math.max(currentMilestone.month, 1);
    const batchAmount = operationalBudget / duration;

    
    let batchMonthOffset = 0;
    let label = "Initial Payment";
    
    const completion = currentMilestone.completion_percent ?? 0;

    if (completion >= 80) {
        batchMonthOffset = duration; 
        label = "Completion Holdback";
    } else if (completion > 0) {
        batchMonthOffset = Math.floor((completion / 80) * duration) + 1;
        label = `Month ${batchMonthOffset} Installment`;
    }

   
    const startDate = new Date(startDateStr);
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + cumulativeMonths + batchMonthOffset);

    return {
        amount: completion < 80 ? batchAmount : holdbackAmount,
        label: label,
        date: paymentDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    };
};
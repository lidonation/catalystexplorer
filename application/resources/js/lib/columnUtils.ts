import { HierarchicalOption } from '@/Components/atoms/HierarchicalSelector';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { proposalColumnRenderers, generateColumnHeader } from '@/lib/proposalColumnRenderers';

export interface ColumnDefinition {
    path: string;
    label: string;
    isNested: boolean;
    parentPath?: string;
}

let globalColumnStructure: Record<string, any> | null = null;

/**
 * Generates hierarchical column options from proposal data structure
 */
export function generateHierarchicalColumns(t: (key: string) => string): HierarchicalOption[] {
    const columnStructure: Record<string, any> = {

        title: { type: 'text' },
        proposal: { type: 'text' },
        slug: { type: 'text' },
        website: { type: 'link' },
        amount_requested: { type: 'currency' },
        amount_received: { type: 'currency' },
        definition_of_success: { type: 'text' },
        status: { type: 'text' },
        funding_status: { type: 'text' },
        funded_at: { type: 'date' },
        funding_updated_at: { type: 'date' },
        yes_votes_count: { type: 'number' },
        no_votes_count: { type: 'number' },
        abstain_votes_count: { type: 'number' },
        comment_prompt: { type: 'text' },
        ideascale_link: { type: 'link' },
        projectcatalyst_io_link: { type: 'link' },
        problem: { type: 'text' },
        solution: { type: 'text' },
        experience: { type: 'text' },
        currency: { type: 'text' },
        minted_nfts_fingerprint: { type: 'text' },
        ranking_total: { type: 'number' },
        alignment_score: { type: 'number' },
        feasibility_score: { type: 'number' },
        auditability_score: { type: 'number' },
        quickpitch: { type: 'text' },
        quickpitch_length: { type: 'number' },
        users: { type: 'text' },
        opensource: { type: 'boolean' },
        link: { type: 'link' },
        order: { type: 'number' },
        user_rationale: { type: 'text' },
        
        // Custom display properties
        teams: { type: 'text' },
        yesVotes: { type: 'number' },
        abstainVotes: { type: 'number' },
        budget: { type: 'currency' },
        category: { type: 'text' },
        openSourced: { type: 'boolean' },
        funding: { type: 'text' },
        viewProposal: { type: 'text' },
        
        // Fund nested object
        fund: {
            children: {
                'fund.amount': { type: 'currency' },
                'fund.label': { type: 'text' },
                'fund.title': { type: 'text' },
                'fund.proposals_count': { type: 'number' },
                'fund.funded_proposals_count': { type: 'number' },
                'fund.completed_proposals_count': { type: 'number' },
                'fund.unfunded_proposals_count': { type: 'number' },
                'fund.amount_requested': { type: 'currency' },
                'fund.amount_awarded': { type: 'currency' },
                'fund.slug': { type: 'text' },
                'fund.comment_prompt': { type: 'text' },
                'fund.hero_img_url': { type: 'link' },
                'fund.banner_img_url': { type: 'link' },
                'fund.status': { type: 'text' },
                'fund.launched_at': { type: 'date' },
                'fund.awarded_at': { type: 'date' },
                'fund.color': { type: 'text' },
                'fund.currency': { type: 'text' },
                'fund.review_started_at': { type: 'date' },
            }
        },
        
        // Campaign nested object
        campaign: {
            children: {
                'campaign.title': { type: 'text' },
                'campaign.slug': { type: 'text' },
                'campaign.comment_prompt': { type: 'text' },
                'campaign.hero_img_url': { type: 'link' },
                'campaign.amount': { type: 'currency' },
                'campaign.created_at': { type: 'date' },
                'campaign.updated_at': { type: 'date' },
                'campaign.label': { type: 'text' },
                'campaign.currency': { type: 'text' },
                'campaign.proposals_count': { type: 'number' },
                'campaign.unfunded_proposals_count': { type: 'number' },
                'campaign.funded_proposals_count': { type: 'number' },
                'campaign.completed_proposals_count': { type: 'number' },
                'campaign.total_requested': { type: 'currency' },
                'campaign.total_awarded': { type: 'currency' },
                'campaign.total_distributed': { type: 'currency' },
            }
        },
        
        // Schedule (ProjectScheduleData) nested object
        schedule: {
            children: {
                'schedule.title': { type: 'text' },
                'schedule.url': { type: 'link' },
                'schedule.created_at': { type: 'date' },
                'schedule.budget': { type: 'currency' },
                'schedule.milestone_count': { type: 'number' },
                'schedule.funds_distributed': { type: 'currency' },
                'schedule.starting_date': { type: 'date' },
                'schedule.currency': { type: 'text' },
                'schedule.status': { type: 'text' },
                'schedule.on_track': { type: 'boolean' },
                'schedule.milestones': { type: 'text' },
            }
        }
    };

    const hierarchicalOptions: HierarchicalOption[] = [];

    Object.entries(columnStructure).forEach(([key, config]) => {
        if (config.children) {
            // This is a parent with children
            const children: HierarchicalOption[] = [];
            
            Object.entries(config.children).forEach(([childKey, childConfig]: [string, any]) => {
                children.push({
                    label: generateColumnHeader(childKey),
                    value: childKey,
                    isParent: false
                });
            });

            // Add parent with all its children
            hierarchicalOptions.push({
                label: generateColumnHeader(key),
                value: key,
                isParent: true,
                children: children
            });
        } else {
            // This is a direct property
            hierarchicalOptions.push({
                label: generateColumnHeader(key),
                value: key,
                isParent: false
            });
        }
    });

    globalColumnStructure = columnStructure;

    return hierarchicalOptions;
}

//Extracts all selectable column values from hierarchical options
export function getAllSelectableColumns(options: HierarchicalOption[]): string[] {
    const columns: string[] = [];
    
    options.forEach(option => {
        if (!option.isParent) {
            columns.push(option.value);
        }
        
        if (option.children) {
            option.children.forEach(child => {
                if (!child.isParent) {
                    columns.push(child.value);
                }
            });
        }
    });
    
    return columns;
}

//Validates that selected columns exist in the available options
export function validateSelectedColumns(selectedColumns: string[], availableOptions: HierarchicalOption[]): string[] {
    const allSelectableColumns = getAllSelectableColumns(availableOptions);
    return selectedColumns.filter(column => allSelectableColumns.includes(column));
}

//Checks if a column has a custom renderer in proposalColumnRenderers
export function hasCustomRenderer(columnKey: string): boolean {
    return columnKey in proposalColumnRenderers;
}

// Gets the appropriate renderer type for a column from the column structure
export function getColumnRendererType(columnKey: string): 'custom' | 'text' | 'link' | 'currency' | 'boolean' | 'date' | 'number' {
    if (hasCustomRenderer(columnKey)) {
        return 'custom';
    }
    
    // Try to get the type from our column structure first
    if (globalColumnStructure) {
      
        if (globalColumnStructure[columnKey]?.type) {
            return globalColumnStructure[columnKey].type;
        }
        
        for (const [parentKey, parentConfig] of Object.entries(globalColumnStructure)) {
            const typedParentConfig = parentConfig as any;
            if (typedParentConfig.children && typedParentConfig.children[columnKey]?.type) {
                return typedParentConfig.children[columnKey].type;
            }
        }
    }
    
    // Fallback to pattern-based detection
    if (columnKey.includes('url') || columnKey.includes('link') || columnKey.includes('website')) {
        return 'link';
    }
    
    if (columnKey.includes('amount') || columnKey.includes('budget') || columnKey === 'currency') {
        return 'currency';
    }
    
    if (columnKey.includes('_at') || columnKey.includes('date') || columnKey.includes('Date')) {
        return 'date';
    }
    
    if (columnKey.includes('count') || columnKey.includes('score') || columnKey.includes('total') || 
        columnKey.includes('length') || columnKey === 'order' || columnKey === 'milestone') {
        return 'number';
    }
    
    if (columnKey.includes('opensource') || columnKey.includes('on_track') || columnKey.includes('minted')) {
        return 'boolean';
    }
    
    return 'text';
}

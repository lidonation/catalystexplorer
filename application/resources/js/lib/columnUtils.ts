import { HierarchicalOption } from '@/Components/atoms/HierarchicalSelector';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { proposalColumnRenderers, generateColumnHeader } from '@/lib/proposalColumnRenderers';
import labels from '@/Components/atoms/ActiveFilters/FiltersLabel';

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
export function generateHierarchicalColumns(
    t: (key: string) => string, 
    options?: {
        excludeColumns?: string[];
        protectedColumns?: string[];
    }
): HierarchicalOption[] {
    
    const rawColumnStructure: Record<string, any> = {
        abstainVotes: { type: 'number' },
        alignment_score: { type: 'number' },
        amount_received: { type: 'currency' },
        amount_requested: { type: 'currency' },
        auditability_score: { type: 'number' },
        budget: { type: 'currency' },
        category: { type: 'text' },
        comment_prompt: { type: 'text' },
        currency: { type: 'text' },
        definition_of_success: { type: 'text' },
        experience: { type: 'text' },
        feasibility_score: { type: 'number' },
        funded_at: { type: 'date' },
        funding: { type: 'text' },
        funding_status: { type: 'text' },
        funding_updated_at: { type: 'date' },
        ideascale_link: { type: 'link' },
        link: { type: 'link' },
        manageProposal: { type: 'text', label: 'Manage Proposal' },
        minted_nfts_fingerprint: { type: 'text' },
        my_vote: { type: 'text', label: 'My Vote' },
        no_votes_count: { type: 'number' },
        abstain_votes_count: { type: 'number' },
        openSourced: { type: 'boolean', label: 'Open Sourced' },
        opensource: { type: 'boolean' },
        problem: { type: 'text' },
        projectcatalyst_io_link: { type: 'link' },
        proposal: { type: 'text' },
        proposalActions: { type: 'text', label: 'Actions' },
        quickpitch: { type: 'text' },
        quickpitch_length: { type: 'number' },
        ranking_total: { type: 'number' },
        solution: { type: 'text' },
        status: { type: 'text', label: 'Proposal Status' },
        title: { type: 'text' },
        users: { type: 'text' },
        user_rationale: { type: 'text' },
        viewProposal: { type: 'text', label: 'View Proposal' },
        website: { type: 'link' },
        yes_votes_count: { type: 'number' },
        yesVotes: { type: 'number' },
        
        // Campaign nested object
        campaign: {
            children: {
                'campaign.amount': { type: 'currency' },
                'campaign.comment_prompt': { type: 'text' },
                'campaign.completed_proposals_count': { type: 'number' },
                'campaign.created_at': { type: 'date' },
                'campaign.currency': { type: 'text' },
                'campaign.funded_proposals_count': { type: 'number' },
                'campaign.hero_img_url': { type: 'link' },
                'campaign.label': { type: 'text' },
                'campaign.proposals_count': { type: 'number' },
                'campaign.title': { type: 'text' },
                'campaign.total_awarded': { type: 'currency' },
                'campaign.total_distributed': { type: 'currency' },
                'campaign.total_requested': { type: 'currency' },
                'campaign.unfunded_proposals_count': { type: 'number' },
                'campaign.updated_at': { type: 'date' },
            }
        },
        
        // Fund nested object
        fund: {
            children: {
                'fund.amount': { type: 'currency' },
                'fund.amount_awarded': { type: 'currency' },
                'fund.amount_requested': { type: 'currency' },
                'fund.awarded_at': { type: 'date' },
                'fund.banner_img_url': { type: 'link' },
                'fund.color': { type: 'text' },
                'fund.comment_prompt': { type: 'text' },
                'fund.completed_proposals_count': { type: 'number' },
                'fund.currency': { type: 'text' },
                'fund.funded_proposals_count': { type: 'number' },
                'fund.hero_img_url': { type: 'link' },
                'fund.label': { type: 'text' },
                'fund.launched_at': { type: 'date' },
                'fund.proposals_count': { type: 'number' },
                'fund.review_started_at': { type: 'date' },
                'fund.status': { type: 'text' },
                'fund.title': { type: 'text' },
                'fund.unfunded_proposals_count': { type: 'number' },
            }
        },
        
        // Schedule (ProjectScheduleData) nested object
        schedule: {
            children: {
                'schedule.budget': { type: 'currency' },
                'schedule.created_at': { type: 'date' },
                'schedule.currency': { type: 'text' },
                'schedule.funds_distributed': { type: 'currency' },
                'schedule.milestone_count': { type: 'number' },
                'schedule.milestones': { type: 'text' },
                'schedule.on_track': { type: 'boolean' },
                'schedule.starting_date': { type: 'date' },
                'schedule.status': { type: 'text' },
                'schedule.title': { type: 'text' },
                'schedule.url': { type: 'link' },
            }
        }
    };

    const sortObjectKeys = (obj: Record<string, any>): Record<string, any> => {
        const sorted: Record<string, any> = {};
        Object.keys(obj)
            .sort()
            .forEach(key => {
                if (obj[key].children) {
                    sorted[key] = {
                        ...obj[key],
                        children: sortObjectKeys(obj[key].children)
                    };
                } else {
                    sorted[key] = obj[key];
                }
            });
        return sorted;
    };

    const columnStructure = sortObjectKeys(rawColumnStructure);

    const hierarchicalOptions: HierarchicalOption[] = [];

    const specialColumnsConfig = [
        'my_vote',
        'title',
        'fund.title',
        'campaign.title',
        'link_wallet'
    ];

    const specialColumns: HierarchicalOption[] = [];
    
    specialColumnsConfig
        .sort()
        .forEach((value) => {
            if (!options?.excludeColumns?.includes(value)) {
                specialColumns.push({
                    label: t(generateColumnHeader(value)),
                    value: value,
                    isParent: false,
                    isProtected: options?.protectedColumns?.includes(value)
                });
            }
        });

    if (specialColumns.length > 0) {
        hierarchicalOptions.push({
            label: t('Special Columns'),
            value: 'specialColumns',
            isParent: true,
            children: specialColumns,
            isProtected: false
        });
    }

    const directProperties: [string, any][] = [];
    const nestedObjects: [string, any][] = [];

    Object.entries(columnStructure).forEach(([key, config]) => {
        if (config.children) {
            nestedObjects.push([key, config]);
        } else {
            directProperties.push([key, config]);
        }
    });

    directProperties.sort(([a], [b]) => a.localeCompare(b));
    
    nestedObjects.sort(([a], [b]) => a.localeCompare(b));

    const primaryColumns: HierarchicalOption[] = [];
    directProperties.forEach(([key, config]) => {
        if (options?.excludeColumns?.includes(key)) {
            return;
        }

        primaryColumns.push({
            label: config.label || generateColumnHeader(key),
            value: key,
            isParent: false,
            isProtected: options?.protectedColumns?.includes(key)
        });
    });

    if (primaryColumns.length > 0) {
        hierarchicalOptions.push({
            label: t('Primary Columns'),
            value: 'primaryColumns',
            isParent: true,
            children: primaryColumns,
            isProtected: false
        });
    }

    nestedObjects.forEach(([key, config]) => {
    
        if (options?.excludeColumns?.includes(key)) {
            return;
        }

        const children: HierarchicalOption[] = [];
        
        const sortedChildren = Object.entries(config.children).sort(([a], [b]) => a.localeCompare(b));
        
        sortedChildren.forEach(([childKey, childConfig]: [string, any]) => {
            
            if (options?.excludeColumns?.includes(childKey)) {
                return;
            }

            children.push({
                label: childConfig.label || generateColumnHeader(childKey),
                value: childKey,
                isParent: false,
                isProtected: options?.protectedColumns?.includes(childKey)
            });
        });

        if (children.length > 0) {
            hierarchicalOptions.push({
                label: generateColumnHeader(key),
                value: key,
                isParent: true,
                children: children,
                isProtected: options?.protectedColumns?.includes(key)
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

//Gets custom label for a column from the column structure
export function getCustomColumnLabel(columnKey: string): string | null {
    if (!globalColumnStructure) {
        return null;
    }
    
    if (globalColumnStructure[columnKey]?.label) {
        return globalColumnStructure[columnKey].label;
    }
    
    for (const [parentKey, parentConfig] of Object.entries(globalColumnStructure)) {
        const typedParentConfig = parentConfig as any;
        if (typedParentConfig.children && typedParentConfig.children[columnKey]?.label) {
            return typedParentConfig.children[columnKey].label;
        }
    }
    
    return null;
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
        columnKey.includes('length') || columnKey === 'milestone') {
        return 'number';
    }
    
    if (columnKey.includes('opensource') || columnKey.includes('on_track') || columnKey.includes('minted')) {
        return 'boolean';
    }
    
    return 'text';
}

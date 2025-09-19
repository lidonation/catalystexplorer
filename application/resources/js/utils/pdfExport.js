/**
 * PDF Export Utility for handling column selection and configuration
 * 
 * This utility provides functions to manage PDF exports with dynamic column selection
 * and responsive layout handling for tables that exceed page width.
 */

/**
 * Available PDF export options
 */
export const PDF_OPTIONS = {
    orientation: {
        auto: 'auto',      // Let system decide based on column count
        portrait: 'portrait',
        landscape: 'landscape'
    },
    paperSize: {
        auto: 'auto',      // Let system decide based on column count
        A4: 'A4',
        A3: 'A3',
        Letter: 'Letter'
    },
    fontSize: {
        auto: 'auto',      // Let system decide based on column count
        small: 'small',
        medium: 'medium', 
        large: 'large'
    }
};

/**
 * Default column configurations with priorities
 */
export const COLUMN_CONFIG = {
    title: { 
        label: 'Title', 
        priority: 1, 
        essential: true,
        width: 'flexible' 
    },
    budget: { 
        label: 'Budget', 
        priority: 2, 
        essential: true,
        width: 'compact' 
    },
    category: { 
        label: 'Category', 
        priority: 3, 
        essential: false,
        width: 'medium' 
    },
    teams: { 
        label: 'Team', 
        priority: 4, 
        essential: false,
        width: 'medium' 
    },
    users: { 
        label: 'Users', 
        priority: 4, 
        essential: false,
        width: 'medium' 
    },
    fund: { 
        label: 'Fund', 
        priority: 5, 
        essential: false,
        width: 'compact' 
    },
    status: { 
        label: 'Status', 
        priority: 6, 
        essential: false,
        width: 'compact' 
    },
    funding_status: { 
        label: 'Funding Status', 
        priority: 6, 
        essential: false,
        width: 'compact' 
    },
    yes_votes_count: { 
        label: 'Yes Votes', 
        priority: 7, 
        essential: false,
        width: 'compact' 
    },
    yesVotes: { 
        label: 'Yes Votes', 
        priority: 7, 
        essential: false,
        width: 'compact' 
    },
    abstain_votes_count: { 
        label: 'Abstain Votes', 
        priority: 8, 
        essential: false,
        width: 'compact' 
    },
    abstainVotes: { 
        label: 'Abstain Votes', 
        priority: 8, 
        essential: false,
        width: 'compact' 
    },
    no_votes_count: { 
        label: 'No Votes', 
        priority: 9, 
        essential: false,
        width: 'compact' 
    },
    openSourced: { 
        label: 'Open Source', 
        priority: 10, 
        essential: false,
        width: 'compact' 
    },
    opensource: { 
        label: 'Open Source', 
        priority: 10, 
        essential: false,
        width: 'compact' 
    }
};

/**
 * Calculate optimal PDF configuration based on column selection
 * @param {string[]} selectedColumns - Array of selected column names
 * @param {Object} userPreferences - User's PDF preferences
 * @returns {Object} Recommended PDF configuration
 */
export function calculateOptimalPdfConfig(selectedColumns, userPreferences = {}) {
    const columnCount = selectedColumns.length;
    
    // Default configuration
    let config = {
        orientation: userPreferences.orientation || 'auto',
        paperSize: userPreferences.paperSize || 'auto', 
        fontSize: userPreferences.fontSize || 'auto',
        recommendations: []
    };
    
    // Auto-determine settings if not specified
    if (config.orientation === 'auto') {
        config.orientation = columnCount > 5 ? 'landscape' : 'portrait';
        config.recommendations.push(
            `Switching to ${config.orientation} orientation for ${columnCount} columns`
        );
    }
    
    if (config.paperSize === 'auto') {
        config.paperSize = columnCount > 8 ? 'A3' : 'A4';
        if (columnCount > 8) {
            config.recommendations.push(
                `Using A3 paper size for ${columnCount} columns to ensure readability`
            );
        }
    }
    
    if (config.fontSize === 'auto') {
        if (columnCount > 10) {
            config.fontSize = 'small';
            config.recommendations.push(
                'Using smaller font size due to high column count'
            );
        } else if (columnCount > 7) {
            config.fontSize = 'medium';
        } else {
            config.fontSize = 'large';
        }
    }
    
    // Add warnings for very wide tables
    if (columnCount > 12) {
        config.recommendations.push(
            'Consider reducing the number of columns or using multi-page export for better readability'
        );
    }
    
    return config;
}

/**
 * Generate PDF export URL with column and configuration parameters
 * @param {string} bookmarkCollectionId - The bookmark collection ID
 * @param {string[]} selectedColumns - Array of selected column names
 * @param {Object} pdfConfig - PDF configuration options
 * @param {string} type - Export type (default: 'proposals')
 * @param {string} locale - Current locale (optional, will be extracted from URL if not provided)
 * @returns {string} PDF export URL
 */
export function generatePdfExportUrl(bookmarkCollectionId, selectedColumns, pdfConfig = {}, type = 'proposals', locale = null) {
    if (!locale) {
        const pathParts = window.location.pathname.split('/');
        locale = pathParts[1] || 'en';
    }
    
    const baseUrl = `/${locale}/lists/${bookmarkCollectionId}/${type}/download-pdf`;
    const params = new URLSearchParams();
    
    // Add columns parameter
    if (selectedColumns && selectedColumns.length > 0) {
        params.append('columns', JSON.stringify(selectedColumns));
    }
    
    // Add PDF configuration parameters
    if (pdfConfig.orientation && pdfConfig.orientation !== 'auto') {
        params.append('pdf_orientation', pdfConfig.orientation);
    }
    
    if (pdfConfig.paperSize && pdfConfig.paperSize !== 'auto') {
        params.append('pdf_paper_size', pdfConfig.paperSize);
    }
    
    if (pdfConfig.fontSize && pdfConfig.fontSize !== 'auto') {
        params.append('pdf_font_size', pdfConfig.fontSize);
    }
    
    if (pdfConfig.maxColumnsPerPage) {
        params.append('pdf_max_columns_per_page', pdfConfig.maxColumnsPerPage);
    }
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
}

/**
 * Handle PDF export with optimal configuration
 * @param {string} bookmarkCollectionId - The bookmark collection ID
 * @param {string[]} selectedColumns - Array of selected column names
 * @param {Object} userPreferences - User's PDF preferences
 * @param {string} type - Export type
 * @param {string} locale - Current locale (optional, will be extracted from URL if not provided)
 * @returns {Promise} Download promise
 */
export async function exportToPdf(bookmarkCollectionId, selectedColumns, userPreferences = {}, type = 'proposals', locale = null) {
    // Calculate optimal configuration
    const pdfConfig = calculateOptimalPdfConfig(selectedColumns, userPreferences);
    
    // Generate export URL
    const exportUrl = generatePdfExportUrl(bookmarkCollectionId, selectedColumns, pdfConfig, type, locale);
    
    try {
        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = ''; // Let server determine filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return {
            success: true,
            config: pdfConfig,
            url: exportUrl
        };
    } catch (error) {
        console.error('PDF export failed:', error);
        return {
            success: false,
            error: error.message,
            config: pdfConfig
        };
    }
}

/**
 * Get column recommendations based on screen width and number of columns
 * @param {string[]} allColumns - All available columns
 * @param {number} maxColumns - Maximum recommended columns
 * @returns {Object} Column recommendations
 */
export function getColumnRecommendations(allColumns, maxColumns = 8) {
    const essential = allColumns.filter(col => COLUMN_CONFIG[col]?.essential);
    const optional = allColumns.filter(col => !COLUMN_CONFIG[col]?.essential);
    
    // Sort optional columns by priority
    const sortedOptional = optional.sort((a, b) => {
        const aPriority = COLUMN_CONFIG[a]?.priority || 999;
        const bPriority = COLUMN_CONFIG[b]?.priority || 999;
        return aPriority - bPriority;
    });
    
    const recommended = [...essential];
    const remaining = maxColumns - essential.length;
    
    if (remaining > 0) {
        recommended.push(...sortedOptional.slice(0, remaining));
    }
    
    return {
        recommended,
        essential,
        optional: sortedOptional,
        totalAvailable: allColumns.length,
        maxRecommended: maxColumns
    };
}

/**
 * Validate column selection and provide suggestions
 * @param {string[]} selectedColumns - User's selected columns
 * @returns {Object} Validation results and suggestions
 */
export function validateColumnSelection(selectedColumns) {
    const validation = {
        isValid: true,
        warnings: [],
        suggestions: [],
        columnCount: selectedColumns.length
    };
    
    // Check for essential columns
    const essential = selectedColumns.filter(col => COLUMN_CONFIG[col]?.essential);
    if (essential.length === 0) {
        validation.warnings.push('No essential columns selected. Consider adding Title or Budget.');
    }
    
    // Warn about too many columns
    if (selectedColumns.length > 12) {
        validation.warnings.push(
            'Very high number of columns selected. PDF may be difficult to read.'
        );
        validation.suggestions.push('Consider reducing to 8-10 columns for optimal readability.');
    } else if (selectedColumns.length > 8) {
        validation.suggestions.push('A3 paper size recommended for this many columns.');
    }
    
    // Suggest orientation
    if (selectedColumns.length > 5) {
        validation.suggestions.push('Landscape orientation recommended for wide tables.');
    }
    
    return validation;
}
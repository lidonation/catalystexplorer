// Auto-generated. Do not edit manually.

export const TABLE_INDEXES = {
    "proposal_comparisons": "hash, campaign, title, slug, website, excerpt, content, amount_requested, amount_received, definition_of_success, status, funding_status, funded_at, deleted_at, funding_updated_at, yes_votes_count, no_votes_count, abstain_votes_count, comment_prompt, social_excerpt, ideascale_link, projectcatalyst_io_link, type, meta_title, problem, solution, experience, currency, minted_nfts_fingerprint, ranking_total, alignment_score, feasibility_score, auditability_score, quickpitch, quickpitch_length, users, reviews, fund, opensource, link, order",
    "user_setting": "language, theme, viewChartBy, proposalComparison, proposalType, chartOptions, chartType"
};

export interface DbModels {
    "proposal_comparisons": App.DataTransferObjects.ProposalData;
    "user_setting": App.DataTransferObjects.UserSettingData;
}

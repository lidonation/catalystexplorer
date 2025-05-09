// Auto-generated. Do not edit manually.

export const TABLE_INDEXES = {
    "ideascale_profile_data": "hash, ideascaleId, username, email, name, bio, createdAt, updatedAt, twitter, linkedin, discord, ideascale, telegram, title, hero_img_url, amount_awarded_usd, amount_awarded_ada, amount_requested_ada, amount_requested_usd, amount_distributed_ada, amount_distributed_usd, co_proposals_count, own_proposals_count, claimed_by_id, completed_proposals_count, funded_proposals_count, unfunded_proposals_count, proposals_count, reviews_count, collaborating_proposals_count, groups, claimed_by, reviews",
    "proposal_comparisons": "hash, campaign, title, slug, website, excerpt, content, amount_requested, amount_received, definition_of_success, status, funding_status, funded_at, deleted_at, funding_updated_at, yes_votes_count, no_votes_count, abstain_votes_count, comment_prompt, social_excerpt, ideascale_link, projectcatalyst_io_link, type, meta_title, problem, solution, experience, currency, ranking_total, quickpitch, quickpitch_length, users, fund, opensource, completed_project_nft, link",
    "user_setting": "language, theme, viewChartBy"
};

export interface DbModels {
    "ideascale_profile_data": App.DataTransferObjects.IdeascaleProfileData;
    "proposal_comparisons": App.DataTransferObjects.ProposalData;
    "user_setting": App.DataTransferObjects.UserSettingData;
}

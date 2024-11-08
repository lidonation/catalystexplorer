declare namespace App.DataTransferObjects {
export type ProposalData = {
id: number | null;
user_id: number | null;
campaign_id: number | null;
fund_id: number | null;
title: Array<any> | null;
slug: string;
website: string | null;
excerpt?: string;
amount_requested: number;
amount_received: number | null;
definition_of_success?: string;
status?: string;
funding_status?: string;
meta_data?: Array<any>;
funded_at?: string;
deleted_at?: string;
funding_updated_at?: string;
yes_votes_count: number | null;
no_votes_count: number | null;
abstain_votes_count: number | null;
comment_prompt?: string;
social_excerpt?: string;
team_id?: number;
ideascale_link?: string;
type?: string;
meta_title?: Array<any>;
problem?: Array<any>;
solution?: Array<any>;
experience?: Array<any>;
content?: Array<any>;
currency?: string;
opensource: boolean;
ranking_total?: number;
quickpitch?: string;
quickpitch_length?: number;
};
}

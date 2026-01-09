--
-- PostgreSQL database dump
--

\restrict f4J1ODjVZ7lSIJ4LAbcx93P7J4j5snLGatj7ZAa7ZmYt1ugocSZGAtPUSUgaNzx

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.7 (Debian 17.7-3.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposals (
    user_id bigint,
    title json NOT NULL,
    slug character varying(255) NOT NULL,
    website text,
    excerpt text,
    amount_requested double precision DEFAULT '0'::double precision NOT NULL,
    amount_received double precision,
    definition_of_success text,
    status character varying(255) NOT NULL,
    funding_status text,
    meta_data json,
    funded_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    funding_updated_at date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    yes_votes_count bigint,
    no_votes_count bigint,
    comment_prompt text,
    social_excerpt text,
    team_id bigint,
    ideascale_link text,
    type text,
    meta_title json,
    problem json,
    solution json,
    experience json,
    content json,
    currency text,
    opensource boolean,
    ranking_total integer DEFAULT 0 NOT NULL,
    quickpitch character varying(255),
    quickpitch_length integer,
    abstain_votes_count bigint,
    project_length integer,
    projectcatalyst_io_link character varying(255),
    iog_hash bigint,
    vote_casts bigint,
    fund_id uuid,
    campaign_id uuid,
    id uuid NOT NULL,
    old_id bigint,
    completed_at timestamp(0) without time zone
);


--
-- Name: _proposal_ratings; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public._proposal_ratings AS
 SELECT id,
    fund_id,
    title
   FROM public.proposals p
  WHERE (fund_id IS NOT NULL)
  WITH NO DATA;


--
-- Name: action_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_events (
    id bigint NOT NULL,
    batch_id character(36) NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    actionable_type character varying(255) NOT NULL,
    actionable_id text NOT NULL,
    target_type character varying(255) NOT NULL,
    target_id text NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id text NOT NULL,
    fields text NOT NULL,
    status character varying(25) DEFAULT 'running'::character varying NOT NULL,
    exception text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    original text,
    changes text
);


--
-- Name: action_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_events_id_seq OWNED BY public.action_events.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    title character varying(255) NOT NULL,
    content text NOT NULL,
    label character varying(255),
    context character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    event_starts_at timestamp(0) without time zone,
    event_ends_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    user_id bigint NOT NULL,
    cta json,
    old_id bigint,
    id uuid NOT NULL
);


--
-- Name: bookmark_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookmark_collections (
    title text NOT NULL,
    content text,
    color character varying(255) NOT NULL,
    allow_comments boolean DEFAULT false NOT NULL,
    visibility character varying(255) DEFAULT 'unlisted'::character varying NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    type character varying(255) DEFAULT 'App\Models\BookmarkCollection'::character varying NOT NULL,
    type_type character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    model_type text,
    fund_id uuid,
    user_id uuid,
    old_id bigint,
    id uuid NOT NULL,
    parent_id uuid,
    model_id uuid,
    type_id uuid
);


--
-- Name: bookmark_collections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookmark_collections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookmark_collections_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookmark_collections_users (
    bookmark_collection_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: bookmark_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookmark_items (
    model_type character varying(255) NOT NULL,
    title text,
    content text,
    action smallint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    vote character varying(255),
    user_id uuid,
    bookmark_collection_id uuid,
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id uuid DEFAULT gen_random_uuid(),
    CONSTRAINT bookmark_items_vote_check CHECK (((vote)::text = ANY (ARRAY[('1'::character varying)::text, ('-1'::character varying)::text, ('0'::character varying)::text])))
);


--
-- Name: bookmark_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookmark_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    old_user_id bigint,
    title character varying(255) NOT NULL,
    meta_title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    comment_prompt text,
    content text,
    amount double precision,
    status character varying(255),
    launched_at timestamp(0) without time zone,
    awarded_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    color character varying(255),
    label character varying(255),
    currency character varying(255),
    review_started_at timestamp(0) without time zone,
    fund_id uuid,
    id uuid NOT NULL,
    user_id uuid,
    CONSTRAINT campaigns_currency_check CHECK (((currency IS NULL) OR ((currency)::text = ANY ((ARRAY['ADA'::character varying, 'USD'::character varying, 'USDM'::character varying])::text[]))))
);


--
-- Name: cardano_budget_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cardano_budget_proposals (
    id bigint NOT NULL,
    govtool_user_id bigint NOT NULL,
    govtool_proposal_id bigint NOT NULL,
    govtool_username character varying(255) NOT NULL,
    proposal_name character varying(255) NOT NULL,
    budget_cat character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    privacy_policy boolean NOT NULL,
    intersect_named_administrator boolean NOT NULL,
    prop_comments_number integer NOT NULL,
    ada_amount double precision NOT NULL,
    amount_in_preferred_currency double precision NOT NULL,
    usd_to_ada_conversion_rate double precision NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    committee_name text,
    intersect_admin_further_text text,
    cost_breakdown text NOT NULL,
    problem_statement text NOT NULL,
    proposal_benefit text NOT NULL,
    supplementary_endorsement text,
    explain_proposal_roadmap text NOT NULL,
    experience text NOT NULL,
    maintain_and_support text NOT NULL,
    proposal_description text NOT NULL,
    key_proposal_deliverables text NOT NULL,
    resourcing_duration_estimates text NOT NULL,
    other_contract_type text,
    key_dependencies text NOT NULL,
    contract_type text,
    country text,
    related_roadmap text NOT NULL,
    deleted_at timestamp(0) without time zone
);


--
-- Name: cardano_budget_proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cardano_budget_proposals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cardano_budget_proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cardano_budget_proposals_id_seq OWNED BY public.cardano_budget_proposals.id;


--
-- Name: catalyst_drep_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalyst_drep_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    catalyst_drep_id uuid NOT NULL,
    user_id uuid NOT NULL,
    catalyst_drep_stake_address character varying(255) NOT NULL,
    user_stake_address character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: catalyst_dreps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalyst_dreps (
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    link text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint,
    user_id uuid,
    bio json,
    motivation json,
    qualifications json,
    objective json
);


--
-- Name: catalyst_profile_has_proposal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalyst_profile_has_proposal (
    id bigint NOT NULL,
    proposal_id uuid NOT NULL,
    catalyst_profile_id uuid
);


--
-- Name: catalyst_profile_has_proposal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.catalyst_profile_has_proposal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: catalyst_profile_has_proposal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.catalyst_profile_has_proposal_id_seq OWNED BY public.catalyst_profile_has_proposal.id;


--
-- Name: catalyst_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalyst_profiles (
    username text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    name text,
    id uuid NOT NULL,
    old_id bigint,
    catalyst_id character varying(255),
    claimed_by uuid
);


--
-- Name: catalyst_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.catalyst_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: catalyst_tallies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalyst_tallies (
    id uuid NOT NULL,
    hash character varying(255) NOT NULL,
    tally integer NOT NULL,
    model_type character varying(255),
    model_id uuid,
    context_id uuid,
    context_type character varying(255),
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone,
    category_rank integer,
    fund_rank integer,
    overall_rank integer,
    chance_approval numeric(5,2),
    chance_funding numeric(5,2)
);


--
-- Name: COLUMN catalyst_tallies.category_rank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.catalyst_tallies.category_rank IS 'Rank within campaign/category (1 = best)';


--
-- Name: COLUMN catalyst_tallies.fund_rank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.catalyst_tallies.fund_rank IS 'Rank within fund (1 = best)';


--
-- Name: COLUMN catalyst_tallies.overall_rank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.catalyst_tallies.overall_rank IS 'Overall rank across all tallies (1 = best)';


--
-- Name: COLUMN catalyst_tallies.chance_approval; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.catalyst_tallies.chance_approval IS 'Approval chance percentage (0.00-100.00)';


--
-- Name: COLUMN catalyst_tallies.chance_funding; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.catalyst_tallies.chance_funding IS 'Funding chance percentage (0.00-100.00)';


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    name character varying(255) NOT NULL,
    description text,
    slug character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'category'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid
);


--
-- Name: claimed_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claimed_profiles (
    user_id uuid NOT NULL,
    claimable_id uuid NOT NULL,
    claimable_type character varying(255) NOT NULL,
    claimed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    id uuid NOT NULL
);


--
-- Name: comment_notification_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_notification_subscriptions (
    id bigint NOT NULL,
    commentable_type character varying(255) NOT NULL,
    subscriber_type character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    commentable_id text NOT NULL,
    subscriber_id uuid NOT NULL
);


--
-- Name: comment_notification_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comment_notification_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comment_notification_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comment_notification_subscriptions_id_seq OWNED BY public.comment_notification_subscriptions.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    commentator_type character varying(255),
    commentable_type character varying(255) NOT NULL,
    original_text text NOT NULL,
    text text NOT NULL,
    extra jsonb,
    approved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    id uuid NOT NULL,
    commentator_id uuid,
    commentable_id uuid,
    parent_id uuid
);


--
-- Name: communities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communities (
    title character varying(255) NOT NULL,
    content text NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    slug character varying(255) NOT NULL,
    id uuid NOT NULL,
    user_id uuid,
    CONSTRAINT communities_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('published'::character varying)::text, ('expired'::character varying)::text, ('available'::character varying)::text, ('claimed'::character varying)::text, ('completed'::character varying)::text, ('accepted'::character varying)::text])))
);


--
-- Name: community_has_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_has_groups (
    community_id uuid,
    group_id uuid NOT NULL
);


--
-- Name: community_has_ideascale_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_has_ideascale_profile (
    ideascale_profile_id uuid NOT NULL,
    community_id uuid
);


--
-- Name: community_has_proposal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_has_proposal (
    proposal_id uuid,
    community_id uuid
);


--
-- Name: community_has_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_has_users (
    user_id bigint NOT NULL,
    user_uuid uuid,
    community_id uuid
);


--
-- Name: connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connections (
    id bigint NOT NULL,
    previous_model_type character varying(255) NOT NULL,
    next_model_type character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    previous_model_id text,
    next_model_id text
);


--
-- Name: connections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.connections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: connections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.connections_id_seq OWNED BY public.connections.id;


--
-- Name: delegations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delegations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delegations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delegations (
    id bigint DEFAULT nextval('public.delegations_id_seq'::regclass) NOT NULL,
    registration_id bigint NOT NULL,
    voting_pub character varying(255) NOT NULL,
    weight integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    cat_onchain_id text
);


--
-- Name: discussions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discussions (
    model_type character(255),
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    "order" integer DEFAULT 0,
    content text,
    comment_prompt text,
    published_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    title text,
    deleted_at timestamp(0) without time zone,
    model_id uuid,
    old_id bigint,
    id uuid NOT NULL,
    user_id uuid,
    CONSTRAINT discussions_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('published'::character varying)::text, ('expired'::character varying)::text, ('available'::character varying)::text, ('claimed'::character varying)::text, ('completed'::character varying)::text, ('accepted'::character varying)::text])))
);


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: funds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funds (
    title character varying(150) NOT NULL,
    meta_title character varying(150) NOT NULL,
    slug character varying(150) NOT NULL,
    excerpt text,
    comment_prompt text,
    content text,
    amount double precision DEFAULT '0'::double precision NOT NULL,
    status character varying(255),
    launched_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    awarded_at timestamp(0) without time zone,
    color text,
    label text,
    currency character varying(3) DEFAULT 'usd'::character varying NOT NULL,
    review_started_at timestamp(0) without time zone,
    id uuid NOT NULL,
    parent_id uuid,
    old_user_id bigint,
    user_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: group_has_ideascale_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_has_ideascale_profile (
    group_id uuid,
    ideascale_profile_id uuid NOT NULL
);


--
-- Name: group_has_proposal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_has_proposal (
    group_id uuid NOT NULL,
    proposal_id uuid NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    name character varying(255) NOT NULL,
    bio json,
    deleted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    slug text,
    status text,
    meta_title text,
    website character varying(255),
    twitter character varying(255),
    discord character varying(255),
    github character varying(255),
    id uuid NOT NULL,
    owner_id uuid
);


--
-- Name: ideascale_profile_has_proposal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideascale_profile_has_proposal (
    id bigint NOT NULL,
    ideascale_profile_id uuid NOT NULL,
    proposal_id uuid
);


--
-- Name: ideascale_profile_has_proposal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ideascale_profile_has_proposal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ideascale_profile_has_proposal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ideascale_profile_has_proposal_id_seq OWNED BY public.ideascale_profile_has_proposal.id;


--
-- Name: ideascale_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideascale_profiles (
    old_id bigint NOT NULL,
    ideascale_id integer,
    username character varying(255),
    email character varying(255),
    name character varying(255),
    bio text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    twitter character varying(255),
    linkedin character varying(255),
    discord character varying(255),
    ideascale character varying(255),
    telegram character varying(255),
    title character varying(255),
    id uuid NOT NULL,
    claimed_by_uuid uuid
);


--
-- Name: ideascale_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ideascale_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ideascale_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ideascale_profiles_id_seq OWNED BY public.ideascale_profiles.old_id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.links (
    type character varying(255),
    link text NOT NULL,
    label character varying(255),
    title text,
    status character varying(255) DEFAULT 'published'::character varying NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    valid boolean DEFAULT true NOT NULL,
    deleted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint,
    CONSTRAINT links_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('published'::character varying)::text, ('expired'::character varying)::text, ('available'::character varying)::text, ('claimed'::character varying)::text, ('completed'::character varying)::text, ('accepted'::character varying)::text])))
);


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    lat double precision,
    long double precision,
    address_1 text,
    address_2 text,
    street text,
    city text,
    region text,
    country text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id bigint DEFAULT nextval('public.media_id_seq'::regclass) NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id uuid NOT NULL,
    uuid uuid,
    collection_name character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    mime_type character varying(255),
    disk character varying(255) NOT NULL,
    conversions_disk character varying(255),
    size bigint NOT NULL,
    manipulations json NOT NULL,
    custom_properties json NOT NULL,
    generated_conversions json NOT NULL,
    responsive_images json NOT NULL,
    order_column integer,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: metas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metas (
    model_type text NOT NULL,
    key text NOT NULL,
    content text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    model_id uuid,
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metrics (
    title text NOT NULL,
    content text,
    field text,
    context text,
    color text,
    model text NOT NULL,
    type character varying(255) NOT NULL,
    query character varying(255) NOT NULL,
    count_by character varying(255),
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    "order" smallint DEFAULT '0'::smallint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint,
    user_id text,
    CONSTRAINT metrics_count_by_check CHECK (((count_by)::text = ANY (ARRAY[('fund'::character varying)::text, ('year'::character varying)::text, ('month'::character varying)::text, ('week'::character varying)::text, ('day'::character varying)::text, ('hour'::character varying)::text, ('minute'::character varying)::text]))),
    CONSTRAINT metrics_query_check CHECK (((query)::text = ANY (ARRAY[('sum'::character varying)::text, ('avg'::character varying)::text, ('max'::character varying)::text, ('min'::character varying)::text, ('count'::character varying)::text]))),
    CONSTRAINT metrics_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('published'::character varying)::text, ('expired'::character varying)::text, ('available'::character varying)::text, ('claimed'::character varying)::text, ('completed'::character varying)::text, ('accepted'::character varying)::text]))),
    CONSTRAINT metrics_type_check CHECK (((type)::text = ANY (ARRAY[('value'::character varying)::text, ('trend'::character varying)::text, ('partition'::character varying)::text, ('progress'::character varying)::text, ('table'::character varying)::text, ('distribution'::character varying)::text])))
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: milestone_poas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestone_poas (
    id uuid NOT NULL,
    proposal_id bigint,
    content text NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    current boolean NOT NULL,
    milestone_id uuid NOT NULL,
    api_id bigint,
    updated_at timestamp(0) without time zone
);


--
-- Name: milestone_poas_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestone_poas_reviews (
    id uuid NOT NULL,
    proposal_id bigint,
    content_approved boolean NOT NULL,
    content_comment text NOT NULL,
    role character varying(255) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    user_id character varying(255) NOT NULL,
    current boolean NOT NULL,
    api_id bigint,
    milestone_poas_id uuid NOT NULL,
    updated_at timestamp(0) without time zone,
    CONSTRAINT milestone_poas_reviews_role_check CHECK (((role)::text = ANY (ARRAY[('Milestone reviewer'::character varying)::text, ('Milestone reviewer'::character varying)::text, ('Catalyst team reviewer'::character varying)::text, ('Catalyst team reviewer'::character varying)::text, ('Catalyst Team reviewer'::character varying)::text])))
);


--
-- Name: milestone_poas_signoffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestone_poas_signoffs (
    id uuid NOT NULL,
    proposal_id bigint,
    created_at timestamp(0) without time zone NOT NULL,
    user_id character varying(255) NOT NULL,
    api_id bigint,
    milestone_poas_id uuid NOT NULL,
    updated_at timestamp(0) without time zone
);


--
-- Name: milestone_som_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestone_som_reviews (
    id uuid NOT NULL,
    proposal_id bigint,
    outputs_approves boolean NOT NULL,
    outputs_comment text,
    success_criteria_approves boolean NOT NULL,
    success_criteria_comment text,
    evidence_approves boolean NOT NULL,
    evidence_comment text NOT NULL,
    current boolean NOT NULL,
    role character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    milestone_id uuid NOT NULL,
    api_id bigint,
    updated_at timestamp(0) without time zone,
    CONSTRAINT milestone_som_reviews_role_check CHECK (((role)::text = ANY (ARRAY[('Milestone reviewer'::character varying)::text, ('Milestone reviewer'::character varying)::text, ('Catalyst team reviewer'::character varying)::text, ('Catalyst team reviewer'::character varying)::text, ('Catalyst Team reviewer'::character varying)::text])))
);


--
-- Name: milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestones (
    title text NOT NULL,
    current boolean NOT NULL,
    outputs text NOT NULL,
    success_criteria text NOT NULL,
    evidence text NOT NULL,
    month integer NOT NULL,
    cost double precision NOT NULL,
    completion_percent integer NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    milestone double precision NOT NULL,
    id uuid NOT NULL,
    old_id bigint,
    proposal_id text,
    project_schedule_id uuid,
    fund_id uuid,
    updated_at timestamp(0) without time zone
);


--
-- Name: model_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_categories (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id uuid NOT NULL
);


--
-- Name: model_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.model_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: model_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.model_categories_id_seq OWNED BY public.model_categories.id;


--
-- Name: model_has_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_locations (
    id bigint NOT NULL,
    model_id uuid NOT NULL,
    model_type text NOT NULL,
    location_id uuid NOT NULL
);


--
-- Name: model_has_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.model_has_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: model_has_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.model_has_locations_id_seq OWNED BY public.model_has_locations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id text NOT NULL
);


--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id text NOT NULL
);


--
-- Name: model_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_links (
    id bigint NOT NULL,
    model_id uuid NOT NULL,
    model_type character varying(255) NOT NULL,
    link_id uuid NOT NULL
);


--
-- Name: model_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.model_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: model_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.model_links_id_seq OWNED BY public.model_links.id;


--
-- Name: model_quiz; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_quiz (
    id bigint NOT NULL,
    quiz_id bigint NOT NULL,
    model_id uuid NOT NULL,
    model_type text NOT NULL
);


--
-- Name: model_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.model_quiz_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: model_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.model_quiz_id_seq OWNED BY public.model_quiz.id;


--
-- Name: model_signature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_signature (
    model_type text NOT NULL,
    signature_id uuid NOT NULL,
    model_id uuid NOT NULL
);


--
-- Name: model_signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_signatures (
    id bigint NOT NULL,
    signature_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id uuid NOT NULL
);


--
-- Name: model_signatures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.model_signatures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: model_signatures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.model_signatures_id_seq OWNED BY public.model_signatures.id;


--
-- Name: model_snippets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_snippets (
    id bigint NOT NULL,
    model_id uuid NOT NULL,
    snippet_id bigint NOT NULL,
    model_type text NOT NULL
);


--
-- Name: model_snippets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.model_snippets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: model_snippets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.model_snippets_id_seq OWNED BY public.model_snippets.id;


--
-- Name: model_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_tag (
    tag_id uuid NOT NULL,
    model_id text NOT NULL,
    model_type text NOT NULL,
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: model_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_tags (
    model_type text,
    old_id bigint,
    id uuid,
    tag_id bigint,
    model_id uuid
);


--
-- Name: model_wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_wallets (
    id bigint NOT NULL,
    wallet_id bigint NOT NULL,
    model_id uuid NOT NULL,
    model_type character varying(255) NOT NULL
);


--
-- Name: model_wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.model_wallets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: model_wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.model_wallets_id_seq OWNED BY public.model_wallets.id;


--
-- Name: moderations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderations (
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    rationale text,
    valid boolean,
    context_type text,
    context_id bigint,
    deleted_at timestamp(0) without time zone,
    reviewer_id uuid NOT NULL,
    id uuid NOT NULL,
    old_id bigint,
    moderator_id uuid,
    review_id uuid
);


--
-- Name: moderators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderators (
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    name character varying(255) NOT NULL,
    email character varying(255),
    twitter character varying(255),
    github character varying(255),
    linkedin character varying(255),
    discord character varying(255),
    deleted_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint
);


--
-- Name: monthly_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_reports (
    title character varying(255) NOT NULL,
    content text NOT NULL,
    status text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint,
    ideascale_profile_id uuid NOT NULL
);


--
-- Name: nfts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nfts (
    user_id bigint,
    artist_id bigint,
    model_id uuid,
    model_type text,
    storage_link text,
    preview_link text,
    name text NOT NULL,
    policy text,
    owner_address text,
    description json,
    rarity text,
    status character varying(255) DEFAULT 'minted'::character varying NOT NULL,
    price numeric(20,6),
    currency text,
    metadata json,
    minted_at timestamp(0) without time zone,
    qty integer DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    fingerprint character varying(255),
    id uuid NOT NULL,
    user_uuid uuid,
    artist_uuid uuid,
    CONSTRAINT nfts_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('minted'::character varying)::text])))
);


--
-- Name: nova_field_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nova_field_attachments (
    id integer NOT NULL,
    attachable_type character varying(255) NOT NULL,
    attachable_id bigint NOT NULL,
    attachment character varying(255) NOT NULL,
    disk character varying(255) NOT NULL,
    url character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: nova_field_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nova_field_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nova_field_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nova_field_attachments_id_seq OWNED BY public.nova_field_attachments.id;


--
-- Name: nova_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nova_notifications (
    id uuid NOT NULL,
    type character varying(255) NOT NULL,
    notifiable_type character varying(255) NOT NULL,
    notifiable_id text NOT NULL,
    data text NOT NULL,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


--
-- Name: nova_pending_field_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nova_pending_field_attachments (
    id integer NOT NULL,
    draft_id character varying(255) NOT NULL,
    attachment character varying(255) NOT NULL,
    disk character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: nova_pending_field_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nova_pending_field_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nova_pending_field_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nova_pending_field_attachments_id_seq OWNED BY public.nova_pending_field_attachments.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: project_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_schedules (
    title text NOT NULL,
    url text NOT NULL,
    project_id bigint NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    budget double precision NOT NULL,
    milestone_count integer NOT NULL,
    funds_distributed double precision NOT NULL,
    starting_date timestamp(0) without time zone NOT NULL,
    currency character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    id uuid NOT NULL,
    old_id bigint,
    fund_id uuid,
    proposal_id uuid,
    updated_at timestamp(0) without time zone,
    api_proposal_id bigint,
    CONSTRAINT project_schedules_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'paused'::character varying, 'terminated'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: proposal_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_profiles (
    profile_type character varying(255) NOT NULL,
    profile_id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proposals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rankings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rankings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rankings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rankings (
    id bigint DEFAULT nextval('public.rankings_id_seq'::regclass) NOT NULL,
    user_id bigint NOT NULL,
    model_id text NOT NULL,
    model_type character varying(255) NOT NULL,
    value smallint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    user_uuid uuid
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ratings (
    model_type text NOT NULL,
    user_id bigint,
    rating integer NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    deleted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint,
    model_id uuid NOT NULL,
    review_id uuid
);


--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ratings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reactions (
    id bigint NOT NULL,
    commentator_type character varying(255),
    commentator_id bigint,
    reaction character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    comment_id uuid NOT NULL
);


--
-- Name: reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reactions_id_seq OWNED BY public.reactions.id;


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id bigint DEFAULT nextval('public.catalyst_registrations_id_seq'::regclass) NOT NULL,
    tx text NOT NULL,
    stake_pub text NOT NULL,
    stake_key text NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone
);


--
-- Name: review_moderation_reviewers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_moderation_reviewers (
    id uuid NOT NULL,
    review_moderation_id uuid NOT NULL,
    review_id uuid NOT NULL,
    reviewer_id uuid NOT NULL
);


--
-- Name: review_moderations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_moderations (
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    excellent_count integer DEFAULT 0 NOT NULL,
    good_count integer DEFAULT 0 NOT NULL,
    filtered_out_count integer DEFAULT 0 NOT NULL,
    qa_rationale json,
    flagged boolean DEFAULT false NOT NULL,
    id uuid NOT NULL,
    reviewer_id uuid
);


--
-- Name: reviewer_reputation_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviewer_reputation_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviewer_reputation_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviewer_reputation_scores (
    id bigint DEFAULT nextval('public.reviewer_reputation_scores_id_seq'::regclass) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    score double precision NOT NULL,
    context_type text,
    deleted_at timestamp(0) without time zone,
    reviewer_id uuid NOT NULL,
    context_id uuid
);


--
-- Name: reviewers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviewers (
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    catalyst_reviewer_id character(255) NOT NULL,
    deleted_at timestamp(0) without time zone,
    claimed_by_id character(255),
    id uuid NOT NULL,
    old_id bigint
);


--
-- Name: reviewers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviewers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    model_id uuid,
    model_type character varying(255) NOT NULL,
    title character varying(255),
    content text NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    published_at timestamp(0) without time zone,
    ranking_total integer DEFAULT 0 NOT NULL,
    helpful_total integer DEFAULT 0 NOT NULL,
    not_helpful_total integer DEFAULT 0 NOT NULL,
    deleted_at timestamp(0) without time zone,
    reviewer_id uuid,
    id uuid NOT NULL,
    old_id bigint,
    parent_id text,
    CONSTRAINT reviews_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('published'::character varying)::text, ('expired'::character varying)::text, ('available'::character varying)::text, ('claimed'::character varying)::text, ('completed'::character varying)::text, ('accepted'::character varying)::text])))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rules (
    old_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    operator character varying(255) NOT NULL,
    predicate character varying(255),
    logical_operator character varying(255) NOT NULL,
    old_model_id bigint,
    model_type character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    id uuid NOT NULL,
    model_id uuid,
    CONSTRAINT rules_logical_operator_check CHECK (((logical_operator)::text = ANY (ARRAY[('AND'::character varying)::text, ('OR'::character varying)::text]))),
    CONSTRAINT rules_operator_check CHECK (((operator)::text = ANY (ARRAY[('='::character varying)::text, ('!='::character varying)::text, ('>'::character varying)::text, ('<'::character varying)::text, ('>='::character varying)::text, ('<='::character varying)::text, ('IS NULL'::character varying)::text, ('IS NOT NULL'::character varying)::text, ('IN'::character varying)::text, ('NOT IN'::character varying)::text])))
);


--
-- Name: rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rules_id_seq OWNED BY public.rules.old_id;


--
-- Name: service_model; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_model (
    old_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    service_id uuid,
    model_id uuid,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: service_model_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_model_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_model_id_seq OWNED BY public.service_model.old_id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    old_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    type character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    name character varying(255),
    email character varying(255),
    website character varying(255),
    github character varying(255),
    linkedin character varying(255),
    user_id uuid,
    id uuid NOT NULL,
    CONSTRAINT services_type_check CHECK (((type)::text = ANY (ARRAY[('offered'::character varying)::text, ('needed'::character varying)::text])))
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.old_id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signatures (
    stake_key character varying(255),
    signature text NOT NULL,
    signature_key text,
    wallet_provider character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    stake_address text,
    wallet_name character varying(255),
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid
);


--
-- Name: snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.snapshots (
    snapshot_name character varying(255),
    model_type character varying(255) NOT NULL,
    model_id uuid NOT NULL,
    epoch integer NOT NULL,
    "order" smallint NOT NULL,
    snapshot_at timestamp without time zone NOT NULL,
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: snapshots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.snapshots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    title text NOT NULL,
    meta_title text NOT NULL,
    slug text NOT NULL,
    color text,
    content text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: tinder_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tinder_collections (
    title text NOT NULL,
    content text,
    prompt text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint,
    user_id uuid
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    old_id bigint DEFAULT nextval('public.transactions_id_seq'::regclass) NOT NULL,
    tx_hash character varying(255) NOT NULL,
    epoch integer,
    block character varying(255),
    json_metadata json,
    raw_metadata jsonb,
    inputs json,
    outputs json,
    type character varying(255),
    created_at character varying(255),
    stake_pub character varying(255),
    stake_key character varying(255),
    id uuid NOT NULL
);


--
-- Name: translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.translations (
    id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;


--
-- Name: txes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txes (
    id bigint NOT NULL,
    user_id bigint,
    model_id text NOT NULL,
    model_type text NOT NULL,
    policy text,
    txhash text,
    address text,
    status character varying(255) DEFAULT 'published'::character varying NOT NULL,
    quantity double precision NOT NULL,
    metadata json,
    minted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    model_uuid uuid,
    user_uuid uuid,
    CONSTRAINT txes_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('published'::character varying)::text, ('expired'::character varying)::text, ('available'::character varying)::text, ('claimed'::character varying)::text, ('completed'::character varying)::text, ('accepted'::character varying)::text])))
);


--
-- Name: txes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.txes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: txes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.txes_id_seq OWNED BY public.txes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    old_id bigint,
    name character varying(255),
    email character varying(255),
    email_verified_at timestamp(0) without time zone,
    password character varying(255),
    remember_token character varying(100),
    current_team_id bigint,
    profile_photo_path text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    short_bio text,
    bio text,
    wallet_stake_address character varying(255),
    wallet_address character varying(255),
    wallet_validation_seed_tx character varying(255),
    wallet_validation_seed_index character varying(255),
    wallet_validation_seed_amount character varying(255),
    git text,
    discord text,
    linkedin text,
    telegram text,
    twitter text,
    active_pool_id text,
    lang character varying(255) DEFAULT 'en'::character varying NOT NULL,
    primary_account_id bigint,
    super boolean DEFAULT false NOT NULL,
    avatar character varying(255),
    preferences json,
    last_login timestamp(0) without time zone,
    did_verified boolean DEFAULT false NOT NULL,
    two_factor_secret text,
    two_factor_recovery_codes text,
    website character varying(255),
    password_updated_at timestamp(0) without time zone,
    id uuid NOT NULL,
    location_id uuid
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.old_id;


--
-- Name: voter_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voter_histories (
    id bigint NOT NULL,
    stake_address text NOT NULL,
    fragment_id text NOT NULL,
    caster text NOT NULL,
    "time" text NOT NULL,
    raw_fragment text NOT NULL,
    proposal bigint NOT NULL,
    choice integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) with time zone,
    snapshot_id uuid
);


--
-- Name: voter_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voter_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voter_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voter_histories_id_seq OWNED BY public.voter_histories.id;


--
-- Name: voter_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voter_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voter_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voter_history_id_seq OWNED BY public.voter_histories.id;


--
-- Name: voters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voters (
    stake_pub text NOT NULL,
    stake_key text NOT NULL,
    voting_pub text NOT NULL,
    voting_key text NOT NULL,
    cat_id text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    id uuid NOT NULL,
    old_id bigint
);


--
-- Name: voting_powers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voting_powers (
    delegate character varying(255),
    voter_id text NOT NULL,
    voting_power double precision NOT NULL,
    consumed boolean DEFAULT false,
    votes_cast integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    snapshot_id uuid NOT NULL,
    old_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: voting_powers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voting_powers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_events ALTER COLUMN id SET DEFAULT nextval('public.action_events_id_seq'::regclass);


--
-- Name: cardano_budget_proposals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cardano_budget_proposals ALTER COLUMN id SET DEFAULT nextval('public.cardano_budget_proposals_id_seq'::regclass);


--
-- Name: catalyst_profile_has_proposal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_profile_has_proposal ALTER COLUMN id SET DEFAULT nextval('public.catalyst_profile_has_proposal_id_seq'::regclass);


--
-- Name: comment_notification_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_notification_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.comment_notification_subscriptions_id_seq'::regclass);


--
-- Name: connections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connections ALTER COLUMN id SET DEFAULT nextval('public.connections_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: ideascale_profile_has_proposal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideascale_profile_has_proposal ALTER COLUMN id SET DEFAULT nextval('public.ideascale_profile_has_proposal_id_seq'::regclass);


--
-- Name: ideascale_profiles old_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideascale_profiles ALTER COLUMN old_id SET DEFAULT nextval('public.ideascale_profiles_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: model_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_categories ALTER COLUMN id SET DEFAULT nextval('public.model_categories_id_seq'::regclass);


--
-- Name: model_has_locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_locations ALTER COLUMN id SET DEFAULT nextval('public.model_has_locations_id_seq'::regclass);


--
-- Name: model_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_links ALTER COLUMN id SET DEFAULT nextval('public.model_links_id_seq'::regclass);


--
-- Name: model_quiz id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_quiz ALTER COLUMN id SET DEFAULT nextval('public.model_quiz_id_seq'::regclass);


--
-- Name: model_signatures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_signatures ALTER COLUMN id SET DEFAULT nextval('public.model_signatures_id_seq'::regclass);


--
-- Name: model_snippets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_snippets ALTER COLUMN id SET DEFAULT nextval('public.model_snippets_id_seq'::regclass);


--
-- Name: model_wallets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_wallets ALTER COLUMN id SET DEFAULT nextval('public.model_wallets_id_seq'::regclass);


--
-- Name: nova_field_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nova_field_attachments ALTER COLUMN id SET DEFAULT nextval('public.nova_field_attachments_id_seq'::regclass);


--
-- Name: nova_pending_field_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nova_pending_field_attachments ALTER COLUMN id SET DEFAULT nextval('public.nova_pending_field_attachments_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: reactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions ALTER COLUMN id SET DEFAULT nextval('public.reactions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: rules old_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules ALTER COLUMN old_id SET DEFAULT nextval('public.rules_id_seq'::regclass);


--
-- Name: service_model old_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_model ALTER COLUMN old_id SET DEFAULT nextval('public.service_model_id_seq'::regclass);


--
-- Name: services old_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN old_id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: txes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.txes ALTER COLUMN id SET DEFAULT nextval('public.txes_id_seq'::regclass);


--
-- Name: voter_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voter_histories ALTER COLUMN id SET DEFAULT nextval('public.voter_history_id_seq'::regclass);


--
-- Name: action_events action_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_events
    ADD CONSTRAINT action_events_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: bookmark_collections bookmark_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmark_collections
    ADD CONSTRAINT bookmark_collections_pkey PRIMARY KEY (id);


--
-- Name: bookmark_collections_users bookmark_collections_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmark_collections_users
    ADD CONSTRAINT bookmark_collections_users_pkey PRIMARY KEY (bookmark_collection_id, user_id);


--
-- Name: bookmark_items bookmark_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmark_items
    ADD CONSTRAINT bookmark_items_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_uuid_unique UNIQUE (id);


--
-- Name: cardano_budget_proposals cardano_budget_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cardano_budget_proposals
    ADD CONSTRAINT cardano_budget_proposals_pkey PRIMARY KEY (id);


--
-- Name: catalyst_drep_user catalyst_drep_user_catalyst_drep_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_drep_user
    ADD CONSTRAINT catalyst_drep_user_catalyst_drep_id_user_id_unique UNIQUE (catalyst_drep_id, user_id);


--
-- Name: catalyst_drep_user catalyst_drep_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_drep_user
    ADD CONSTRAINT catalyst_drep_user_pkey PRIMARY KEY (id);


--
-- Name: catalyst_dreps catalyst_dreps_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_dreps
    ADD CONSTRAINT catalyst_dreps_email_unique UNIQUE (email);


--
-- Name: catalyst_dreps catalyst_dreps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_dreps
    ADD CONSTRAINT catalyst_dreps_pkey PRIMARY KEY (id);


--
-- Name: catalyst_profile_has_proposal catalyst_profile_has_proposal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_profile_has_proposal
    ADD CONSTRAINT catalyst_profile_has_proposal_pkey PRIMARY KEY (id);


--
-- Name: catalyst_profiles catalyst_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_profiles
    ADD CONSTRAINT catalyst_profiles_pkey PRIMARY KEY (id);


--
-- Name: registrations catalyst_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT catalyst_registrations_pkey PRIMARY KEY (id);


--
-- Name: catalyst_tallies catalyst_tallies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_tallies
    ADD CONSTRAINT catalyst_tallies_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: claimed_profiles claimed_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimed_profiles
    ADD CONSTRAINT claimed_profiles_pkey PRIMARY KEY (id);


--
-- Name: claimed_profiles claimed_profiles_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimed_profiles
    ADD CONSTRAINT claimed_profiles_unique UNIQUE (user_id, claimable_id, claimable_type);


--
-- Name: comment_notification_subscriptions comment_notification_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_notification_subscriptions
    ADD CONSTRAINT comment_notification_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- Name: connections connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_pkey PRIMARY KEY (id);


--
-- Name: delegations delegations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegations
    ADD CONSTRAINT delegations_pkey PRIMARY KEY (id);


--
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: funds funds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT funds_pkey PRIMARY KEY (id);


--
-- Name: funds funds_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT funds_uuid_unique UNIQUE (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: groups groups_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_uuid_unique UNIQUE (id);


--
-- Name: ideascale_profile_has_proposal ideascale_profile_has_proposal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideascale_profile_has_proposal
    ADD CONSTRAINT ideascale_profile_has_proposal_pkey PRIMARY KEY (id);


--
-- Name: ideascale_profiles ideascale_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideascale_profiles
    ADD CONSTRAINT ideascale_profiles_pkey PRIMARY KEY (id);


--
-- Name: ideascale_profiles ideascale_profiles_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideascale_profiles
    ADD CONSTRAINT ideascale_profiles_uuid_unique UNIQUE (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: links links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: metas metas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metas
    ADD CONSTRAINT metas_pkey PRIMARY KEY (id);


--
-- Name: metrics metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_schedule_milestone_created_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_schedule_milestone_created_unique UNIQUE (project_schedule_id, milestone, created_at);


--
-- Name: model_categories model_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_categories
    ADD CONSTRAINT model_categories_pkey PRIMARY KEY (id);


--
-- Name: model_has_locations model_has_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_locations
    ADD CONSTRAINT model_has_locations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: model_links model_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_links
    ADD CONSTRAINT model_links_pkey PRIMARY KEY (id);


--
-- Name: model_quiz model_quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_quiz
    ADD CONSTRAINT model_quiz_pkey PRIMARY KEY (id);


--
-- Name: model_signatures model_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_signatures
    ADD CONSTRAINT model_signatures_pkey PRIMARY KEY (id);


--
-- Name: model_snippets model_snippets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_snippets
    ADD CONSTRAINT model_snippets_pkey PRIMARY KEY (id);


--
-- Name: model_tag model_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_tag
    ADD CONSTRAINT model_tag_pkey PRIMARY KEY (id);


--
-- Name: model_wallets model_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_wallets
    ADD CONSTRAINT model_wallets_pkey PRIMARY KEY (id);


--
-- Name: moderations moderations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderations
    ADD CONSTRAINT moderations_pkey PRIMARY KEY (id);


--
-- Name: moderators moderators_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderators
    ADD CONSTRAINT moderators_email_unique UNIQUE (email);


--
-- Name: moderators moderators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderators
    ADD CONSTRAINT moderators_pkey PRIMARY KEY (id);


--
-- Name: monthly_reports monthly_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_reports
    ADD CONSTRAINT monthly_reports_pkey PRIMARY KEY (id);


--
-- Name: nfts nfts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT nfts_pkey PRIMARY KEY (id);


--
-- Name: nfts nfts_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT nfts_uuid_unique UNIQUE (id);


--
-- Name: nova_field_attachments nova_field_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nova_field_attachments
    ADD CONSTRAINT nova_field_attachments_pkey PRIMARY KEY (id);


--
-- Name: nova_notifications nova_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nova_notifications
    ADD CONSTRAINT nova_notifications_pkey PRIMARY KEY (id);


--
-- Name: nova_pending_field_attachments nova_pending_field_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nova_pending_field_attachments
    ADD CONSTRAINT nova_pending_field_attachments_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: project_schedules proposal_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_schedules
    ADD CONSTRAINT proposal_milestones_pkey PRIMARY KEY (id);


--
-- Name: proposal_profiles proposal_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_profiles
    ADD CONSTRAINT proposal_profiles_pkey PRIMARY KEY (id);


--
-- Name: proposal_profiles proposal_profiles_unique_attachment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_profiles
    ADD CONSTRAINT proposal_profiles_unique_attachment UNIQUE (proposal_id, profile_type, profile_id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_uuid_unique UNIQUE (id);


--
-- Name: rankings rankings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rankings
    ADD CONSTRAINT rankings_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (id);


--
-- Name: review_moderation_reviewers review_moderation_reviewers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_reviewers
    ADD CONSTRAINT review_moderation_reviewers_pkey PRIMARY KEY (id);


--
-- Name: review_moderation_reviewers review_moderation_reviewers_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_reviewers
    ADD CONSTRAINT review_moderation_reviewers_unique UNIQUE (review_moderation_id, review_id, reviewer_id);


--
-- Name: review_moderations review_moderations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderations
    ADD CONSTRAINT review_moderations_pkey PRIMARY KEY (id);


--
-- Name: reviewer_reputation_scores reviewer_reputation_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviewer_reputation_scores
    ADD CONSTRAINT reviewer_reputation_scores_pkey PRIMARY KEY (id);


--
-- Name: reviewers reviewers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviewers
    ADD CONSTRAINT reviewers_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: rules rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_pkey PRIMARY KEY (id);


--
-- Name: service_model service_model_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_model
    ADD CONSTRAINT service_model_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);


--
-- Name: snapshots snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.snapshots
    ADD CONSTRAINT snapshots_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tinder_collections tinder_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tinder_collections
    ADD CONSTRAINT tinder_collections_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: txes txes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.txes
    ADD CONSTRAINT txes_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid_unique UNIQUE (id);


--
-- Name: voter_histories voter_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voter_histories
    ADD CONSTRAINT voter_histories_pkey PRIMARY KEY (id);


--
-- Name: voters voters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voters
    ADD CONSTRAINT voters_pkey PRIMARY KEY (id);


--
-- Name: voting_powers voting_powers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voting_powers
    ADD CONSTRAINT voting_powers_pkey PRIMARY KEY (id);


--
-- Name: voting_powers voting_powers_voter_snapshot_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voting_powers
    ADD CONSTRAINT voting_powers_voter_snapshot_unique UNIQUE (voter_id, snapshot_id);


--
-- Name: action_events_actionable_type_actionable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX action_events_actionable_type_actionable_id_index ON public.action_events USING btree (actionable_type, actionable_id);


--
-- Name: action_events_batch_id_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX action_events_batch_id_model_type_model_id_index ON public.action_events USING btree (batch_id, model_type, model_id);


--
-- Name: action_events_target_type_target_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX action_events_target_type_target_id_index ON public.action_events USING btree (target_type, target_id);


--
-- Name: action_events_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX action_events_user_id_index ON public.action_events USING btree (user_id);


--
-- Name: campaigns_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX campaigns_user_id_index ON public.campaigns USING btree (user_id);


--
-- Name: cardano_budget_proposals_govtool_proposal_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cardano_budget_proposals_govtool_proposal_id_index ON public.cardano_budget_proposals USING btree (govtool_proposal_id);


--
-- Name: cardano_budget_proposals_govtool_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cardano_budget_proposals_govtool_user_id_index ON public.cardano_budget_proposals USING btree (govtool_user_id);


--
-- Name: cardano_budget_proposals_govtool_username_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cardano_budget_proposals_govtool_username_index ON public.cardano_budget_proposals USING btree (govtool_username);


--
-- Name: cat_onchain_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cat_onchain_id_index ON public.delegations USING btree (cat_onchain_id);


--
-- Name: catalyst_dreps_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_dreps_uuid_index ON public.catalyst_dreps USING btree (id);


--
-- Name: catalyst_profiles_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_profiles_uuid_index ON public.catalyst_profiles USING btree (id);


--
-- Name: catalyst_tallies_category_rank_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_category_rank_index ON public.catalyst_tallies USING btree (category_rank);


--
-- Name: catalyst_tallies_chance_approval_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_chance_approval_index ON public.catalyst_tallies USING btree (chance_approval);


--
-- Name: catalyst_tallies_chance_funding_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_chance_funding_index ON public.catalyst_tallies USING btree (chance_funding);


--
-- Name: catalyst_tallies_context_type_context_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_context_type_context_id_index ON public.catalyst_tallies USING btree (context_type, context_id);


--
-- Name: catalyst_tallies_context_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_context_type_index ON public.catalyst_tallies USING btree (context_type);


--
-- Name: catalyst_tallies_fund_rank_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_fund_rank_index ON public.catalyst_tallies USING btree (fund_rank);


--
-- Name: catalyst_tallies_hash_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_hash_index ON public.catalyst_tallies USING btree (hash);


--
-- Name: catalyst_tallies_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_model_type_model_id_index ON public.catalyst_tallies USING btree (model_type, model_id);


--
-- Name: catalyst_tallies_overall_rank_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalyst_tallies_overall_rank_index ON public.catalyst_tallies USING btree (overall_rank);


--
-- Name: claimed_profiles_claimable_id_claimable_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX claimed_profiles_claimable_id_claimable_type_index ON public.claimed_profiles USING btree (claimable_id, claimable_type);


--
-- Name: claimed_profiles_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX claimed_profiles_user_id_index ON public.claimed_profiles USING btree (user_id);


--
-- Name: commentator_reactions; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commentator_reactions ON public.reactions USING btree (commentator_type, commentator_id);


--
-- Name: community_has_ideascale_profile_ideascale_profile_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_has_ideascale_profile_ideascale_profile_uuid_index ON public.community_has_ideascale_profile USING btree (ideascale_profile_id);


--
-- Name: community_has_users_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_has_users_user_id_index ON public.community_has_users USING btree (user_id);


--
-- Name: group_has_ideascale_profile_ideascale_profile_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_has_ideascale_profile_ideascale_profile_uuid_index ON public.group_has_ideascale_profile USING btree (ideascale_profile_id);


--
-- Name: ideascale_profile_has_proposal_ideascale_profile_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ideascale_profile_has_proposal_ideascale_profile_uuid_index ON public.ideascale_profile_has_proposal USING btree (ideascale_profile_id);


--
-- Name: idx_catalyst_tallies_context_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catalyst_tallies_context_id ON public.catalyst_tallies USING btree (context_id);


--
-- Name: idx_catalyst_tallies_context_tally; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catalyst_tallies_context_tally ON public.catalyst_tallies USING btree (context_id, tally DESC);


--
-- Name: idx_metas_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metas_lookup ON public.metas USING btree (model_type, model_id, key);


--
-- Name: idx_proposal_profiles_proposal_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposal_profiles_proposal_id ON public.proposal_profiles USING btree (proposal_id);


--
-- Name: idx_proposal_profiles_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposal_profiles_type_id ON public.proposal_profiles USING btree (profile_type, profile_id);


--
-- Name: idx_proposals_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposals_type ON public.proposals USING btree (type);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: links_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX links_id_index ON public.links USING btree (id);


--
-- Name: locations_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX locations_id_index ON public.locations USING btree (id);


--
-- Name: media_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_model_type_model_id_index ON public.media USING btree (model_type, model_id);


--
-- Name: media_order_column_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_order_column_index ON public.media USING btree (order_column);


--
-- Name: media_uuid_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_uuid_unique ON public.media USING btree (uuid);


--
-- Name: metrics_context_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metrics_context_index ON public.metrics USING btree (context);


--
-- Name: metrics_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metrics_id_index ON public.metrics USING btree (id);


--
-- Name: metrics_type_context_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metrics_type_context_index ON public.metrics USING btree (type, context);


--
-- Name: metrics_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metrics_type_index ON public.metrics USING btree (type);


--
-- Name: metrics_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metrics_user_id_index ON public.metrics USING btree (user_id);


--
-- Name: milestone_poas_milestone_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX milestone_poas_milestone_id_index ON public.milestone_poas USING btree (milestone_id);


--
-- Name: milestone_som_reviews_milestone_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX milestone_som_reviews_milestone_id_index ON public.milestone_som_reviews USING btree (milestone_id);


--
-- Name: milestones_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX milestones_id_index ON public.milestones USING btree (id);


--
-- Name: milestones_project_schedule_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX milestones_project_schedule_id_index ON public.milestones USING btree (project_schedule_id);


--
-- Name: milestones_proposal_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX milestones_proposal_id_index ON public.milestones USING btree (proposal_id);


--
-- Name: model_categories_category_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_categories_category_id_index ON public.model_categories USING btree (category_id);


--
-- Name: model_categories_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_categories_model_type_model_id_index ON public.model_categories USING btree (model_type, model_id);


--
-- Name: model_has_permissions_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_permissions_model_type_model_id_index ON public.model_has_permissions USING btree (model_type, model_id);


--
-- Name: model_has_roles_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_roles_model_type_model_id_index ON public.model_has_roles USING btree (model_type, model_id);


--
-- Name: model_links_link_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_links_link_id_index ON public.model_links USING btree (link_id);


--
-- Name: model_links_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_links_model_type_model_id_index ON public.model_links USING btree (model_type, model_id);


--
-- Name: model_quiz_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_quiz_model_type_model_id_index ON public.model_quiz USING btree (model_type, model_id);


--
-- Name: model_quiz_quiz_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_quiz_quiz_id_index ON public.model_quiz USING btree (quiz_id);


--
-- Name: model_signatures_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_signatures_model_type_model_id_index ON public.model_signatures USING btree (model_type, model_id);


--
-- Name: model_signatures_signature_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_signatures_signature_id_index ON public.model_signatures USING btree (signature_id);


--
-- Name: model_snippets_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_snippets_model_type_model_id_index ON public.model_snippets USING btree (model_type, model_id);


--
-- Name: model_snippets_snippet_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_snippets_snippet_id_index ON public.model_snippets USING btree (snippet_id);


--
-- Name: model_wallets_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_wallets_model_type_model_id_index ON public.model_wallets USING btree (model_type, model_id);


--
-- Name: model_wallets_wallet_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_wallets_wallet_id_index ON public.model_wallets USING btree (wallet_id);


--
-- Name: moderations_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moderations_id_index ON public.moderations USING btree (id);


--
-- Name: moderations_moderator_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moderations_moderator_id_index ON public.moderations USING btree (moderator_id);


--
-- Name: moderations_reviewer_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moderations_reviewer_id_index ON public.moderations USING btree (reviewer_id);


--
-- Name: moderators_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moderators_id_index ON public.moderators USING btree (id);


--
-- Name: monthly_reports_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX monthly_reports_id_index ON public.monthly_reports USING btree (id);


--
-- Name: monthly_reports_ideascale_profile_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX monthly_reports_ideascale_profile_uuid_index ON public.monthly_reports USING btree (ideascale_profile_id);


--
-- Name: nfts_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX nfts_model_id_model_type_index ON public.nfts USING btree (model_id, model_type);


--
-- Name: nova_field_attachments_attachable_type_attachable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX nova_field_attachments_attachable_type_attachable_id_index ON public.nova_field_attachments USING btree (attachable_type, attachable_id);


--
-- Name: nova_field_attachments_url_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX nova_field_attachments_url_index ON public.nova_field_attachments USING btree (url);


--
-- Name: nova_notifications_notifiable_type_notifiable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX nova_notifications_notifiable_type_notifiable_id_index ON public.nova_notifications USING btree (notifiable_type, notifiable_id);


--
-- Name: nova_pending_field_attachments_draft_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX nova_pending_field_attachments_draft_id_index ON public.nova_pending_field_attachments USING btree (draft_id);


--
-- Name: project_schedules_api_proposal_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_schedules_api_proposal_id_index ON public.project_schedules USING btree (api_proposal_id);


--
-- Name: proposal_milestones_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposal_milestones_id_index ON public.project_schedules USING btree (id);


--
-- Name: proposal_profiles_profile_type_profile_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposal_profiles_profile_type_profile_id_index ON public.proposal_profiles USING btree (profile_type, profile_id);


--
-- Name: proposals_campaign_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_campaign_uuid_index ON public.proposals USING btree (campaign_id);


--
-- Name: proposals_funding_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_funding_status_index ON public.proposals USING btree (funding_status);


--
-- Name: proposals_status_funding_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_status_funding_index ON public.proposals USING btree (status, funding_status);


--
-- Name: proposals_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_status_index ON public.proposals USING btree (status);


--
-- Name: proposals_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_type_index ON public.proposals USING btree (type);


--
-- Name: proposals_type_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_type_status_index ON public.proposals USING btree (type, status);


--
-- Name: ratings_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ratings_id_index ON public.ratings USING btree (id);


--
-- Name: ratings_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ratings_model_id_index ON public.ratings USING btree (model_id);


--
-- Name: reviewer_reputation_scores_reviewer_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviewer_reputation_scores_reviewer_id_index ON public.reviewer_reputation_scores USING btree (reviewer_id);


--
-- Name: reviewers_catalyst_reviewer_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviewers_catalyst_reviewer_id_index ON public.reviewers USING btree (catalyst_reviewer_id);


--
-- Name: reviewers_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviewers_id_index ON public.reviewers USING btree (id);


--
-- Name: reviews_reviewer_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_reviewer_id_index ON public.reviews USING btree (reviewer_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: signatures_stake_key_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX signatures_stake_key_index ON public.signatures USING btree (stake_key);


--
-- Name: signatures_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX signatures_user_id_index ON public.signatures USING btree (user_id);


--
-- Name: snapshots_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX snapshots_model_type_model_id_index ON public.snapshots USING btree (model_type, model_id);


--
-- Name: tinder_collections_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tinder_collections_uuid_index ON public.tinder_collections USING btree (id);


--
-- Name: transactions_old_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_old_id_index ON public.transactions USING btree (old_id);


--
-- Name: transactions_tx_hash_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX transactions_tx_hash_unique ON public.transactions USING btree (tx_hash);


--
-- Name: txes_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX txes_model_id_model_type_index ON public.txes USING btree (model_id, model_type);


--
-- Name: voters_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voters_id_index ON public.voters USING btree (id);


--
-- Name: bookmark_collections bookmark_collections_fund_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmark_collections
    ADD CONSTRAINT bookmark_collections_fund_id_foreign FOREIGN KEY (fund_id) REFERENCES public.funds(id) ON DELETE SET NULL;


--
-- Name: bookmark_collections bookmark_collections_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmark_collections
    ADD CONSTRAINT bookmark_collections_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookmark_collections_users bookmark_collections_users_bookmark_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmark_collections_users
    ADD CONSTRAINT bookmark_collections_users_bookmark_collection_id_foreign FOREIGN KEY (bookmark_collection_id) REFERENCES public.bookmark_collections(id) ON DELETE CASCADE;


--
-- Name: bookmark_collections_users bookmark_collections_users_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmark_collections_users
    ADD CONSTRAINT bookmark_collections_users_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookmark_items bookmark_items_bookmark_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmark_items
    ADD CONSTRAINT bookmark_items_bookmark_collection_id_foreign FOREIGN KEY (bookmark_collection_id) REFERENCES public.bookmark_collections(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_fund_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_fund_id_foreign FOREIGN KEY (fund_id) REFERENCES public.funds(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: catalyst_drep_user catalyst_drep_user_catalyst_drep_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_drep_user
    ADD CONSTRAINT catalyst_drep_user_catalyst_drep_id_foreign FOREIGN KEY (catalyst_drep_id) REFERENCES public.catalyst_dreps(id) ON DELETE CASCADE;


--
-- Name: catalyst_drep_user catalyst_drep_user_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_drep_user
    ADD CONSTRAINT catalyst_drep_user_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: catalyst_dreps catalyst_dreps_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_dreps
    ADD CONSTRAINT catalyst_dreps_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: catalyst_profile_has_proposal catalyst_profile_has_proposal_catalyst_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_profile_has_proposal
    ADD CONSTRAINT catalyst_profile_has_proposal_catalyst_profile_id_foreign FOREIGN KEY (catalyst_profile_id) REFERENCES public.catalyst_profiles(id);


--
-- Name: catalyst_profile_has_proposal catalyst_profile_has_proposal_proposal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalyst_profile_has_proposal
    ADD CONSTRAINT catalyst_profile_has_proposal_proposal_id_foreign FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: claimed_profiles claimed_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimed_profiles
    ADD CONSTRAINT claimed_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comment_notification_subscriptions comment_notification_subscriptions_subscriber_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_notification_subscriptions
    ADD CONSTRAINT comment_notification_subscriptions_subscriber_id_foreign FOREIGN KEY (subscriber_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_commentator_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_commentator_id_foreign FOREIGN KEY (commentator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comments comments_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: communities communities_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_has_groups community_has_groups_community_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_has_groups
    ADD CONSTRAINT community_has_groups_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: community_has_groups community_has_groups_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_has_groups
    ADD CONSTRAINT community_has_groups_group_id_foreign FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: community_has_ideascale_profile community_has_ideascale_profile_community_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_has_ideascale_profile
    ADD CONSTRAINT community_has_ideascale_profile_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: community_has_ideascale_profile community_has_ideascale_profile_ideascale_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_has_ideascale_profile
    ADD CONSTRAINT community_has_ideascale_profile_ideascale_profile_id_foreign FOREIGN KEY (ideascale_profile_id) REFERENCES public.ideascale_profiles(id) ON DELETE CASCADE;


--
-- Name: community_has_proposal community_has_proposal_community_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_has_proposal
    ADD CONSTRAINT community_has_proposal_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: community_has_proposal community_has_proposal_proposal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_has_proposal
    ADD CONSTRAINT community_has_proposal_proposal_id_foreign FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: community_has_users community_has_users_community_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_has_users
    ADD CONSTRAINT community_has_users_community_id_foreign FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: delegations delegations_registration_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegations
    ADD CONSTRAINT delegations_registration_id_foreign FOREIGN KEY (registration_id) REFERENCES public.registrations(id);


--
-- Name: funds funds_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT funds_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.funds(id) ON DELETE CASCADE;


--
-- Name: group_has_ideascale_profile group_has_ideascale_profile_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_has_ideascale_profile
    ADD CONSTRAINT group_has_ideascale_profile_group_id_foreign FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_has_ideascale_profile group_has_ideascale_profile_ideascale_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_has_ideascale_profile
    ADD CONSTRAINT group_has_ideascale_profile_ideascale_profile_id_foreign FOREIGN KEY (ideascale_profile_id) REFERENCES public.ideascale_profiles(id) ON DELETE CASCADE;


--
-- Name: group_has_proposal group_has_proposal_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_has_proposal
    ADD CONSTRAINT group_has_proposal_group_id_foreign FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_has_proposal group_has_proposal_proposal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_has_proposal
    ADD CONSTRAINT group_has_proposal_proposal_id_foreign FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: groups groups_owner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.ideascale_profiles(id) ON DELETE SET NULL;


--
-- Name: ideascale_profile_has_proposal ideascale_profile_has_proposal_ideascale_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideascale_profile_has_proposal
    ADD CONSTRAINT ideascale_profile_has_proposal_ideascale_profile_id_foreign FOREIGN KEY (ideascale_profile_id) REFERENCES public.ideascale_profiles(id) ON DELETE CASCADE;


--
-- Name: ideascale_profile_has_proposal ideascale_profile_has_proposal_proposal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideascale_profile_has_proposal
    ADD CONSTRAINT ideascale_profile_has_proposal_proposal_id_foreign FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: milestones milestones_fund_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_fund_id_foreign FOREIGN KEY (fund_id) REFERENCES public.funds(id) ON DELETE SET NULL;


--
-- Name: model_has_locations model_has_locations_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_locations
    ADD CONSTRAINT model_has_locations_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: model_signature model_signature_signature_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_signature
    ADD CONSTRAINT model_signature_signature_id_foreign FOREIGN KEY (signature_id) REFERENCES public.signatures(id) ON DELETE CASCADE;


--
-- Name: moderations moderations_review_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderations
    ADD CONSTRAINT moderations_review_id_foreign FOREIGN KEY (review_id) REFERENCES public.reviews(id);


--
-- Name: monthly_reports monthly_reports_ideascale_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_reports
    ADD CONSTRAINT monthly_reports_ideascale_profile_id_foreign FOREIGN KEY (ideascale_profile_id) REFERENCES public.ideascale_profiles(id) ON DELETE CASCADE;


--
-- Name: project_schedules proposal_milestones_fund_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_schedules
    ADD CONSTRAINT proposal_milestones_fund_id_foreign FOREIGN KEY (fund_id) REFERENCES public.funds(id) ON DELETE SET NULL;


--
-- Name: proposal_profiles proposal_profiles_proposal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_profiles
    ADD CONSTRAINT proposal_profiles_proposal_id_foreign FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposals proposals_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: proposals proposals_fund_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_fund_id_foreign FOREIGN KEY (fund_id) REFERENCES public.funds(id) ON DELETE SET NULL;


--
-- Name: ratings ratings_review_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_review_id_foreign FOREIGN KEY (review_id) REFERENCES public.reviews(id);


--
-- Name: reactions reactions_comment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_comment_id_foreign FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: review_moderation_reviewers review_moderation_reviewers_review_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_reviewers
    ADD CONSTRAINT review_moderation_reviewers_review_id_foreign FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_moderation_reviewers review_moderation_reviewers_review_moderation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_reviewers
    ADD CONSTRAINT review_moderation_reviewers_review_moderation_id_foreign FOREIGN KEY (review_moderation_id) REFERENCES public.review_moderations(id) ON DELETE CASCADE;


--
-- Name: review_moderation_reviewers review_moderation_reviewers_reviewer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_reviewers
    ADD CONSTRAINT review_moderation_reviewers_reviewer_id_foreign FOREIGN KEY (reviewer_id) REFERENCES public.reviewers(id) ON DELETE CASCADE;


--
-- Name: review_moderations review_moderations_reviewer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderations
    ADD CONSTRAINT review_moderations_reviewer_id_foreign FOREIGN KEY (reviewer_id) REFERENCES public.reviewers(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: service_model service_model_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_model
    ADD CONSTRAINT service_model_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: signatures signatures_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tinder_collections tinder_collections_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tinder_collections
    ADD CONSTRAINT tinder_collections_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voting_powers voting_powers_snapshot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voting_powers
    ADD CONSTRAINT voting_powers_snapshot_id_foreign FOREIGN KEY (snapshot_id) REFERENCES public.snapshots(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict f4J1ODjVZ7lSIJ4LAbcx93P7J4j5snLGatj7ZAa7ZmYt1ugocSZGAtPUSUgaNzx

--
-- PostgreSQL database dump
--

\restrict dIEDjHtxO5qh2Nd0G1UDTMkY4v0944iBhDKfava0y02oc2EQXoWRUj4mVS50atU

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.7 (Debian 17.7-3.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2018_01_01_000000_create_action_events_table	1
5	2019_05_10_000000_add_fields_to_action_events_table	1
6	2021_08_25_193039_create_nova_notifications_table	1
7	2022_04_26_000000_add_fields_to_nova_notifications_table	1
8	2022_12_19_000000_create_field_attachments_table	1
9	2024_11_05_090134_create_proposals_table	1
10	2024_11_06_151958_create_ideascale_profiles_table	1
11	2024_11_06_182434_create_permission_tables	1
12	2024_11_07_042703_create_media_table	1
13	2024_11_08_200551_create_funds_table	1
14	2024_11_11_081227_create_groups_table	1
15	2024_11_11_193040_create_communities_table	1
16	2024_11_11_195514_create_campaigns_table	1
17	2024_11_12_031807_create_reviewers_table	1
18	2024_11_12_182901_create_reviews_table	1
19	2024_11_13_115334_create_discussions_table	1
20	2024_11_13_142918_create_review_moderations_table	1
21	2024_11_13_143048_create_review_moderation_reviewers_table	1
22	2024_11_13_194731_create_announcements_table	1
23	2024_11_16_083959_create_ideascale_profile_has_proposal_table	1
24	2024_11_16_155059_create_model_tag_table	1
25	2024_11_17_184651_create_tags_table	1
26	2024_11_17_191254_create_group_has_proposal_pivot_table	1
27	2024_11_17_194548_create_community_has_proposal_table	1
28	2024_11_18_072644_create_metrics_table	1
29	2024_11_18_110720_create_translations_table	1
30	2024_12_03_111346_update_proposals_table	1
31	2024_12_04_054727_create_metas_table	1
32	2024_12_19_205130_add_two_factor_columns_to_users_table	1
33	2025_01_07_071224_create_bookmark_items_table	1
34	2025_01_07_072322_create_bookmark_collections_table	1
36	2025_01_13_092646_create_rules_table	1
37	2025_01_15_084905_create_comments_tables	1
38	2025_01_16_095414_create_monthly_reports_table	1
39	2025_01_18_061705_make_currency_column_nullabel_campaigns_table	1
40	2025_01_19_201521_create_catalyst_connections_table	1
41	2025_01_22_161320_create_registration_table	1
42	2025_01_22_163155_create_delegations_table	1
43	2025_01_23_065837_create_links_table	1
44	2025_01_26_111401_create_voters_table	1
45	2025_01_26_114051_create_voter_history_table	1
46	2025_01_28_080651_create_catalyst_snapshots_table	1
47	2025_01_28_170323_create_catalyst_voting_powers_table	1
48	2025_01_29_093831_create_group_has_ideascale_profile	1
49	2025_02_07_160006_create_locations_table	1
50	2025_02_07_160513_model_has_location	1
51	2025_02_12_094055_create_reviewer_reputation_scores_table	1
52	2025_02_12_094144_create_moderations_table	1
53	2025_02_12_100004_create_moderators_table	1
54	2025_02_13_065604_create_ratings_table	1
55	2025_02_21_053823_update_discussions_table	1
56	2025_02_24_095246_create_milestone_table	1
57	2025_02_24_100117_create_proposal_milestones_table	1
58	2025_02_24_100408_milestone_som_reviews_table	1
59	2025_02_24_100457_milestone_poas_table	1
60	2025_02_24_100514_milestone_poas_signoffs_table	1
61	2025_02_24_100541_milestone_poas_reviews_table	1
62	2025_02_26_121815_update_discussions_table	1
63	2025_02_27_194023_create_transactions_table	1
64	2025_03_01_020639_update_funds_table	1
65	2025_03_03_073213_create_nfts_table	1
66	2025_03_03_082933_create_txes_table	1
67	2025_03_04_165410_add_website_and_city_to_users_table	1
68	2025_03_06_091723_add_password_updated_at_to_users_table	1
69	2025_03_07_091723_add_location_id_to_users_table	1
70	2025_03_26_112655_update_milestone_qty_to_milestone_count	1
71	2025_03_26_194613_update_reputationscore_table	1
72	2025_03_29_220710_update_transactions_table	1
73	2025_04_01_123408_add_vote_column_to_bookmark_items_table	1
74	2025_04_09_120554_create_rankings_table	1
75	2025_04_10_095308_add_signatures_table	1
76	2025_04_14_120443_add_fingerprint_to_nfts_table	1
77	2025_04_16_143201_add_media_relationships_to_nfts	1
78	2025_04_19_203038_create_cardaon_budget_proposals_table	1
79	2025_04_23_125552_index_cat_reviewer_id_column	1
80	2025_04_24_113438_add_stake_address_signatures_table	1
81	2025_05_01_192808_create_services_table	1
82	2025_05_01_194348_create_service_model_table	1
83	2025_05_05_140234_alter_transactions_table	1
84	2025_05_09_052927_create_catalyst_dreps_table	1
85	2025_05_10_065701_create_model_signature_table	1
86	2025_06_03_164448_update__bookmark__collection	1
87	2025_06_16_091811_update_collection_tabel	1
88	2025_06_16_142810_creaete_proposals_tinder_table	1
95	2025_06_12_070927_add_wallet_name_to_signatures_table	2
96	2025_01_09_123317_create_bookmark_collections_users_table	3
97	2025_06_18_085155_create_community_has_users_table	4
98	2025_07_01_190711_add_fund_id_to_collection_table	5
99	2025_07_22_141239_create_categories_table	6
100	2025_07_23_100348_update_bookmark_collections_table	7
101	2025_07_23_103034_update_bookmark_collections_table	8
102	2025_07_23_141239_add_fields_service_table	9
135	2025_08_03_084337_create_catalyst_profiles_table	10
136	2025_08_03_123128_catalyst_profile_has_proposal	10
137	2025_08_03_123612_update_signature_table	10
138	2025_08_06_142830_update_metrics_table	11
139	create_proposal_profiles_table	12
140	migrate_to_polymorphic_proposal_profiles	12
172	2025_01_27_120000_migrate_ratings_table_to_uuid	13
173	2025_01_27_121000_migrate_voters_table_to_uuid	13
174	2025_01_27_122000_migrate_milestones_table_to_uuid	13
175	2025_01_27_123000_migrate_reviewers_table_to_uuid	13
176	2025_01_27_124000_migrate_link_location_metric_tables_to_uuid	13
177	2025_01_27_125000_migrate_moderation_moderator_monthlyreport_tables_to_uuid	13
178	2025_01_27_126000_migrate_proposal_milestones_table_to_uuid	13
179	2025_08_09_000000_create_proposal_profiles_table	13
180	2025_08_09_000010_migrate_to_polymorphic_proposal_profiles	13
181	2025_08_09_120000_add_uuid_to_funds_table	13
182	2025_08_09_120100_add_fund_uuid_to_referencing_tables	13
183	2025_08_09_120200_add_uuid_support_for_polymorphic_fund_references	13
184	2025_08_09_120300_switch_funds_to_uuid_primary_key	13
185	2025_08_09_120400_cleanup_old_fund_id_columns	13
186	2025_08_09_172100_add_uuid_to_groups_table	13
187	2025_08_09_172200_add_group_uuid_to_referencing_tables	13
188	2025_08_09_172300_add_uuid_support_for_polymorphic_group_references	13
189	2025_08_09_172400_switch_groups_to_uuid_primary_key	13
190	2025_08_09_172500_cleanup_old_group_id_columns	13
191	2025_08_09_174600_add_uuid_to_ideascale_profiles_table	13
192	2025_08_09_174650_fix_community_ideascale_profile_uuid	13
193	2025_08_09_174700_add_ideascale_profile_uuid_to_referencing_tables	13
194	2025_08_09_174800_finalize_ideascale_profile_uuid_columns	13
195	2025_08_09_174850_backfill_proposal_profiles_profile_id_uuid	13
196	2025_08_09_174900_switch_ideascale_profile_primary_key_to_uuid	13
197	2025_08_09_175000_add_uuid_to_campaigns	13
198	2025_08_09_175100_add_campaign_uuid_to_referencing_tables	13
199	2025_08_09_175200_finalize_campaign_uuid_columns	13
200	2025_08_09_175250_fix_orphaned_campaign_references	13
201	2025_08_09_175400_add_uuid_to_nfts	13
202	2025_08_09_175500_add_uuid_support_for_polymorphic_nft_references	13
203	2025_08_09_175600_switch_nft_primary_key_to_uuid	13
204	2025_08_09_175700_add_uuid_to_users	13
205	2025_08_09_175800_add_user_uuid_to_referencing_tables	13
206	2025_08_09_183541_add_uuid_support_to_media_table	13
207	2025_08_09_190000_make_media_model_id_text_and_backfill_from_uuid	13
208	2025_08_09_190100_make_spatie_polymorphic_model_ids_text	13
209	2025_08_09_190200_make_nova_notifications_notifiable_id_text	13
210	2025_08_09_190300_switch_signatures_user_id_to_uuid	13
211	2025_08_09_190400_backfill_spatie_user_model_ids_to_uuid	13
212	2025_08_09_192610_switch_campaign_primary_key_to_uuid_simple	13
213	2025_08_09_195633_switch_user_primary_key_to_uuid_simple	13
214	2025_08_09_200000_backfill_spatie_user_model_ids_to_uuid_final	13
215	2025_08_09_205926_update_proposal_profiles_profile_id_to_uuid	13
216	2025_08_11_083850_backfill_spatie_user_model_ids_to_uuid_force	13
217	2025_08_11_085500_cleanup_spatie_pivots_and_assign_super_admin	13
218	2025_08_11_090300_restore_and_map_spatie_pivots_to_uuid	13
219	2025_08_11_090600_fix_proposal_profiles_profile_id_to_uuid	13
220	2025_08_11_091400_map_proposal_profiles_to_uuid_working	13
221	2025_08_11_091848_migrate_proposals_to_uuid	13
222	2025_08_11_093129_fix_remaining_proposal_id_columns_to_uuid	13
223	2025_08_11_093228_fix_proposal_milestones_uuid	13
224	2025_08_11_093303_fix_ideascale_profile_has_proposal_uuid	13
225	2025_08_11_093420_fix_remaining_pivot_tables_uuid	13
226	2025_08_11_093657_fix_polymorphic_proposal_references_to_uuid	13
227	2025_08_11_094959_fix_all_remaining_uuid_model_references	13
228	2025_08_11_095950_fix_action_events_uuid_columns	13
229	2025_08_11_101636_update_model_tag_table_for_uuid_support	13
230	2025_08_11_125000_fix_reviews_discussions_polymorphic_uuid_references	13
231	2025_08_11_132703_update_connections_model_ids_to_text	13
232	2025_08_11_180155_convert_remaining_tables_to_uuids_v2	13
233	2025_08_11_200000_migrate_reviews_to_uuid	13
234	2025_08_12_064438_fix_proposal_profiles_profile_id_to_uuid_final	13
235	2025_08_12_065152_add_uuid_to_catalyst_profiles_table	13
236	2025_08_12_065217_update_catalyst_profile_references_to_uuid	13
237	2025_08_12_065245_switch_catalyst_profiles_to_uuid_primary_key	13
238	2025_08_12_065921_fix_bookmark_tables_uuid_compliance	13
239	2025_08_12_070509_fix_bookmark_collections_polymorphic_uuid_compliance	13
240	2025_08_12_070617_fix_bookmark_collections_user_id_uuid	13
241	2025_08_12_071426_add_uuid_to_tinder_collections_table	13
242	2025_08_12_071500_update_tinder_collections_references_to_uuid	13
243	2025_08_12_071535_switch_tinder_collections_to_uuid_primary_key	13
244	2025_08_12_072803_add_uuid_to_catalyst_dreps_table	13
245	2025_08_12_072837_update_catalyst_dreps_user_id_to_uuid	13
246	2025_08_12_072913_switch_catalyst_dreps_to_uuid_primary_key	13
247	2025_08_12_073931_add_uuid_columns_to_comments_table	13
248	2025_08_12_074011_update_comments_commentator_id_to_uuid	13
249	2025_08_12_074040_update_comments_commentable_id_to_text	13
250	2025_08_12_074106_convert_comments_primary_key_to_uuid	13
251	2025_08_12_074940_fix_comment_notification_subscriptions_uuid_compliance	13
252	2025_08_12_080111_add_uuid_to_communities_table	13
253	2025_08_12_080142_update_community_references_to_uuid	13
254	2025_08_12_080220_switch_communities_to_uuid_primary_key	13
255	2025_08_12_080807_cleanup_communities_old_id_column	13
256	2025_08_12_082314_fix_community_has_groups_group_id_uuid_compliance	13
257	2025_08_12_115145_migrate_groups_user_id_to_uuid	13
258	2025_08_12_115338_add_foreign_key_constraint_to_groups_owner_id	13
259	2025_08_12_142632_fix_review_moderation_uuid_relationships	13
260	2025_08_12_143451_fix_rules_table_model_id_uuid_references	13
261	2025_08_12_144035_migrate_services_and_service_model_to_uuid	13
262	2025_08_12_144749_migrate_transactions_table_to_uuid	14
263	2025_08_12_163323_fix_model_tag_table_for_uuid_proposals	14
264	2025_08_12_163906_fix_action_events_model_id_column_type	14
265	2025_08_12_165103_fix_ideascale_profiles_claimed_by_column	14
266	2025_08_13_055312_convert_proposal_profiles_profile_id_to_uuid	14
267	2025_08_13_060343_convert_model_has_locations_to_uuid	14
268	2025_08_13_061315_convert_nfts_model_id_to_uuid	14
269	2025_08_13_063749_fix_bookmark_collections_users_table_uuid_foreign_keys	14
270	2025_01_13_200000_migrate_media_model_ids_to_uuid	15
271	2025_01_13_201000_cleanup_orphaned_media_records	15
272	2025_01_13_202000_delete_orphaned_media_records	15
273	2025_01_13_203000_cleanup_media_model_uuid_column	15
274	2025_08_13_211500_migrate_discussions_model_id_to_uuid	16
275	2025_08_13_212200_migrate_discussions_user_id_to_uuid	16
276	2025_08_13_212430_convert_discussions_model_id_to_uuid_type	16
277	2025_08_13_213630_migrate_ratings_model_id_to_uuid	16
278	2025_08_13_214110_migrate_reviews_model_id_to_uuid	17
279	2025_08_14_091635_convert_media_model_id_to_uuid_type	18
280	2025_08_14_104726_convert_tags_to_uuid_primary_key	19
281	2025_08_15_141414_update_bookmark_item_table	20
282	2025_08_15_161146_update_category_table	20
283	2025_08_15_161550_update_metas_table	20
284	2025_08_15_162702_update_service_model_table	21
285	2025_08_16_182824_add_uuid_to_registrations_table	21
286	2025_08_16_183341_convert_delegations_to_uuid_primary_key	21
287	2025_08_16_183454_convert_snapshots_to_uuid_primary_key	21
288	2025_08_16_185923_convert_voting_powers_to_uuid_primary_key	21
289	2025_08_16_192000_convert_signatures_to_uuid_primary_key	22
290	2025_08_17_113308_convert_catalyst_drep_fields_to_json	22
291	2025_08_17_141834_create_catalyst_drep_user_table	22
292	2025_08_17_150031_update_profile_proposal_table	22
293	2025_08_17_150342_update_model_tag_table	22
294	2025_08_18_224144_add_not_null_constraints_to_group_has_proposal_table	23
295	2025_08_18_224703_add_uuid_validation_to_bookmark_items	23
296	2025_08_19_095102_update_user_table	24
297	2025_08_19_110134_update_signatures_table	24
298	2025_08_19_120748_update_catalyst_profiles_table	24
299	2025_08_26_134545_make_old_model_id_nullable_in_rules_table	25
300	2025_08_27_161937_update_bookmark_items_table	26
301	2025_08_27_174944_update_bookmarkitems_table	27
334	2025_01_31_000000_add_proposal_metrics_indexes	28
335	2025_08_28_194934_update_f-14_proposal	28
336	2025_08_31_162540_convert_bookmark_collection_model_id_to_uuid_type	29
337	2025_09_10_123306_update_catalyst_profiles_claimed_by_to_uuid	30
338	2025_09_10_231747_merge_duplicate_catalyst_profiles	31
339	2025_01_15_000000_merge_duplicate_ideascale_profiles	32
340	2025_01_15_000001_delete_ideascale_profiles_without_proposals	32
341	2025_01_15_000004_add_proposal_profiles_indexes_laravel	32
342	2025_09_15_095314_change_comments_commentable_id_to_uuid	33
343	2025_09_15_110656_change_bookmark_collections_type_id_to_uuid	34
344	2025_09_15_144820_import_bookmark_collections_and_items_from_csv	34
345	2025_09_18_101350_change_claimed_by_to_uuid_in_catalyst_profiles_table	35
346	2025_01_20_000000_create_claimed_profiles_table	36
347	2025_01_20_000001_migrate_existing_claimed_profiles_data	36
348	2025_01_20_000002_add_uuid_primary_key_to_claimed_profiles_table	37
349	2025_09_23_013729_change_metas_model_id_to_uuid	38
350	2025_09_23_211329_create_catalyst_tallies_table	39
351	2025_09_23_214620_import_catalyst_tallies_from_sql_dump	39
352	2025_09_24_000001_populate_catalyst_tallies_with_correct_mapping	39
353	2025_09_24_000002_update_null_context_id_to_fund_14	39
354	2025_09_29_005404_add_ranking_columns_to_catalyst_tallies_table	40
355	2025_09_29_105257_change_location_id_to_uuid_in_users_table	41
356	2025_10_05_105403_link_matched_profiles_to_users	42
357	2025_10_08_120000_change_snapshots_model_id_to_uuid	43
358	2025_10_14_155141_update_catalyst_voting_powers_consumed_column	44
359	2025_10_15_074031_update_fund14_consumed_voting_powers_correctly	45
360	2025_10_15_190502_update_consumed_voting_powers	46
361	2025_10_15_191502_consumed_voting_powers	46
362	2025_10_23_104215_add_unique_constraint_to_voting_powers_table	47
363	2025_11_30_145736_fix_missing_proposal_campaign_relations	48
364	2025_12_01_115758_remove_duplicate_proposal_profiles	49
365	2025_12_01_115906_add_unique_constraint_to_proposal_profiles	49
366	2025_12_07_145740_delete_orphaned_catalyst_document_id_metas	50
367	2025_12_08_074158_soft_delete_74_fund15_proposals_not_in_csv	50
368	2025_12_08_110533_add_missing_fund15_proposals	50
369	2025_12_10_140503_update_model_links_to_use_uuid_link_id	51
370	2025_12_10_172645_rename_projectcatalyst_io_url_to_projectcatalyst_io_link_in_proposals_table	51
371	2025_12_17_130917_add_completed_at_to_proposals_table	52
372	2025_12_27_073104_update_campaigns_currency_enum_to_match_catalyst_currencies	53
373	2025_12_29_111021_rename_proposal_milestones_to_project_schedules_table	54
374	2025_12_29_120119_update_project_schedules_status_constraint	54
375	2025_12_29_122306_rename_milestones_proposal_milestone_id_to_project_schedule_id	54
376	2025_12_29_130728_add_sequences_to_milestone_related_tables	54
377	2025_12_29_131004_convert_milestone_tables_to_uuid_with_api_id	54
378	2025_12_29_131204_update_milestone_foreign_keys_to_uuid	54
379	2025_12_29_131812_add_updated_at_to_milestone_tables	54
380	2025_12_29_142927_add_unique_constraint_to_milestones_table	54
381	2025_12_29_145858_add_api_proposal_id_to_project_schedules_table	54
382	2025_12_29_151525_update_milestones_unique_constraint_to_include_created_at	54
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 382, true);


--
-- PostgreSQL database dump complete
--

\unrestrict dIEDjHtxO5qh2Nd0G1UDTMkY4v0944iBhDKfava0y02oc2EQXoWRUj4mVS50atU


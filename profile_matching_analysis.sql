-- Profile Matching Analysis: IdeaScale vs Catalyst
-- This script identifies potential matches between ideascale_profiles and catalyst_profiles

-- First, let's create a view of ideascale profiles with extracted usernames
WITH ideascale_usernames AS (
    SELECT 
        id,
        name,
        username as ideascale_username,
        email,
        CASE 
            WHEN email IS NOT NULL AND email != '' THEN split_part(email, '@', 1)
            ELSE NULL 
        END as email_username,
        LOWER(COALESCE(username, split_part(email, '@', 1))) as searchable_username
    FROM ideascale_profiles 
    WHERE username IS NOT NULL OR (email IS NOT NULL AND email != '')
),

-- Create a view of catalyst profiles with extracted usernames
catalyst_usernames AS (
    SELECT 
        id,
        name,
        username as catalyst_username,
        catalyst_id,
        CASE 
            WHEN catalyst_id ~ 'id\.catalyst://.*@cardano/' THEN 
                LOWER(replace(replace(
                    split_part(split_part(catalyst_id, 'id.catalyst://', 2), '@cardano/', 1)
                , '%20', ' '), '%40', '@'))
            ELSE NULL 
        END as extracted_username_from_id,
        LOWER(username) as searchable_username
    FROM catalyst_profiles 
    WHERE catalyst_id IS NOT NULL OR username IS NOT NULL
),

-- Find exact username matches
exact_username_matches AS (
    SELECT 
        'username_match' as match_type,
        i.id as ideascale_id,
        i.name as ideascale_name,
        i.ideascale_username,
        i.email,
        c.id as catalyst_id,
        c.name as catalyst_name,
        c.catalyst_username,
        c.catalyst_id,
        c.extracted_username_from_id
    FROM ideascale_usernames i
    JOIN catalyst_usernames c ON i.searchable_username = c.searchable_username
    WHERE i.searchable_username IS NOT NULL 
      AND c.searchable_username IS NOT NULL
),

-- Find matches between ideascale email parts and catalyst usernames
email_to_username_matches AS (
    SELECT 
        'email_to_username' as match_type,
        i.id as ideascale_id,
        i.name as ideascale_name,
        i.ideascale_username,
        i.email,
        c.id as catalyst_id,
        c.name as catalyst_name,
        c.catalyst_username,
        c.catalyst_id,
        c.extracted_username_from_id
    FROM ideascale_usernames i
    JOIN catalyst_usernames c ON LOWER(i.email_username) = c.searchable_username
    WHERE i.email_username IS NOT NULL 
      AND c.searchable_username IS NOT NULL
),

-- Find matches between ideascale usernames and extracted catalyst_id usernames
username_to_catalyst_id_matches AS (
    SELECT 
        'username_to_catalyst_id' as match_type,
        i.id as ideascale_id,
        i.name as ideascale_name,
        i.ideascale_username,
        i.email,
        c.id as catalyst_id,
        c.name as catalyst_name,
        c.catalyst_username,
        c.catalyst_id,
        c.extracted_username_from_id
    FROM ideascale_usernames i
    JOIN catalyst_usernames c ON i.searchable_username = c.extracted_username_from_id
    WHERE i.searchable_username IS NOT NULL 
      AND c.extracted_username_from_id IS NOT NULL
),

-- Find matches between ideascale email parts and extracted catalyst_id usernames
email_to_catalyst_id_matches AS (
    SELECT 
        'email_to_catalyst_id' as match_type,
        i.id as ideascale_id,
        i.name as ideascale_name,
        i.ideascale_username,
        i.email,
        c.id as catalyst_id,
        c.name as catalyst_name,
        c.catalyst_username,
        c.catalyst_id,
        c.extracted_username_from_id
    FROM ideascale_usernames i
    JOIN catalyst_usernames c ON LOWER(i.email_username) = c.extracted_username_from_id
    WHERE i.email_username IS NOT NULL 
      AND c.extracted_username_from_id IS NOT NULL
),

-- Combine all matches
all_matches AS (
    SELECT * FROM exact_username_matches
    UNION ALL
    SELECT * FROM email_to_username_matches  
    UNION ALL
    SELECT * FROM username_to_catalyst_id_matches
    UNION ALL
    SELECT * FROM email_to_catalyst_id_matches
)

-- Final results with match confidence
SELECT 
    match_type,
    ideascale_id,
    ideascale_name,
    ideascale_username,
    email,
    catalyst_id,
    catalyst_name,
    catalyst_username,
    catalyst_id as full_catalyst_id,
    extracted_username_from_id,
    CASE 
        WHEN match_type = 'username_match' THEN 'HIGH'
        WHEN match_type = 'email_to_username' THEN 'HIGH'
        WHEN match_type = 'username_to_catalyst_id' THEN 'MEDIUM'
        WHEN match_type = 'email_to_catalyst_id' THEN 'MEDIUM'
        ELSE 'LOW'
    END as confidence_level
FROM all_matches
ORDER BY 
    CASE 
        WHEN match_type = 'username_match' THEN 1
        WHEN match_type = 'email_to_username' THEN 2
        WHEN match_type = 'username_to_catalyst_id' THEN 3
        WHEN match_type = 'email_to_catalyst_id' THEN 4
        ELSE 5
    END,
    ideascale_name;
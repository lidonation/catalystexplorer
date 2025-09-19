<div class="table-container">
    <table class="proposal-table">
        <thead>
            <tr>
                @foreach($columns as $column)
                    <th class="{{ $column }}-column">
                        @switch($column)
                            @case('title')
                                {{ __('pdf.table.columns.title') }}
                                @break
                            @case('budget')
                                {{ __('pdf.table.columns.budget') }}
                                @break
                            @case('category')
                                {{ __('pdf.table.columns.category') }}
                                @break
                            @case('openSourced')
                            @case('opensource')
                                {{ __('pdf.table.columns.openSourced') }}
                                @break
                            @case('teams')
                            @case('users')
                                {{ __('pdf.table.columns.team') }}
                                @break
                            @case('fund')
                                {{ __('pdf.table.columns.fund') }}
                                @break
                            @case('yesVotes')
                            @case('yes_votes_count')
                                {{ __('pdf.table.columns.yesVotes') }}
                                @break
                            @case('abstainVotes')
                            @case('abstain_votes_count')
                                {{ __('pdf.table.columns.abstainVotes') }}
                                @break
                            @case('no_votes_count')
                                {{ __('pdf.table.columns.noVotes') }}
                                @break
                            @case('status')
                            @case('funding_status')
                            @case('project_status')
                                {{ __('pdf.table.columns.status') }}
                                @break
                            @case('funding')
                                {{ __('pdf.table.columns.funding') }}
                                @break
                            @case('amount_requested')
                                {{ __('pdf.table.columns.amountRequested') }}
                                @break
                            @case('amount_received')
                                {{ __('pdf.table.columns.amountReceived') }}
                                @break
                            @case('definition_of_success')
                                {{ __('pdf.table.columns.definitionOfSuccess') }}
                                @break
                            @case('website')
                                {{ __('pdf.table.columns.website') }}
                                @break
                            @case('excerpt')
                                {{ __('pdf.table.columns.excerpt') }}
                                @break
                            @case('content')
                                {{ __('pdf.table.columns.content') }}
                                @break
                            @case('funded_at')
                                {{ __('pdf.table.columns.fundedAt') }}
                                @break
                            @case('funding_updated_at')
                                {{ __('pdf.table.columns.fundingUpdatedAt') }}
                                @break
                            @case('comment_prompt')
                                {{ __('pdf.table.columns.commentPrompt') }}
                                @break
                            @case('social_excerpt')
                                {{ __('pdf.table.columns.socialExcerpt') }}
                                @break
                            @case('ideascale_link')
                                {{ __('pdf.table.columns.ideascaleLink') }}
                                @break
                            @case('projectcatalyst_io_link')
                                {{ __('pdf.table.columns.projectCatalystLink') }}
                                @break
                            @case('type')
                                {{ __('pdf.table.columns.type') }}
                                @break
                            @case('meta_title')
                                {{ __('pdf.table.columns.metaTitle') }}
                                @break
                            @case('problem')
                                {{ __('pdf.table.columns.problem') }}
                                @break
                            @case('solution')
                                {{ __('pdf.table.columns.solution') }}
                                @break
                            @case('experience')
                                {{ __('pdf.table.columns.experience') }}
                                @break
                            @case('currency')
                                {{ __('pdf.table.columns.currency') }}
                                @break
                            @case('ranking_total')
                                {{ __('pdf.table.columns.rankingTotal') }}
                                @break
                            @case('alignment_score')
                                {{ __('pdf.table.columns.alignmentScore') }}
                                @break
                            @case('feasibility_score')
                                {{ __('pdf.table.columns.feasibilityScore') }}
                                @break
                            @case('auditability_score')
                                {{ __('pdf.table.columns.auditabilityScore') }}
                                @break
                            @case('quickpitch')
                                {{ __('pdf.table.columns.quickpitch') }}
                                @break
                            @case('quickpitch_length')
                                {{ __('pdf.table.columns.quickpitchLength') }}
                                @break
                            @case('link')
                                {{ __('pdf.table.columns.link') }}
                                @break
                            @case('user_rationale')
                                {{ __('pdf.table.columns.userRationale') }}
                                @break
                            @default
                                {{ ucwords(str_replace(['_', '.'], ' ', $column)) }}
                        @endswitch
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($proposals as $proposal)
                <tr>
                    @foreach($columns as $column)
                        <td class="{{ $column }}-cell {{ $column === 'yesVotes' || $column === 'yes_votes_count' ? 'votes-cell yes-vote' : '' }} {{ $column === 'abstainVotes' || $column === 'abstain_votes_count' ? 'votes-cell abstain-vote' : '' }} {{ $column === 'no_votes_count' ? 'votes-cell no-vote' : '' }}">
                            @switch($column)
                                @case('title')
                                    <div class="proposal-title">{{ $proposal['title'] ?? '' }}</div>
                                    @break
                                
                                @case('budget')
                                    @if(isset($proposal['amount_requested']) && $proposal['amount_requested'])
                                        {{ format_currency_short($proposal['amount_requested'], $proposal['currency'] ?? 'A', 0) }}
                                    @else
                                        –
                                    @endif
                                    @break
                                
                                @case('category')
                                    {{ $proposal['campaign']['title'] ?? $proposal['fund']['label'] ?? '–' }}
                                    @break
                                
                                @case('openSourced')
                                @case('opensource')
                                    {{ isset($proposal['opensource']) && $proposal['opensource'] ? __('pdf.table.values.yes') : __('pdf.table.values.no') }}
                                    @break
                                
                                @case('teams')
                                @case('users')
                                    @if(isset($proposal['users']) && is_array($proposal['users']) && count($proposal['users']) > 0)
                                        <div class="team-avatars">
                                            @php
                                                $userCount = count($proposal['users']);
                                                $displayUsers = array_slice($proposal['users'], 0, 5);
                                            @endphp
                                            @foreach($displayUsers as $user)
                                                @php
                                                    $base64Image = null;
                                                    $userName = 'User';
                                                    $heroImgUrl = null;
                                                    
                                                    // Extract user data with full profile information
                                                    if (is_array($user)) {
                                                        $userName = $user['name'] ?? 'User';
                                                        $heroImgUrl = $user['hero_img_url'] ?? null;
                                                    } elseif (is_object($user)) {
                                                        $userName = $user->name ?? 'User';
                                                        $heroImgUrl = $user->hero_img_url ?? null;
                                                    }
                                                    
                                                    // Try to load avatar image if URL is available
                                                    if ($heroImgUrl) {
                                                        $base64Image = getBase64Image($heroImgUrl);
                                                    }
                                                @endphp
                                                @if($base64Image)
                                                    <div class="avatar">
                                                        <img src="{{ $base64Image }}" alt="{{ $userName }}" />
                                                    </div>
                                                @else
                                                    <div class="avatar">{{ substr($userName, 0, 1) }}</div>
                                                @endif
                                            @endforeach
                                            @if($userCount > 5)
                                                <span class="team-count">+{{ $userCount - 5 }}</span>
                                            @endif
                                        </div>
                                    @else
                                        –
                                    @endif
                                    @break
                                
                                @case('fund')
                                    {{ $proposal['fund']['label'] ?? '–' }}
                                    @break
                                
                                @case('yesVotes')
                                @case('yes_votes_count')
                                    @if(isset($proposal['yes_votes_count']))
                                        {{ format_short_number($proposal['yes_votes_count'], 0) }}
                                    @else
                                        0
                                    @endif
                                    @break
                                
                                @case('abstainVotes')
                                @case('abstain_votes_count')
                                    @if(isset($proposal['abstain_votes_count']))
                                        {{ format_short_number($proposal['abstain_votes_count'], 0) }}
                                    @else
                                        0
                                    @endif
                                    @break
                                
                                @case('no_votes_count')
                                    @if(isset($proposal['no_votes_count']))
                                        {{ format_short_number($proposal['no_votes_count'], 0) }}
                                    @else
                                        0
                                    @endif
                                    @break
                                
                                @case('status')
                                @case('funding_status')
                                @case('project_status')
                                    @php
                                        // Handle different status column types
                                        $statusValue = match($column) {
                                            'funding_status' => $proposal['funding_status'] ?? '–',
                                            'project_status' => $proposal['project_status'] ?? $proposal['status'] ?? '–',
                                            'status' => $proposal['status'] ?? $proposal['project_status'] ?? $proposal['funding_status'] ?? '–',
                                            default => $proposal[$column] ?? '–'
                                        };
                                        echo formatStatusText($statusValue);
                                    @endphp
                                    @break
                                
                                @case('funding')
                                    @if(isset($proposal['amount_received']) && $proposal['amount_received'])
                                        {{ format_currency_short($proposal['amount_received'], $proposal['currency'] ?? 'ADA', 0) }}
                                    @else
                                        –
                                    @endif
                                    @break
                                
                                @default
                                    @php
                                        $value = data_get($proposal, $column, '–');
                                        echo formatColumnValue($value);
                                    @endphp
                            @endswitch
                        </td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
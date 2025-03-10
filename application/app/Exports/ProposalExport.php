<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Proposal;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Database\Eloquent\Relations\Relation;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithProperties;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class ProposalExport implements FromQuery, HasLocalePreference, ShouldAutoSize, WithColumnFormatting, WithHeadings, WithMapping, WithProperties
{
    use Exportable;

    protected int $id;

    public function __construct(
        protected $proposals,
        protected string $locale
    ) {}

    public function query(): Proposal|Relation|Builder|\Laravel\Scout\Builder|\Illuminate\Database\Query\Builder
    {
        return Proposal::withOnly(['fund', 'groups'])->whereKey($this->proposals);
    }

    public function map($proposal): array
    {
        foreach ($proposal->discussions as $discussion) {
            $title = ($discussion->title == 'Addresses Challenge')
                ? 'impact'
                : str_replace(' ', '_', strtolower($discussion->title));

            $proposal->{$title.'_count'} = $discussion->ratings_count;
            $proposal->{$title.'_score'} = floatval($discussion->ratings_avg_rating);
        }

        return [
            $proposal->title,
            $proposal->amount_requested,
            $proposal->amount_received,
            $proposal->funding_status,
            $proposal->status,
            $proposal->yes_votes_count,
            $proposal->no_votes_count,
            $proposal->abstain_votes_count,
            $proposal->fund?->title,
            $proposal->groups?->map(fn ($g) => $g->name)?->implode(', '),
            $proposal->users?->map(fn ($u) => $u->name ?? $u->username)?->implode(', '),
            $proposal->ideascale_link,
            $proposal->problem,
            $proposal->solution,
            $proposal->impact_count,
            $proposal->meta_info->alignment_score ?? $proposal->impact_score,
            $proposal->feasibility_count,
            $proposal->meta_info->feasibility_score ?? $proposal->feasibility_score,
            $proposal->auditability_count,
            $proposal->meta_info->auditability_score ?? $proposal->auditability_score,
        ];
    }

    public function headings(): array
    {
        return [
            'title',
            'amount_requested',
            'amount_received',
            'funding_status',
            'project_status',
            'yes_votes',
            'no_votes',
            'abstain_votes_count',
            'fund',
            'group',
            'team',
            'ideascale_link',
            'problem',
            'solution',

            'impact_or_addresses_challenge_count',
            'impact_or_addresses_challenge_score',

            'feasibility_count',
            'feasibility_score',

            'value_or_auditability_count',
            'value_or_auditability_score',
        ];
    }

    public function preferredLocale(): ?string
    {
        return $this->locale;
    }

    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_CURRENCY_USD_INTEGER,
            'C' => NumberFormat::FORMAT_CURRENCY_USD_INTEGER,
            'J' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
        ];
    }

    public function properties(): array
    {
        return [
            'title' => 'Catalyst Explorer Proposals',
            'subject' => 'Proposals',
            'category' => 'Catalyst Explorer',
            'description' => '2 Lovelaces Catalyst Explorer Proposals Export',
        ];
    }
}

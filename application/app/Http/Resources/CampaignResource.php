<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'amount' => $this->amount,
            'launched_at' => $this->launched_at,
            'awarded_at' => $this->awarded_at,
            'color' => $this->color,
            'label' => $this->label,

            // Full content (only when include_content=true)
            'content' => $this->when($request->boolean('include_content'), $this->content),

            // Parsed content sections (only when include_content=true)
            'overview' => $this->when($request->boolean('include_content'), fn () => $this->parseContentSection('Overview')),
            'budget_constraints' => $this->when($request->boolean('include_content'), fn () => $this->parseBudgetConstraints()),
            'areas_of_interest' => $this->when($request->boolean('include_content'), fn () => $this->parseAreasOfInterest()),
            'who_should_apply' => $this->when($request->boolean('include_content'), fn () => $this->parseContentSection('Core Eligibility')),
            'defining_criteria' => $this->when($request->boolean('include_content'), fn () => $this->parseContentSection('Defining')),
            'proposal_guidance' => $this->when($request->boolean('include_content'), fn () => $this->parseContentSection('Proposal Requirements')),
            'self_assessment_checklist' => $this->when($request->boolean('include_content'), fn () => $this->parseContentSection('Self-Assessment Checklist')),
        ];
    }

    /**
     * Parse a specific section from the markdown content
     */
    private function parseContentSection(string $sectionName): ?string
    {
        if (! $this->content) {
            return null;
        }

        // Special handling for Overview - may be at the start without a header
        if (strtolower($sectionName) === 'overview') {
            return $this->parseOverviewSection();
        }

        $escapedName = preg_quote($sectionName, '/');

        // Match markdown headers: # Section Name, ## Section Name, or ### Section Name
        // Capture content until next header, horizontal rule, or end of string
        $pattern = '/^#{1,3}\s*'.$escapedName.'[^\n]*\n(.*?)(?=^#{1,3}\s|^---\s*$|$)/smi';

        if (preg_match($pattern, $this->content, $matches)) {
            return trim($matches[1]);
        }

        // Fallback: try with bold marker **Section Name**
        $patternBold = '/\*\*'.$escapedName.'\*\*\.?\s*\n(.*?)(?=^#{1,3}\s|\*\*[A-Z]|^---\s*$|$)/smi';

        if (preg_match($patternBold, $this->content, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    /**
     * Parse overview section - handles content at beginning without header
     */
    private function parseOverviewSection(): ?string
    {
        // First try to find explicit # Overview header
        if (preg_match('/^#{1,2}\s*Overview[^\n]*\n(.*?)(?=^#{1,2}\s|^---\s*$|$)/smi', $this->content, $matches)) {
            return trim($matches[1]);
        }

        // No explicit Overview header - content at start before first ## or ---
        // Get content from start until first ## header or --- horizontal rule
        if (preg_match('/^(.*?)(?=^#{1,2}\s|^---\s*$|\*\*Budget)/smi', $this->content, $matches)) {
            $overview = trim($matches[1]);
            // Only return if it's substantial (more than just whitespace)
            if (strlen($overview) > 50) {
                return $overview;
            }
        }

        return null;
    }

    /**
     * Parse areas of interest as an array of items
     */
    private function parseAreasOfInterest(): ?array
    {
        if (! $this->content) {
            return null;
        }

        // Split content by horizontal rule delimiters (---)
        $sections = preg_split('/^---+\s*$/m', $this->content);

        // Find the section containing "Areas of Interest"
        $section = null;
        foreach ($sections as $sec) {
            if (stripos($sec, 'Areas of Interest') !== false) {
                // Extract content after the header
                if (preg_match('/Areas of Interest[^\n]*\n(.*)$/si', $sec, $match)) {
                    $section = trim($match[1]);
                }
                break;
            }
        }

        if (! $section) {
            return null;
        }

        // Parse list items (lines starting with - or * followed by **bold title**:)
        $items = [];
        preg_match_all('/^[\-\*]\s*\*\*([^*]+)\*\*[:\s]*(.*)$/m', $section, $matches, PREG_SET_ORDER);

        if (! empty($matches)) {
            foreach ($matches as $match) {
                $title = trim($match[1]);
                $title = rtrim($title, ':'); // Remove trailing colon
                $description = trim($match[2]);
                if ($title) {
                    $items[] = [
                        'title' => $title,
                        'description' => $description ?: null,
                    ];
                }
            }
        }

        // Fallback: simple list items without bold
        if (empty($items)) {
            preg_match_all('/^[\-\*]\s*(.+)$/m', $section, $simpleMatches);
            if (! empty($simpleMatches[1])) {
                foreach ($simpleMatches[1] as $item) {
                    $cleaned = trim(strip_tags($item));
                    // Remove markdown bold markers
                    $cleaned = preg_replace('/\*\*([^*]+)\*\*/', '$1', $cleaned);
                    if ($cleaned) {
                        $items[] = $cleaned;
                    }
                }
            }
        }

        return ! empty($items) ? $items : null;
    }

    /**
     * Parse budget & constraints section
     */
    private function parseBudgetConstraints(): ?array
    {
        if (! $this->content) {
            return null;
        }

        // Find **Budget & Constraints** or similar patterns
        $pattern = '/\*\*Budget[^*]*\*\*\.?\s*\n(.*?)(?=^#{1,3}\s|\*\*[A-Z]|^---\s*$|$)/smi';

        if (! preg_match($pattern, $this->content, $match)) {
            return null;
        }

        $section = trim($match[1]);
        $result = [];

        // Parse list items for budget info
        preg_match_all('/^[\-\*]\s*(.+)$/m', $section, $matches);

        if (! empty($matches[1])) {
            foreach ($matches[1] as $item) {
                $cleaned = trim($item);
                // Try to extract key: value pairs
                if (preg_match('/^([^:]+):\s*(.+)$/', $cleaned, $kvMatch)) {
                    $key = trim($kvMatch[1]);
                    $value = trim($kvMatch[2]);
                    $result[strtolower(str_replace(' ', '_', $key))] = $value;
                } else {
                    $result[] = $cleaned;
                }
            }
        }

        return ! empty($result) ? $result : null;
    }
}

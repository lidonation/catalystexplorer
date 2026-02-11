<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Service to parse structured content from proposal markdown.
 *
 * Handles different formats across fund eras:
 * - Fund 6-9: Simple headers like "## Solution"
 * - Fund 10-13: Headers like "### [SOLUTION]" or "### \[SOLUTION\]"
 * - Fund 14+: Structured JSONB (no parsing needed - handled by accessors)
 */
class ProposalContentParserService
{
    /**
     * Regex patterns for extracting content sections.
     * Multiple patterns per key to handle different fund formats.
     * Patterns are tried in order - first match wins.
     */
    private array $patterns = [
        'project_details' => [
            'solution' => [
                '/###\s*\\\?\[SOLUTION\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Solution\s*\n(.*?)(?=##\s|\z)/si',
                // Fund 4: [IMPACT] Summarize your solution
                '/\[IMPACT\][^\n]*\n(.*?)(?=\[|\z)/si',
                '/^\*\*Solution[:\s]*\*\*\s*(.*?)(?=^\*\*[A-Z]|\n\n\n|\z)/smi',
            ],
            'impact' => [
                '/###\s*\\\?\[IMPACT\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Impact\s*\n(.*?)(?=##\s|\z)/si',
                // Fund 7-8: ### Why is it important?
                '/###\s*Why\s+is\s+it\s+important\??\s*\n(.*?)(?=###\s|\z)/si',
                '/^\*\*Impact[:\s]*\*\*\s*(.*?)(?=^\*\*[A-Z]|\n\n\n|\z)/smi',
            ],
            'feasibility' => [
                '/###\s*\\\?\[CAPABILITY\s*(?:&|AND)?\s*FEASIBILITY\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/###\s*\\\?\[FEASIBILITY\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Feasibility\s*\n(.*?)(?=##\s|\z)/si',
                '/##\s*Capability.*?Feasibility\s*\n(.*?)(?=##\s|\z)/si',
            ],
            'outputs' => [
                '/###\s*\\\?\[OUTPUTS?\s*(?:&|AND)?\s*OUTCOMES?\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Outputs?\s*(?:and|&)?\s*Outcomes?\s*\n(.*?)(?=##\s|\z)/si',
                // Fund 7-8: ### What does success look like?
                '/###\s*What\s+does\s+success\s+look\s+like\??\s*\n(.*?)(?=###\s|\z)/si',
            ],
        ],
        'pitch' => [
            'team' => [
                '/###\s*\\\?\[TEAM\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Team\s*\n(.*?)(?=##\s|\z)/si',
                '/^\*\*Team[:\s]*\*\*\s*(.*?)(?=^\*\*[A-Z]|\n\n\n|\z)/smi',
            ],
            'budget' => [
                '/###\s*\\\?\[BUDGET\s*(?:&|AND)?\s*COSTS?\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/###\s*\\\?\[BUDGET\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Budget\s*\n(.*?)(?=##\s|\z)/si',
                '/^\*\*Budget[:\s]*\*\*\s*(.*?)(?=^\*\*[A-Z]|\n\n\n|\z)/smi',
            ],
            'milestones' => [
                '/###\s*\\\?\[PROJECT\s*MILESTONES?\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/###\s*\\\?\[MILESTONES?\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Milestones?\s*\n(.*?)(?=##\s|\z)/si',
                '/##\s*Project\s*Milestones?\s*\n(.*?)(?=##\s|\z)/si',
            ],
            'value' => [
                '/###\s*\\\?\[VALUE\s*(?:FOR)?\s*MONEY\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Value\s*(?:for)?\s*Money\s*\n(.*?)(?=##\s|\z)/si',
            ],
            'resources' => [
                '/###\s*\\\?\[RESOURCES\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Resources\s*\n(.*?)(?=##\s|\z)/si',
            ],
        ],
        'category_questions' => [
            'detailed_plan' => [
                '/###\s*Detailed\s*Plan\s*\n(.*?)(?=###|\z)/si',
                '/##\s*Detailed\s*Plan\s*\n(.*?)(?=##|\z)/si',
                // Fund 2-3: "Detailed plan - Fill in here..."
                '/Detailed\s+plan\s*[-–—]\s*[^\n]*\n(.*?)(?=\z)/si',
            ],
            'target' => [
                '/###\s*\\\?\[TARGET\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Target\s*\n(.*?)(?=##\s|\z)/si',
            ],
            'activities' => [
                '/###\s*\\\?\[ACTIVITIES\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Activities\s*\n(.*?)(?=##\s|\z)/si',
            ],
            'performance_metrics' => [
                '/###\s*\\\?\[PERFORMANCE\s*METRICS?\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Performance\s*Metrics?\s*\n(.*?)(?=##\s|\z)/si',
                '/###\s*Key\s+Metrics\s+to\s+measure\s*\n(.*?)(?=###\s|\z)/si',
            ],
            'success_criteria' => [
                '/###\s*\\\?\[SUCCESS\s*CRITERIA\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Success\s*Criteria\s*\n(.*?)(?=##\s|\z)/si',
                '/##\s*Definition\s*of\s*Success\s*\n(.*?)(?=##\s|\z)/si',
            ],
        ],
        'theme' => [
            'group' => [
                '/###\s*\\\?\[GROUP\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Group\s*\n(.*?)(?=##\s|\z)/si',
            ],
            'tag' => [
                '/###\s*\\\?\[TAG\][^\n]*\n(.*?)(?=###\s*\\\?\[|\z)/si',
                '/##\s*Tag\s*\n(.*?)(?=##\s|\z)/si',
            ],
        ],
    ];

    /**
     * Parse content for a specific field type.
     *
     * @param  string  $content  The raw markdown content
     * @param  string  $field  The field type: 'project_details', 'pitch', 'category_questions', 'theme'
     */
    public function parse(string $content, string $field): ?array
    {
        if (empty(trim($content))) {
            return null;
        }
        $content = str_replace(['\\[', '\\]'], ['[', ']'], $content);

        $patterns = $this->patterns[$field] ?? [];

        if (empty($patterns)) {
            Log::warning("ProposalContentParserService: Unknown field type '{$field}'");

            return null;
        }

        $result = [];
        $hasHeaderStructure = (bool) preg_match('/^#{2,3}\s+/m', $content);

        foreach ($patterns as $key => $keyPatterns) {
            foreach ($keyPatterns as $pattern) {
                // Skip bold-format patterns when content has header structure
                if ($hasHeaderStructure && str_contains($pattern, '\\*\\*')) {
                    continue;
                }

                if (preg_match($pattern, $content, $matches)) {
                    $extractedContent = $this->cleanContent($matches[1]);
                    if (! empty($extractedContent)) {
                        $result[$key] = $extractedContent;
                    }
                    break;
                }
            }
        }

        return ! empty($result) ? $result : null;
    }

    /**
     * Parse all supported fields from content at once.
     *
     * For proposals with no structured sections (e.g., plain text from Fund 2-5),
     * falls back to storing the entire content as project_details.solution.
     * For proposals with only ### Detailed Plan (Fund 6-7), promotes that content
     * to project_details.solution if no specific project_details sections exist.
     *
     * @param  string  $content  The raw markdown content
     * @return array Associative array of all parsed fields
     */
    public function parseAll(string $content): array
    {
        $results = [];

        foreach (array_keys($this->patterns) as $field) {
            $parsed = $this->parse($content, $field);
            if ($parsed !== null) {
                $results[$field] = $parsed;
            }
        }

        // Fallback: if no project_details found, use available content
        if (! isset($results['project_details'])) {
            $fallbackContent = $this->getFallbackProjectDetails($content, $results);
            if ($fallbackContent !== null) {
                $results['project_details'] = $fallbackContent;
            }
        }

        return $results;
    }

    /**
     * Parse a field with fallback logic for project_details.
     *
     * Unlike parse(), this method applies fallback strategies when
     * project_details patterns don't match:
     * 1. Promotes category_questions.detailed_plan to project_details.solution
     * 2. Uses full content as project_details.solution for plain text
     *
     * @param  string  $content  The raw markdown content
     * @param  string  $field  The field type to parse
     * @param  array|null  $allParsed  Pre-parsed results from all fields (to avoid re-parsing for fallback)
     * @return array|null Parsed data or null if nothing found
     */
    public function parseWithFallback(string $content, string $field, ?array $allParsed = null): ?array
    {
        // Try normal parsing first
        $result = $this->parse($content, $field);
        if ($result !== null) {
            return $result;
        }

        // Only apply fallback for project_details
        if ($field !== 'project_details') {
            return null;
        }

        // Build existing results for fallback context
        if ($allParsed === null) {
            $allParsed = [];
            foreach (array_keys($this->patterns) as $f) {
                if ($f !== 'project_details') {
                    $parsed = $this->parse($content, $f);
                    if ($parsed !== null) {
                        $allParsed[$f] = $parsed;
                    }
                }
            }
        }

        return $this->getFallbackProjectDetails($content, $allParsed);
    }

    /**
     * Get fallback project_details when no structured sections were found.
     *
     * Strategy:
     * 1. If category_questions.detailed_plan exists, use it as solution
     * 2. Otherwise, if the content is plain text (no section headers), use full content
     */
    private function getFallbackProjectDetails(string $content, array $existingResults): ?array
    {
        // Strategy 1: Promote detailed_plan from category_questions to project_details.solution
        if (isset($existingResults['category_questions']['detailed_plan'])) {
            return ['solution' => $existingResults['category_questions']['detailed_plan']];
        }

        // Strategy 2: For plain text content, use the full content as solution
        $cleaned = $this->cleanContent($content);
        if (! empty($cleaned) && strlen($cleaned) >= 50) {
            return ['solution' => $cleaned];
        }

        return null;
    }

    /**
     * Clean extracted content by removing excess whitespace and normalizing formatting.
     */
    private function cleanContent(string $content): string
    {
        $content = trim($content);

        // Normalize line endings
        $content = str_replace("\r\n", "\n", $content);

        // Remove excessive blank lines (more than 2 consecutive)
        $content = preg_replace("/\n{3,}/", "\n\n", $content);

        // Remove trailing whitespace from each line
        $content = implode("\n", array_map('rtrim', explode("\n", $content)));

        // Unescape common markdown escapes from Catalyst content
        $content = str_replace(
            ['\\[', '\\]', '\\(', '\\)', '\\.', '\\-', '\\_', '\\*'],
            ['[', ']', '(', ')', '.', '-', '_', '*'],
            $content
        );

        return trim($content);
    }

    /**
     * Check if content appears to have parseable sections.
     *
     * Useful for determining if parsing should be attempted.
     */
    public function hasParsableSections(string $content): bool
    {
        // Normalize escaped brackets before checking
        $content = str_replace(['\\[', '\\]'], ['[', ']'], $content);

        // Check for common section markers
        $markers = [
            '/###\s*\[/i',                        // Fund 9-13: ### [SOLUTION], ### [IMPACT], etc.
            '/##\s+[A-Z][a-z]+\s*\n/i',           // Fund 6-8: ## Solution, ## Impact, etc.
            '/\*\*[A-Z][a-z]+[:\s]*\*\*/i',       // Bold format: **Solution:**, etc.
            '/###\s*(?:Why|What|Key\s+Metrics)/i', // Fund 7-8: natural language headers
            '/\[IMPACT\]/i',                       // Fund 4: [IMPACT] without ###
            '/Detailed\s+plan\s*[-–—]/i',          // Fund 2-3: "Detailed plan -"
        ];

        foreach ($markers as $marker) {
            if (preg_match($marker, $content)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the list of supported field types.
     */
    public function getSupportedFields(): array
    {
        return array_keys($this->patterns);
    }

    /**
     * Get the keys for a specific field type.
     */
    public function getFieldKeys(string $field): array
    {
        return array_keys($this->patterns[$field] ?? []);
    }
}

# Catalyst Proposal Analysis Prompt

Analyze this Project Catalyst proposal and provide insights based on the Fund 14 scoring rubric:

**PROPOSAL DETAILS:**
Title: {title}
Amount Requested: {amount} {currency}
Status: {funding_status}
Project Length: {project_length} months
Open Source: {open_source}

**PROBLEM STATEMENT:**
{problem}

**PROPOSED SOLUTION:**
{solution}

**TEAM EXPERIENCE:**
{experience}

**ADDITIONAL CONTENT:**
{content}

**SCORING CRITERIA:**

1. **ALIGNMENT (30 points total)**:
   - Addresses the Challenge (10 pts): Does it clearly address the challenge?
   - Understands the Problem (10 pts): Deep understanding of the problem space?
   - Solution Fit (10 pts): Is the solution appropriate and well-suited?

2. **FEASIBILITY (35 points total)**:
   - Team Capability (10 pts): Skills, experience, and track record?
   - Technical Approach (10 pts): Sound and realistic technical solution?
   - Resource Planning (10 pts): Realistic timeline, budget, and resources?
   - Risk Management (5 pts): Risks identified with mitigation strategies?

3. **AUDITABILITY (35 points total)**:
   - Success Metrics (10 pts): Clear, measurable success criteria?
   - Progress Tracking (10 pts): Plan for regular progress reporting?
   - Milestone Definition (10 pts): Specific, measurable, time-bound milestones?
   - Accountability Framework (5 pts): How will the team be held accountable?

Please analyze this proposal and return a JSON response with the following structure:
```json
{
  "alignment_score": <score out of 30>,
  "feasibility_score": <score out of 35>,
  "auditability_score": <score out of 35>,
  "recommendation": "Fund" or "Don't Fund",
  "strengths": ["3-5 specific strengths based on the proposal content"],
  "improvements": ["3-5 specific areas for improvement"],
  "pros": ["Top 3 advantages of this proposal"],
  "cons": ["Top 3 concerns or disadvantages"],
  "summary": "A detailed 2-3 sentence summary of the proposal's approach and merits",
  "one_sentence_summary": "A concise one-sentence assessment of the proposal's overall quality and recommendation"
}
```

Base your analysis on the actual content provided and your expertise in Project Catalyst evaluation. Be specific and reference actual elements from the proposal content.
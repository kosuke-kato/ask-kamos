# Kamos MCP Tools Documentation

This document describes the available tools in the Kamos MCP (Model Context Protocol) server.
These tools can be invoked by sending a POST request to the `processMcpRequest` endpoint with the correct `tool` parameter in the data body.

## Base Request Format

```json
{
  "data": {
    "tool": "TOOL_NAME",
    "params": {
      // ... tool specific parameters ...
    }
    // OR parameters can be at the root of "data" if "params" is omitted
  }
}
```

## Available Tools

### Analysis Tools

| Tool Name | Description | Key Parameters |
| :--- | :--- | :--- |
| `analyze_relationship` | Analyzes relationships between matrix items. | `mainTopic`, `selectedCellData` (Array), `personaId` |
| `analyze_commonality` | Finds commonalities across matrix items. | `mainTopic`, `selectedCellData` (Array), `personaId` |
| `analyze_leverage_point` | Identifies leverage points in the system. | `mainTopic`, `selectedCellData` (Array), `personaId` |
| `analyze_causal_loop` | Generates a Causal Loop Diagram (Mermaid). | `mainTopic`, `selectedCellData` (Array), `personaId` |
| `generate_divergent_ideas` | Generates divergent ideas based on the matrix. | `mainTopic`, `matrixContent`, `personaId` |

### Image/Visual Generation Tools

| Tool Name | Description | Key Parameters |
| :--- | :--- | :--- |
| `generate_graphic_recording` | Generates a graphic recording image. | `mainTopic`, `matrixContent`, `toneId`, `customTone`, `base64Image` |
| `generate_kamishibai` | Generates a Kamishibai (Paper Theater) story and image. | `mainTopic`, `matrixContent`, `toneId` |
| `generate_prototype` | Generates a visual prototype or 3D script. | `mainTopic`, `matrixContent`, `prototypeType`, `designScope`, `targetCategory` |
| `generate_poster` | Generates a poster image. | `mainTopic`, `matrixContent`, `artDirection`, `orientation` |
| `generate_mood_board` | Generates a mood board image. | `mainTopic`, `matrixContent`, `boardStyle`, `base64Images` (Array) |
| `generate_framework_diagram` | Generates a conceptual framework diagram. | `mainTopic`, `matrixContent`, `frameworkType` |
| `generate_simple_image` | Generates a simple image from a prompt. | `prompt`, `base64Image` (for reference) |
| `generate_blueprint` | Generates a technical blueprint or diagram. | `mainTopic`, `matrixContent`, `blueprintType`, `specificationLevel` |
| `generate_zine` | Generates a Zine (mini-magazine) concept layout. | `mainTopic`, `matrixContent`, `zineTheme` |

### Special Agentic Tools

| Tool Name | Description | Key Parameters |
| :--- | :--- | :--- |
| `summary_report` | Generates a summary of the analysis report. | `mainTopic`, `reportJson` (Stringified) |
| `solution_planning` | Generates a concrete solution plan. | `mainTopic`, `reportJson` |
| `future_scenarios` | Generates future scenarios based on analysis. | `mainTopic`, `reportJson` |
| `timeline_design` | Designs a timeline for implementation. | `mainTopic`, `reportJson`, `targetPeriod` |
| `required_resources` | Lists required resources for the plan. | `mainTopic`, `reportJson` |
| `generate_pitch_deck_page` | Generates a specific page for a pitch deck. | `pageNumber` (1-10), `mainTopic`, `matrixContent` |
| `generate_meeting_dialogue` | Simulates a meeting dialogue. | `mainTopic`, `matrixContent`, `meetingType` (default, stakeholders, persona, research) |
| `generate_meeting_minutes` | Generates minutes from a meeting dialogue. | `mainTopic`, `meetingDialogue` |
| `generate_persona_profiles` | Generates detailed persona profiles. | `mainTopic`, `matrixContent`, `personaBriefs` (Array) |
| `generate_persona_test` | Simulates a persona validation test. | `mainTopic`, `matrixContent`, `targetPersonaName` |
| `generate_lecture` | Creates a lecture script or educational content. | `mainTopic`, `matrixContent`, `lectureType` |
| `generate_interview` | Simulates an interview with a specific persona. | `mainTopic`, `matrixContent`, `targetPersonaName` |
| `generate_critics_analysis` | Simulates a critical review from an expert persona. | `mainTopic`, `matrixContent`, `criticPersonaName` |
| `generate_budget_plan` | Generates a budget plan. | `mainTopic`, `matrixContent`, `budgetScale` |
| `generate_task_definitions` | Defines actionable tasks. | `mainTopic`, `matrixContent` |
| `generate_portfolio_plan` | Generates a portfolio strategy. | `mainTopic`, `matrixContent` |
| `generate_sdgs_evaluation` | Evaluates SDGs alignment. | `mainTopic`, `matrixContent` |
| `generate_bcorp_evaluation` | Evaluates B Corp alignment. | `mainTopic`, `matrixContent` |
| `generate_social_implementation` | Generates social implementation strategy. | `mainTopic`, `matrixContent` |
| `generate_writing` | Generates creative writing/text. | `mainTopic`, `matrixContent`, `writingType` |

### Chat & Report Tools

| Tool Name | Description | Key Parameters |
| :--- | :--- | :--- |
| `generate_report_bulk` | Generates the full matrix report (heavy). | `mainTopic`, `frameworkData` |
| `generate_report_cell` | Generates content for a single matrix cell. | `prompt`, `rowTitle`, `colTitle`, `mainTopic` |
| `summarize_json` | Summarizes arbitrary JSON content. | `jsonContent`, `focus` |
| `answer_framework_question` | Answers a specific question using the framework. | `question`, `frameworkData` |
| `handle_kamos_interaction` | Chat interaction with Kamos persona. | `message`, `history`, `personaId` |
| `wrap_up_analysis` | Synthesizes all findings into a final report. | `mainTopic`, `reportJson` |
| `generate_executive_summary` | Generates a concise executive summary. | `mainTopic`, `reportJson` |
| `summarize_pdf` | Summarizes an uploaded PDF. | `pdfContent` (base64) or `pdfUrl` |
| `summarize_audio` | Summarizes uploaded audio. | `audioContent` (base64) |
| `summarize_image` | Summarizes uploaded image. | `imageContent` (base64) |
| `generate_incidents` | Generates simulated incidents/events. | `mainTopic`, `matrixContent` |
| `handle_dialogue_message` | Handles interactive dialogue message. | `message`, `history` |
| `regenerate_analysis_with_notes` | Regenerates analysis incorporating user notes. | `mainTopic`, `originalContent`, `userNotes` |
| `summarize_chat_notes` | Summarizes chat notes. | `chatNotes` |
| `generate_custom_framework_summary` | Generates summary for custom framework. | `frameworkDefinition` |
| `generate_custom_framework_questions` | Generates questions for custom framework. | `frameworkDefinition` |

## Typical Workflow (Two-Step Process)

A common pattern for using Kamos MCP is to first generate an analysis (Phase 1) and then use the output to generate specific artifacts (Phase 2). This stateless approach allows for robust and flexible client-side orchestration.

**Phase 1: Analyze**
Call `processMcpRequest` without a tool specified (or use `generate_report_bulk`).
- **Input**: `{ "prompt": "Analysis Topic..." }`
- **Output**: Full JSON Report Object

**Phase 2: Generate/Apply**
Extract the `matrixContent` (or specific text) from the Phase 1 JSON output and pass it to a specialized tool.
- **Tool**: `generate_graphic_recording`
- **Params**:
  ```json
  {
    "mainTopic": "Analysis Topic...",
    "matrixContent": "Extracted text content from Phase 1 report...",
    "toneId": "warm_illustration"
  }
  ```
- **Output**: Artifact URL or Base64 content

## Legacy Mode (Default)

If no `tool` is specified, the endpoint defaults to the **Ask Kamos Report Generation** workflow:
1. Suggests Matrix Dimensions
2. Generates Questions
3. Generates Bulk Report
4. Returns consolidated JSON

**Parameters:** `prompt`, `rows` (opt), `cols` (opt), `imageContent` (opt).

## Web Client Integration

To invoke MCP tools securely from a client-side application (like the Ask Kamos web app), use the `/tool` proxy endpoint provided by the Cloud Functions.

### 1. Proxy Endpoint
`POST /tool`

**Request Body:**
```json
{
  "tool": "generate_graphic_recording",
  "params": {
    "mainTopic": "Your Topic",
    "matrixContent": "Your analysis content...",
    "toneId": "warm_illustration"
  }
}
```

### 2. Handling Responses
The API response may differ slightly depending on the tool and the underlying model provider. Common patterns to handle in client code:

**Result Wrapping:**
The actual tool output may be wrapped in a `result` property.
```javascript
let content = response.data;
if (content.result) {
    content = content.result;
}
```

**Nested Image Data:**
Image generation tools often return nested objects.
```javascript
// Example structure: { image: { data: "base64..." } }
if (content.image && content.image.data) {
    src = content.image.data; // Use this as Base64 source
} else if (content.image) {
    src = content.image; // Direct URL or Base64
}
```

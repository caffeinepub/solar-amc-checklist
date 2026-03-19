# Solar AMC Checklist

## Current State
Each checklist item has three status buttons: Pass, Fail, N/A. The report view and success screen show Pass/Fail/N/A counts and badges per item.

## Requested Changes (Diff)

### Add
- Simple checkbox UI for each checklist item (checked = done, unchecked = not done)

### Modify
- ChecklistForm: Replace Pass/Fail/N/A buttons with a single checkbox per item. Checking = Pass, unchecking = Unchecked.
- Progress bar: Count checked items (Pass) as completed. Remove the Pass/Fail/N/A breakdown mini-stats from progress strip; just show checked vs total.
- ReportSuccess: Replace Pass/Fail/N/A badges and icons with a simple checkmark or dash per item. Show "X Completed" count instead of Pass/Fail/N/A counts.
- ReportDetail: Same simplification - show checkmark/dash per item, show completed count.

### Remove
- Fail and N/A status options from the UI entirely. Backend keeps the type but UI only uses Pass/Unchecked.

## Implementation Plan
1. Update ChecklistForm ChecklistRow component: replace the three StatusButton components with a single checkbox. Checking sets status to Pass, unchecking sets to Unchecked.
2. Update the progress strip to remove Fail/N/A breakdown, just show checked count.
3. Update ReportSuccess: replace 3-column Pass/Fail/NA stats with single "Completed" count, replace status badges/icons with simple check/dash.
4. Update ReportDetail: same simplifications as ReportSuccess.
5. Validate and build.

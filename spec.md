# Solar AMC Checklist

## Current State
Reports stored in heap Map, wiped on every canister upgrade/redeploy.

## Requested Changes (Diff)

### Add
- stable var reportsEntries to persist data across upgrades
- preupgrade/postupgrade system hooks

### Modify
- Backend to restore map from stable entries on startup

### Remove
- Nothing

## Implementation Plan
1. Add stable var reportsEntries
2. preupgrade: save map to stable array
3. postupgrade: restore map from stable array

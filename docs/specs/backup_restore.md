# Feature: Vault Backup & Restore

## Goal
Allow users to securely export and restore their data using encrypted backups.

## User Flow
1. User taps "Backup Now"
2. System fetches all data
3. System encrypts data
4. System saves file locally
5. User can later restore from file

## Inputs
- All ideas and links data
- User-provided passphrase (future)

## Outputs
- Encrypted backup file

## Data Model Usage
Tables:
- `ideas`
- `links`

Models:
- VaultManifest

## Rules
- All data must be serialized before encryption
- Backup must include ALL relational data (ideas + links)
- System must NOT store passphrase in code (currently violated)
- Restore must fully replace existing database state

## State Transitions
- No state transition in this feature

## Edge Cases
- Empty database backup
- File overwrite conflicts
- Large data memory issues

## Gaps / TODOs
- Passphrase is hardcoded (security issue)
- Restore is not implemented
- Links are not included in backup
- Large datasets may crash due to memory limits

## Future Direction
- Add user passphrase input
- Implement restore flow
- Use streaming/chunking for large backups
- Integrate file picker for import/export
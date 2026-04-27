# Security Specification - The Learning Lab

## 1. Data Invariants
- A **User** document must be owned by the authenticated user (`uid` matches `request.auth.uid`).
- A **StudySession** must be stored under the user's sessions subcollection and must belong to that user.
- **ShopItems** are read-only for users; only admins (not yet implemented in UI) can write.
- **Leaderboard** entries must be read-only for others; only the owner can update their own entry.
- **Rooms** must be readable by any authenticated user, but only the creator can update room metadata (like name).
- **RoomMembers** presence should only be manageable by the user themselves in their own sub-resource.

## 2. The "Dirty Dozen" Payloads
1. **Identity Theft:** Attempt to create a user profile with a `uid` that doesn't match `auth.uid`.
2. **Point Injection:** Attempt to update your own user profile with `points: 999999` without a valid session context.
3. **Shadow Room:** Create a room where `creatorId` is someone else's UID.
4. **Member Hijack:** Attempt to update or delete another user's presence in a study room.
5. **Leaderboard Spoof:** Attempt to update someone else's total study time on the leaderboard.
6. **Ghost Session:** Create a study session where `userId` doesn't match `auth.uid`.
7. **Shop Price Hack:** Attempt to delete or modify a shop item's price.
8. **Invalid ID Poisoning:** Create a room with a 1MB string as the document ID.
9. **State Locking Bypass:** Update a completed study session’s duration after it has been stored (immutability).
10. **Admin Claim Spoof:** Attempt to perform an action restricted to admins using a fake token claim.
11. **Negative Points:** Set `points` or `totalStudyTime` to a negative value.
12. **Shadow Field Injection:** Add `isAdmin: true` to a user profile update.

## 3. Conflict Report

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|------------------|-------------------|-------------------|
| /users | Blocked via `isOwner` | Managed via `affectedKeys` | Managed via `isValidId` and type checks |
| /users/sessions | Blocked via `isOwner` | Create-only | Managed via `isValidId` |
| /shopItems | Read-only | N/A | Total Deny on write |
| /leaderboard | Blocked via `isOwner` | N/A | Managed via `isValidId` |
| /rooms | Blocked via `creatorId` | N/A | Managed via `isValidId` |
| /rooms/members | Blocked via `isOwner` | N/A | Managed via `isValidId` |

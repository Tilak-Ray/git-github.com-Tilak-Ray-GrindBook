# Security Specification for GrindBook

## Data Invariants
1. A user can only manage their own tasks.
2. Users can only edit their own profile.
3. Posts are public for reading, but only the author can delete/edit.
4. Likes and comments are relational; you must be signed in to contribute.
5. All IDs must be validated to prevent injection/resource poisoning.

## The Dirty Dozen Payloads (Rejection Tests)
1. Unauthorized profile update (changing another user's `mindset`).
2. Self-Admin escalation (trying to inject an `isAdmin` field if it existed).
3. Shadow Field Injection (adding `systemInternal: true` to a task).
4. Task hijacking (creating a task for a different `userId`).
5. ID Poisoning (doc ID = 2MB string).
6. Future-dating `createdAt` (submitting a client-side timestamp instead of `request.time`).
7. Unverified email write (if `email_verified` is required).
8. Post spoofing (changing `authorId` to someone else after creation).
9. Bypassing size limits (submitting a 1MB bio).
10. Rapid-fire comment spam (preventing excessive writes if possible).
11. Reading private user data without ownership.
12. Orphaned comment (creating a comment on a non-existent post).

## Test Runner (Planned)
- Using `@firebase/rules-unit-testing` or manual verification.

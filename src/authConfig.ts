// This identifies the sole administrator account. Database RLS policies enforce the same identity.
// A user ID is not a secret; never put privileged Supabase keys in frontend code.
export const ADMIN_USER_ID = '113d98d0-06d1-4ca5-978d-7d4563a54632'

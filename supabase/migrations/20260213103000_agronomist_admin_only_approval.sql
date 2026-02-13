-- Ensure only admin can mark agronomist as approved/rejected.
-- Applicants can edit profile details, but status must remain pending.

DROP POLICY IF EXISTS "Users can update own agronomist profile" ON agronomists;
CREATE POLICY "Users can update own agronomist profile"
  ON agronomists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND verification_status = 'pending'
  );


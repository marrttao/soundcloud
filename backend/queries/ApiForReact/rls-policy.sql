-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (optional, to reset)
-- DROP POLICY IF EXISTS "allow_authenticated_insert_own_profile" ON profiles;
-- DROP POLICY IF EXISTS "allow_authenticated_update_own_profile" ON profiles;
-- DROP POLICY IF EXISTS "allow_public_read_profiles" ON profiles;

-- Policy: Allow authenticated users to INSERT their own profile
CREATE POLICY "allow_authenticated_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to UPDATE their own profile
CREATE POLICY "allow_authenticated_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow anyone to READ profiles (public profiles)
CREATE POLICY "allow_public_read_profiles" ON profiles
  FOR SELECT
  USING (true);

-- Enable RLS and policies for playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read_playlists" ON playlists
  FOR SELECT
  USING (auth.uid() = user_id OR is_private IS NOT TRUE);

CREATE POLICY "allow_owner_insert_playlists" ON playlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_owner_update_playlists" ON playlists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_owner_delete_playlists" ON playlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS and policies for playlist_tracks
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_visible_select_playlist_tracks" ON playlist_tracks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM playlists p
      WHERE p.id = playlist_tracks.playlist_id
        AND (p.user_id = auth.uid() OR p.is_private IS NOT TRUE)
    )
  );

CREATE POLICY "allow_owner_insert_playlist_tracks" ON playlist_tracks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM playlists p
      WHERE p.id = playlist_tracks.playlist_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "allow_owner_update_playlist_tracks" ON playlist_tracks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM playlists p
      WHERE p.id = playlist_tracks.playlist_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM playlists p
      WHERE p.id = playlist_tracks.playlist_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "allow_owner_delete_playlist_tracks" ON playlist_tracks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM playlists p
      WHERE p.id = playlist_tracks.playlist_id
        AND p.user_id = auth.uid()
    )
  );

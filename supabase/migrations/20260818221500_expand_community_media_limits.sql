-- Large community media is uploaded directly to Storage. The application
-- validates the same limits before issuing a signed, user-scoped upload URL.

update storage.buckets
set file_size_limit = 15728640,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'community-profile-media';

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/ogg'
    ]
where id = 'community-pulse-media';

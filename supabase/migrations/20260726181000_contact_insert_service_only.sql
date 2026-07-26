-- Contact form inserts go through the service-role Server Action only.
-- Drop the broad anonymous insert policy so direct REST inserts cannot bypass validation.
drop policy if exists "Anyone can submit contact message" on public.contact_messages;

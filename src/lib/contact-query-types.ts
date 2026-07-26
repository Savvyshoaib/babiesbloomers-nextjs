export type ContactQueryStatus = "new" | "read" | "replied";

export type ContactQuery = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  status?: ContactQueryStatus | null;
  reply_subject?: string | null;
  reply_body?: string | null;
  replied_at?: string | null;
  created_at: string;
};

/** Falls back to the legacy `is_read` flag for rows created before statuses. */
export function contactStatusOf(query: {
  status?: ContactQueryStatus | null;
  is_read: boolean;
}): ContactQueryStatus {
  return query.status ?? (query.is_read ? "read" : "new");
}

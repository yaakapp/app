ALTER TABLE http_requests ADD COLUMN updated_by TEXT NOT NULL DEFAULT '';
ALTER TABLE http_responses ADD COLUMN updated_by TEXT NOT NULL DEFAULT '';
ALTER TABLE workspaces ADD COLUMN updated_by TEXT NOT NULL DEFAULT '';
ALTER TABLE key_values ADD COLUMN updated_by TEXT NOT NULL DEFAULT '';

ALTER TABLE http_requests ADD COLUMN authentication TEXT NOT NULL DEFAULT '{}';
ALTER TABLE http_requests ADD COLUMN authentication_type TEXT;

ALTER TABLE http_responses ADD COLUMN model TEXT DEFAULT 'http_response';
ALTER TABLE http_requests ADD COLUMN model TEXT DEFAULT 'http_request';
ALTER TABLE workspaces ADD COLUMN model TEXT DEFAULT 'workspace';

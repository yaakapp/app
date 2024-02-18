ALTER TABLE grpc_requests ADD COLUMN authentication TEXT NOT NULL DEFAULT '{}';
ALTER TABLE grpc_requests ADD COLUMN authentication_type TEXT;

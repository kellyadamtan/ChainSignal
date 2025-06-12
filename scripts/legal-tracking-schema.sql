-- Legal document version tracking and user acceptances
CREATE TABLE IF NOT EXISTS legal_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(10) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'privacy', 'terms', 'cookies'
    effective_date DATE NOT NULL,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 of content
    changelog TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User acceptances of legal documents
CREATE TABLE IF NOT EXISTS legal_acceptances (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255), -- Email or user ID
    version_id INTEGER REFERENCES legal_versions(id),
    document_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, version_id)
);

-- Audit log for legal document changes
CREATE TABLE IF NOT EXISTS legal_audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'accepted', 'viewed'
    document_type VARCHAR(50) NOT NULL,
    version VARCHAR(10),
    user_id VARCHAR(255),
    ip_address INET,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user_id ON legal_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_document_type ON legal_acceptances(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_audit_log_timestamp ON legal_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_legal_audit_log_user_id ON legal_audit_log(user_id);

-- Insert initial legal versions
INSERT INTO legal_versions (version, document_type, effective_date, content_hash, changelog) VALUES
('v1.0', 'privacy', '2024-01-15', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 'Initial Privacy Policy launch'),
('v1.0', 'terms', '2024-01-15', 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1', 'Initial Terms of Service launch'),
('v1.0', 'cookies', '2024-01-15', 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2', 'Initial Cookie Policy launch'),
('v1.1', 'privacy', '2024-12-15', 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3', 'WalletDNA™ enhanced features update'),
('v1.1', 'terms', '2024-12-15', 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4', 'WalletDNA™ enhanced features update')
ON CONFLICT DO NOTHING;

-- Log the schema creation
INSERT INTO legal_audit_log (action, document_type, version, details) VALUES
('created', 'system', 'v1.0', '{"message": "Legal tracking system initialized", "tables": ["legal_versions", "legal_acceptances", "legal_audit_log"]}');

COMMIT;

-- Display current legal versions
SELECT 
    document_type,
    version,
    effective_date,
    changelog
FROM legal_versions 
ORDER BY document_type, effective_date DESC;

-- Change support_quality_score from INTEGER to NUMERIC(3,1) to support decimal scores (e.g. 4.7)
ALTER TABLE vpn_providers 
ALTER COLUMN support_quality_score TYPE NUMERIC(3, 1);

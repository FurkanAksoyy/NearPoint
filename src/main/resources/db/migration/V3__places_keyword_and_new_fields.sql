-- Places API (New) extras + keyword/category so the cache is correct per search term.
ALTER TABLE places ADD COLUMN open_now BOOLEAN;
ALTER TABLE places ADD COLUMN price_level VARCHAR(255);
ALTER TABLE places ADD COLUMN search_query VARCHAR(255) DEFAULT '';
ALTER TABLE places ADD COLUMN search_category VARCHAR(255) DEFAULT '';

-- Normalise pre-existing rows so equality-based cache lookups work
UPDATE places SET search_query = '' WHERE search_query IS NULL;
UPDATE places SET search_category = '' WHERE search_category IS NULL;

-- Extend the cache lookup index with the search term
DROP INDEX IF EXISTS idx_places_search;
CREATE INDEX idx_places_search
    ON places (search_latitude, search_longitude, search_radius, search_query, search_category);

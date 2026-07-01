-- Speeds up the exact-parameter cache lookup in
-- PlaceRepository.findBySearchParameters(searchLatitude, searchLongitude, searchRadius).
-- (Advanced radial search would use PostGIS geography + GiST, out of scope here.)
CREATE INDEX IF NOT EXISTS idx_places_search
    ON places (search_latitude, search_longitude, search_radius);

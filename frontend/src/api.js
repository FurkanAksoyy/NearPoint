import axios from 'axios';

// Single source of truth for the API origin (was redeclared across ~13 files).
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

// Preconfigured axios instance. The default axios export still works for callers
// that set an Authorization header globally (Auth context), so both coexist.
export const api = axios.create({ baseURL: API_BASE_URL });

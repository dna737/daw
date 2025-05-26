// storage:
export const IS_LOGGED_IN_KEY = 'isLoggedIn';
export const MATCH_PAGE_VISITED_KEY = 'hasVisitedMatchPage';
export const DEFAULT_STORAGE_TTL_MS = 1000 * 60 * 60; // 1 hour

// page and size limits:
export const MAX_PAGE_SIZE = 100;
export const MAX_CUSTOM_ZIP_SIZE = 1000;
export const DEFAULT_ZIP_PAGE_SIZE = 25;
export const MAX_ZIP_BATCH_SIZE = 10000;

// geographical limits:
export const MIN_LATITUDE = -90;
export const MAX_LATITUDE = 90;
export const MIN_LONGITUDE = -180;
export const MAX_LONGITUDE = 180;

// pagination:
export const PAGINATION_THRESHOLD = 6;
export const PAGINATION_LEADING_OFFSET_THRESHOLD = 3;

// ui:
export const REDIRECT_COUNTDOWN_SECONDS = 3;
export const COUNTDOWN_INTERVAL_MS = 1000;

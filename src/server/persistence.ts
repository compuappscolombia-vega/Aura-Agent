import fs from 'fs';
import path from 'path';

export interface PersistedState {
  version: string;
  lastSavedAt: string;
  users?: Record<string, any>;
  models: Record<string, any>;
  memories: Record<string, any>;
  leads: any[];
  voiceClips: any[];
  mediaItems: any[];
  twitterCredentials?: any;
  session?: any;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'persisted_state.json');

// Ensure data directory exists
function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Persistence] Error creating data directory:', err);
  }
}

/**
 * Loads the persisted state from disk. Returns null if no state file exists or if corrupt.
 */
export function loadPersistedState(): PersistedState | null {
  ensureDataDir();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        console.info(`[Persistence] Loaded state from ${STATE_FILE} (${Object.keys(parsed.models || {}).length} models)`);
        return parsed;
      }
    }
  } catch (err) {
    console.error('[Persistence] Error reading state file, using in-memory defaults:', err);
  }
  return null;
}

/**
 * Saves state to disk atomically.
 */
export function savePersistedState(state: Partial<PersistedState>): boolean {
  ensureDataDir();
  try {
    const currentState = loadPersistedState() || {
      version: '2.6.2',
      lastSavedAt: new Date().toISOString(),
      users: {},
      models: {},
      memories: {},
      leads: [],
      voiceClips: [],
      mediaItems: [],
    };

    const merged: PersistedState = {
      version: '2.6.2',
      lastSavedAt: new Date().toISOString(),
      users: { ...(currentState.users || {}), ...(state.users || {}) },
      models: { ...currentState.models, ...(state.models || {}) },
      memories: { ...currentState.memories, ...(state.memories || {}) },
      leads: state.leads || currentState.leads || [],
      voiceClips: state.voiceClips || currentState.voiceClips || [],
      mediaItems: state.mediaItems || currentState.mediaItems || [],
      twitterCredentials: state.twitterCredentials || currentState.twitterCredentials,
      session: state.session !== undefined ? state.session : currentState.session,
    };

    const tempFile = `${STATE_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(merged, null, 2), 'utf-8');
    fs.renameSync(tempFile, STATE_FILE);
    return true;
  } catch (err) {
    console.error('[Persistence] Error writing persisted state:', err);
    return false;
  }
}

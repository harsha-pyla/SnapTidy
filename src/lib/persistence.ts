import { get, set, del } from 'idb-keyval';
import type { LazyScreenshotItem } from './fileSystem';

export interface SavedSessionState {
  folderName: string;
  currentIndex: number;
  keepCount: number;
  deleteCount: number;
  deletedNames: string[];
  maybeNames: string[];
  lastUpdated: number;
}

const HANDLE_KEY = 'snaptidy_folder_handle';
const STATE_KEY = 'snaptidy_session_state';

/**
 * Saves directory handle & progress state into IndexedDB via idb-keyval.
 */
export async function saveSession(
  folderHandle: FileSystemDirectoryHandle,
  state: {
    currentIndex: number;
    keepCount: number;
    deleteCount: number;
    deletedList: LazyScreenshotItem[];
    maybePile: { item: LazyScreenshotItem; originalIndex: number }[];
  }
): Promise<void> {
  try {
    await set(HANDLE_KEY, folderHandle);
    const sessionData: SavedSessionState = {
      folderName: folderHandle.name,
      currentIndex: state.currentIndex,
      keepCount: state.keepCount,
      deleteCount: state.deleteCount,
      deletedNames: state.deletedList.map((d) => d.name),
      maybeNames: state.maybePile.map((m) => m.item.name),
      lastUpdated: Date.now(),
    };
    await set(STATE_KEY, sessionData);
    console.log('[persistence] Session saved to IndexedDB:', sessionData.folderName, `Index: ${sessionData.currentIndex}`);
  } catch (err) {
    console.error('[persistence] Failed to save session state:', err);
  }
}

/**
 * Retrieves saved folderHandle & session state from IndexedDB.
 */
export async function getSavedSession(): Promise<{
  folderHandle: FileSystemDirectoryHandle;
  state: SavedSessionState;
} | null> {
  try {
    const handle = await get<FileSystemDirectoryHandle>(HANDLE_KEY);
    const state = await get<SavedSessionState>(STATE_KEY);

    if (handle && state) {
      console.log('[persistence] Retrieved saved session from IndexedDB:', state.folderName, state);
      return { folderHandle: handle, state };
    }
    return null;
  } catch (err) {
    console.error('[persistence] Failed to get saved session:', err);
    return null;
  }
}

/**
 * Clears saved session from IndexedDB.
 */
export async function clearSavedSession(): Promise<void> {
  try {
    await del(HANDLE_KEY);
    await del(STATE_KEY);
    console.log('[persistence] Session cleared from IndexedDB.');
  } catch (err) {
    console.error('[persistence] Failed to clear session:', err);
  }
}

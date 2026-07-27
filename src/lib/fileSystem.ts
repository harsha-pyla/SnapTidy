/**
 * File System Access API & Memory-Optimized Lazy Thumbnail Loader for SnapTidy
 */

export interface ReadFileResult {
  fileHandle: FileSystemFileHandle;
  file: File;
  objectUrl: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface ScanOptions {
  extensions: string[];
  includeSubfolders: boolean;
  onlyScreenshotsByName: boolean;
}

export interface LazyScreenshotItem {
  id: string;
  fileHandle: FileSystemFileHandle;
  name: string;
  size: number;
  lastModified: number;
  objectUrl: string | null;
  isLoading: boolean;
}

export const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  extensions: ['.png', '.jpg', '.jpeg', '.webp'],
  includeSubfolders: false,
  onlyScreenshotsByName: false,
};

/**
 * 1. Prompts user to pick a folder using native File System Access API.
 */
export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    console.warn('[fileSystem] showDirectoryPicker is not supported in this browser.');
    return null;
  }

  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    console.log('[fileSystem] pickFolder() success -> Folder:', handle.name, handle);
    return handle;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('[fileSystem] pickFolder() -> User cancelled.');
    } else {
      console.error('[fileSystem] pickFolder() error:', err);
    }
    return null;
  }
}

/**
 * 2. Scans directory handle recursively or flatly and filters image file handles.
 */
export async function listImages(
  folderHandle: FileSystemDirectoryHandle,
  options: ScanOptions = DEFAULT_SCAN_OPTIONS
): Promise<FileSystemFileHandle[]> {
  console.log('[fileSystem] listImages() -> Scanning folder:', folderHandle.name, options);
  const imageHandles: FileSystemFileHandle[] = [];
  const screenshotKeywords = ['screenshot', 'screen shot', 'capture', 'cleanshot', 'scrn', 'snip'];

  async function scanDirectory(dir: FileSystemDirectoryHandle) {
    try {
      for await (const entry of (dir as any).values()) {
        if (entry.kind === 'file') {
          const fileHandle = entry as FileSystemFileHandle;
          const nameLower = fileHandle.name.toLowerCase();

          // Extension filter
          const matchesExt = options.extensions.some(ext => nameLower.endsWith(ext.toLowerCase()));
          if (!matchesExt) continue;

          // Keyword filter
          if (options.onlyScreenshotsByName) {
            const matchesKw = screenshotKeywords.some(kw => nameLower.includes(kw));
            if (!matchesKw) continue;
          }

          imageHandles.push(fileHandle);
        } else if (entry.kind === 'directory' && options.includeSubfolders) {
          await scanDirectory(entry as FileSystemDirectoryHandle);
        }
      }
    } catch (err) {
      console.error(`[fileSystem] Error scanning subdirectory:`, err);
    }
  }

  try {
    await scanDirectory(folderHandle);
    console.log(`[fileSystem] listImages() -> Found ${imageHandles.length} images.`);
    return imageHandles;
  } catch (err) {
    console.error('[fileSystem] listImages() error:', err);
    return [];
  }
}

/**
 * 3. Converts FileSystemFileHandle list into lightweight LazyScreenshotItem wrappers.
 */
export async function createLazyItems(fileHandles: FileSystemFileHandle[]): Promise<LazyScreenshotItem[]> {
  const items: LazyScreenshotItem[] = [];

  for (let i = 0; i < fileHandles.length; i++) {
    const handle = fileHandles[i];
    try {
      const file = await handle.getFile();
      items.push({
        id: `img_${i}_${Date.now()}`,
        fileHandle: handle,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        objectUrl: null,
        isLoading: false,
      });
    } catch (err) {
      console.error(`[fileSystem] Error fetching metadata for ${handle.name}:`, err);
    }
  }

  console.log(`[fileSystem] Created ${items.length} lightweight lazy items.`);
  return items;
}

/**
 * 4. Loads Blob and creates URL.createObjectURL() on demand.
 */
export async function loadThumbnail(item: LazyScreenshotItem): Promise<string | null> {
  if (item.objectUrl) return item.objectUrl;

  try {
    item.isLoading = true;
    const file = await item.fileHandle.getFile();
    const url = URL.createObjectURL(file);
    item.objectUrl = url;
    item.isLoading = false;
    console.log(`[fileSystem] Lazily loaded URL.createObjectURL() for "${item.name}"`);
    return url;
  } catch (err) {
    item.isLoading = false;
    console.error(`[fileSystem] Failed to load thumbnail for "${item.name}":`, err);
    return null;
  }
}

/**
 * 5. Preloads a window ahead for cards.
 */
export async function preloadThumbnailWindow(
  items: LazyScreenshotItem[],
  currentIndex: number,
  windowSize: number = 8
): Promise<void> {
  const startIndex = Math.max(0, currentIndex);
  const endIndex = Math.min(items.length, currentIndex + windowSize);

  const loadPromises: Promise<any>[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    if (items[i] && !items[i].objectUrl && !items[i].isLoading) {
      loadPromises.push(loadThumbnail(items[i]));
    }
  }

  await Promise.all(loadPromises);
}

/**
 * 6. Ensures all items in a list (e.g. Maybe Pile or Confirm Deletion grid) have loaded thumbnails instantly.
 */
export async function ensureThumbnailsForItems(items: LazyScreenshotItem[]): Promise<void> {
  const loadPromises = items.map(item => {
    if (item && !item.objectUrl) {
      return loadThumbnail(item);
    }
    return Promise.resolve(item?.objectUrl || null);
  });
  await Promise.all(loadPromises);
}

/**
 * 6. Real Deletion Execution Function:
 * Loops through files on user confirm and invokes removeEntry() on parent directory handle
 * or fileHandle.remove() to permanently delete files from local disk.
 */
export async function deleteFiles(
  folderHandle: FileSystemDirectoryHandle | null,
  fileItems: LazyScreenshotItem[]
): Promise<{ deletedCount: number; failedCount: number; bytesReclaimed: number }> {
  console.log(`[fileSystem] Executing real deletion for ${fileItems.length} files...`);

  let deletedCount = 0;
  let failedCount = 0;
  let bytesReclaimed = 0;

  for (const item of fileItems) {
    try {
      // 1. Prefer fileHandle.remove() if supported
      if ('remove' in item.fileHandle && typeof (item.fileHandle as any).remove === 'function') {
        await (item.fileHandle as any).remove();
      } else if (folderHandle) {
        // 2. Fall back to folderHandle.removeEntry(name)
        await folderHandle.removeEntry(item.name);
      } else {
        throw new Error('No valid parent folder handle or remove method available');
      }

      // Revoke Blob object URL to clean up memory
      if (item.objectUrl) {
        URL.revokeObjectURL(item.objectUrl);
        item.objectUrl = null;
      }

      deletedCount++;
      bytesReclaimed += item.size;
      console.log(`[fileSystem] Real deletion succeeded: "${item.name}"`);
    } catch (err) {
      console.error(`[fileSystem] Failed to remove "${item.name}":`, err);
      failedCount++;
    }
  }

  console.log(
    `[fileSystem] Real deletion completed: ${deletedCount} deleted, ${failedCount} failed. Reclaimed: ${(
      bytesReclaimed /
      (1024 * 1024)
    ).toFixed(2)} MB`
  );

  return { deletedCount, failedCount, bytesReclaimed };
}

/**
 * 7. Reads a single FileSystemFileHandle directly.
 */
export async function readFile(fileHandle: FileSystemFileHandle): Promise<ReadFileResult | null> {
  try {
    const file = await fileHandle.getFile();
    const objectUrl = URL.createObjectURL(file);

    const result: ReadFileResult = {
      fileHandle,
      file,
      objectUrl,
      name: file.name,
      size: file.size,
      type: file.type || 'image/png',
      lastModified: file.lastModified,
    };

    console.log(`[fileSystem] readFile("${file.name}") success:`, {
      name: result.name,
      sizeFormatted: `${(result.size / (1024 * 1024)).toFixed(2)} MB`,
      type: result.type,
      lastModified: new Date(result.lastModified).toISOString(),
    });

    return result;
  } catch (err) {
    console.error(`[fileSystem] readFile("${fileHandle.name}") error:`, err);
    return null;
  }
}

import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  animate,
} from "framer-motion";
import { 
  FolderOpen, 
  Lock, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  X,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  HelpCircle,
  Trash2,
  CheckCircle2,
  Check,
  History,
  Download,
  Share2,
  Copy,
  Settings,
  Moon,
  Keyboard,
  ShieldCheck,
  HardDrive,
  EyeOff,
  FolderX,
  ShieldAlert,
  FilterX,
  AlertTriangle,
  Heart,
  ExternalLink,
  CreditCard,
  Coffee
} from "lucide-react";
import { 
  pickFolder, 
  listImages, 
  createLazyItems,
  preloadThumbnailWindow,
  loadThumbnail,
  ensureThumbnailsForItems,
  deleteFiles,
  DEFAULT_SCAN_OPTIONS 
} from "./lib/fileSystem";
import type { ScanOptions, LazyScreenshotItem } from "./lib/fileSystem";
import { 
  saveSession, 
  getSavedSession, 
  clearSavedSession,
} from "./lib/persistence";
import type { SavedSessionState } from "./lib/persistence";
import { SwipeCard } from "./components/SwipeCard";

/* ————————————————————————————————————————————
   Lazy Thumbnail Component for Maybe & Confirm screens
   ———————————————————————————————————————————— */
function LazyThumbnail({ item, alt, className = "" }: { item: LazyScreenshotItem; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(item.objectUrl);

  useEffect(() => {
    let active = true;
    if (item.objectUrl) {
      setUrl(item.objectUrl);
    } else {
      loadThumbnail(item).then((loadedUrl) => {
        if (active && loadedUrl) {
          setUrl(loadedUrl);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [item, item.objectUrl]);

  if (!url) {
    return (
      <div className="w-full h-full bg-bg/80 flex items-center justify-center">
        <Loader2 className="h-4 w-4 text-text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
    />
  );
}

/* ————————————————————————————————————————————
   SnapTidy Brand SVG Logo Icon Component
   ———————————————————————————————————————————— */
function LogoIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="13"
        height="13"
        rx="3"
        className="fill-accent/30 stroke-accent"
        strokeWidth="1.5"
      />
      <rect
        x="8"
        y="8"
        width="13"
        height="13"
        rx="3"
        className="fill-surface stroke-accent"
        strokeWidth="1.75"
      />
      <path
        d="M11.5 14.5L13.5 16.5L17.5 11.5"
        className="stroke-accent"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ————————————————————————————————————————————
   GitHub icon (inline SVG)
   ———————————————————————————————————————————— */
function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* ————————————————————————————————————————————
   Animated Count-Up Component (600ms duration)
   ———————————————————————————————————————————— */
function AnimatedFileCount({ targetCount }: { targetCount: number }) {
  const [displayCount, setDisplayCount] = useState<number>(0);

  useEffect(() => {
    const controls = animate(0, targetCount, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayCount(Math.round(latest)),
    });
    return () => controls.stop();
  }, [targetCount]);

  return <span className="font-mono tracking-tight font-bold">{displayCount.toLocaleString()}</span>;
}

/* ————————————————————————————————————————————
   Animated Storage Freed Count-Up Component
   ———————————————————————————————————————————— */
function AnimatedStorageFreed({ bytes }: { bytes: number }) {
  const [displayBytes, setDisplayBytes] = useState<number>(0);

  useEffect(() => {
    const controls = animate(0, bytes, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayBytes(Math.round(latest)),
    });
    return () => controls.stop();
  }, [bytes]);

  return <span className="font-mono tracking-tight font-bold">{formatBytes(displayBytes)}</span>;
}

/* ————————————————————————————————————————————
   Landing Card Pile Mockup Screenshots
   ———————————————————————————————————————————— */

function NodeErrorScreenshot() {
  return (
    <div className="w-full h-full bg-[#0A0B10] p-3 rounded flex flex-col justify-between border border-[#1E1E2A] text-[10px] font-mono leading-tight select-none">
      <div className="flex items-center justify-between border-b border-[#1E1E2A] pb-1.5 mb-1.5 text-[#8B8B99]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F2555A]/80" />
          <span className="w-2 h-2 rounded-full bg-[#E5C07B]/80" />
          <span className="w-2 h-2 rounded-full bg-[#3DD68C]/80" />
          <span className="ml-1 text-[9px] text-[#8B8B99]">bash — zsh — 80x24</span>
        </div>
        <span className="text-[9px] text-[#8B8B99]/60">~/projects/api</span>
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="text-[#F2555A] font-bold">Uncaught TypeError: Cannot read properties of undefined</div>
        <div className="text-[#8B8B99] text-[9px]">
          at processData (<span className="text-[#6E56CF]">src/services/data.ts:42:18</span>)
        </div>
        <div className="text-[#8B8B99] text-[9px]">
          at async Server.handleRequest (<span className="text-[#6E56CF]">src/server.ts:112:5</span>)
        </div>
        <div className="flex items-center gap-1 text-[#3DD68C] pt-1">
          <span>$</span>
          <span className="w-1.5 h-3 bg-[#3DD68C] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function DashboardScreenshot() {
  return (
    <div className="w-full h-full bg-[#0E0F17] p-3 rounded flex flex-col justify-between border border-[#1E1E2A] text-[10px] font-mono select-none">
      <div className="flex items-center justify-between border-b border-[#1E1E2A] pb-1.5 mb-1 text-[#8B8B99]">
        <span className="text-[#F4F4F6] font-semibold">Analytics Overview</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#6E56CF]/20 text-[#6E56CF] border border-[#6E56CF]/30">LIVE</span>
      </div>
      <div className="flex items-baseline gap-2 my-1">
        <span className="text-base font-bold text-[#F4F4F6]">$14,280.00</span>
        <span className="text-[9px] text-[#3DD68C] font-semibold">+18.4%</span>
      </div>
      <div className="flex items-end justify-between gap-1 h-12 pt-1 border-t border-[#1E1E2A]/60">
        {[40, 65, 30, 85, 55, 95, 70, 100, 60, 80].map((h, idx) => (
          <div key={idx} className="flex-1 bg-[#1E1F2E] rounded-t overflow-hidden relative" style={{ height: '100%' }}>
            <div 
              className="absolute bottom-0 w-full rounded-t transition-all duration-500"
              style={{ 
                height: `${h}%`, 
                backgroundColor: idx === 7 ? '#6E56CF' : idx === 5 ? '#3DD68C' : '#2D2E42' 
              }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StandupScreenshot() {
  return (
    <div className="w-full h-full bg-[#0D0E15] p-2.5 rounded flex flex-col justify-between border border-[#1E1E2A] select-none">
      <div className="flex items-center justify-between text-[9px] font-mono text-[#8B8B99] pb-1 border-b border-[#1E1E2A]">
        <span>Daily Engineering Standup</span>
        <span className="text-[#F2555A] font-semibold">● 00:24:12</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 flex-1 my-1.5">
        <div className="bg-[#141522] rounded p-1.5 border border-[#3DD68C]/50 flex flex-col justify-between relative">
          <div className="w-5 h-5 rounded-full bg-[#6E56CF]/40 border border-[#6E56CF] flex items-center justify-center text-[9px] text-white font-bold">
            JD
          </div>
          <span className="text-[8px] font-mono text-[#3DD68C]">Alex (Speaking)</span>
        </div>
        <div className="bg-[#141522] rounded p-1.5 border border-[#232330] flex flex-col justify-between">
          <div className="w-5 h-5 rounded-full bg-[#232330] flex items-center justify-center text-[9px] text-[#8B8B99]">
            SK
          </div>
          <span className="text-[8px] font-mono text-[#8B8B99]">Sarah</span>
        </div>
      </div>
    </div>
  );
}

function FigmaSpecScreenshot() {
  return (
    <div className="w-full h-full bg-[#12131C] p-3 rounded flex flex-col justify-between border border-[#1E1E2A] text-[10px] font-mono select-none">
      <div className="flex items-center justify-between text-[9px] text-[#8B8B99] pb-1 border-b border-[#1E1E2A]">
        <span className="text-[#6E56CF] font-semibold">Figma &middot; Button Component</span>
        <span>Spec v2</span>
      </div>
      <div className="flex-1 flex items-center justify-center my-1 relative border border-dashed border-[#6E56CF]/40 rounded bg-[#6E56CF]/5 p-2">
        <div className="px-4 py-1.5 rounded bg-[#6E56CF] text-white text-[10px] font-semibold shadow">
          Primary Action
        </div>
        <div className="absolute -bottom-2 text-[8px] text-[#6E56CF] bg-[#12131C] px-1 font-mono">
          140px &times; 36px
        </div>
      </div>
    </div>
  );
}

function ReceiptScreenshot() {
  return (
    <div className="w-full h-full bg-[#0F1018] p-3 rounded flex flex-col justify-between border border-[#1E1E2A] text-[10px] font-mono select-none">
      <div className="flex items-center justify-between text-[9px] border-b border-[#1E1E2A] pb-1 text-[#8B8B99]">
        <span>Stripe Invoice</span>
        <span className="text-[#3DD68C] font-semibold">PAID</span>
      </div>
      <div className="space-y-1 my-1">
        <div className="flex justify-between text-[#8B8B99] text-[9px]">
          <span>Server Infrastructure</span>
          <span className="text-[#F4F4F6]">$49.00</span>
        </div>
        <div className="flex justify-between text-[#8B8B99] text-[9px]">
          <span>Domain Renewal</span>
          <span className="text-[#F4F4F6]">$12.00</span>
        </div>
      </div>
      <div className="flex justify-between items-center border-t border-[#1E1E2A] pt-1 font-bold text-[#F4F4F6]">
        <span>Total</span>
        <span className="text-[#3DD68C]">$61.00</span>
      </div>
    </div>
  );
}

interface CardData {
  filename: string;
  size: string;
  color: string;
  renderVisual: () => React.ReactNode;
  scattered: { x: number; y: number; rotate: number };
}

const CARDS: CardData[] = [
  {
    filename: "Capture_error_trace_node.png",
    size: "2.4 MB",
    color: "#14141B",
    renderVisual: NodeErrorScreenshot,
    scattered: { x: -120, y: 35, rotate: -12 },
  },
  {
    filename: "CleanShot_dashboard_export.png",
    size: "1.8 MB",
    color: "#14141B",
    renderVisual: DashboardScreenshot,
    scattered: { x: 90, y: -25, rotate: 8 },
  },
  {
    filename: "Screenshot_2026-01-14_standup.png",
    size: "4.2 MB",
    color: "#14141B",
    renderVisual: StandupScreenshot,
    scattered: { x: -45, y: -55, rotate: -5 },
  },
  {
    filename: "Screen Shot 2025-12-03_figma.png",
    size: "3.1 MB",
    color: "#14141B",
    renderVisual: FigmaSpecScreenshot,
    scattered: { x: 105, y: 60, rotate: 15 },
  },
  {
    filename: "IMG_0847_receipt.png",
    size: "780 KB",
    color: "#14141B",
    renderVisual: ReceiptScreenshot,
    scattered: { x: -25, y: 75, rotate: -9 },
  },
];

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

type FileCategoryFilter = 'all' | 'screenshots' | 'photos';
type AppThemeMode = 'dark' | 'pure-black' | 'light';

interface DecisionHistoryItem {
  item: LazyScreenshotItem;
  decision: 'keep' | 'delete' | 'maybe';
  index: number;
}

interface MaybePileItem {
  item: LazyScreenshotItem;
  originalIndex: number;
}

/* ————————————————————————————————————————————
   Main App Component
   ———————————————————————————————————————————— */
export default function App() {
  const prefersReduced = useReducedMotion();
  const pileRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View state
  const [view, setView] = useState<'landing' | 'setup' | 'review' | 'maybe' | 'confirm' | 'summary' | 'settings' | 'about'>('landing');

  // Theme state: 'dark' (#0B0B0F), 'pure-black' (#000000), 'light' (#F4F4F8)
  const [themeMode, setThemeMode] = useState<AppThemeMode>('dark');

  // Persistence State
  const [savedSession, setSavedSession] = useState<{
    folderHandle: FileSystemDirectoryHandle;
    state: SavedSessionState;
  } | null>(null);

  // File system state
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fileCategory, setFileCategory] = useState<FileCategoryFilter>('all');
  const [minSizeMB, setMinSizeMB] = useState<number>(0);
  const [sliderVal, setSliderVal] = useState<number>(0);
  const [includeSubfolders, setIncludeSubfolders] = useState<boolean>(false);

  const [allRawItems, setAllRawItems] = useState<LazyScreenshotItem[]>([]);
  const [lazyItems, setLazyItems] = useState<LazyScreenshotItem[]>([]);
  const [isRescanningDisk, setIsRescanningDisk] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [history, setHistory] = useState<DecisionHistoryItem[]>([]);
  
  // Empty State / Scanning Error State
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'permission_denied' | 'empty_folder'>('idle');

  // Decision buckets
  const [deletedList, setDeletedList] = useState<LazyScreenshotItem[]>([]);
  const [maybePile, setMaybePile] = useState<MaybePileItem[]>([]);
  const [keepCount, setKeepCount] = useState<number>(0);

  // Confirm Deletion & Summary Interactive States
  const [unmarkingId, setUnmarkingId] = useState<string | null>(null);
  const [isArmingDelete, setIsArmingDelete] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [summaryStats, setSummaryStats] = useState<{ deletedCount: number; bytesReclaimed: number } | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Theme mode switcher with localStorage persistence
  const applyTheme = useCallback((mode: AppThemeMode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('snaptidy_theme', mode);
    } catch {}

    const root = document.documentElement;
    if (mode === 'light') {
      root.style.setProperty('--color-bg', '#F4F4F8');
      root.style.setProperty('--color-surface', '#FFFFFF');
      root.style.setProperty('--color-border', '#E2E2E8');
      root.style.setProperty('--color-text', '#0F0F14');
      root.style.setProperty('--color-text-secondary', '#656575');
    } else if (mode === 'pure-black') {
      root.style.setProperty('--color-bg', '#000000');
      root.style.setProperty('--color-surface', '#0D0D12');
      root.style.setProperty('--color-border', '#1E1E28');
      root.style.setProperty('--color-text', '#F4F4F6');
      root.style.setProperty('--color-text-secondary', '#8B8B99');
    } else {
      root.style.setProperty('--color-bg', '#0B0B0F');
      root.style.setProperty('--color-surface', '#14141B');
      root.style.setProperty('--color-border', '#232330');
      root.style.setProperty('--color-text', '#F4F4F6');
      root.style.setProperty('--color-text-secondary', '#8B8B99');
    }
  }, []);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "showDirectoryPicker" in window);

    const savedTheme = localStorage.getItem('snaptidy_theme') as AppThemeMode | null;
    if (savedTheme && ['dark', 'pure-black', 'light'].includes(savedTheme)) {
      applyTheme(savedTheme);
    }

    async function checkSavedSession() {
      const saved = await getSavedSession();
      if (saved) {
        setSavedSession(saved);
      }
    }
    checkSavedSession();
  }, [applyTheme]);

  // Reset window scroll when returning to landing view so hero card pile resets smoothly
  useEffect(() => {
    if (view === 'landing') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [view]);

  // Preload thumbnails instantly when viewing maybe pile or confirm deletion screen
  useEffect(() => {
    if (view === 'maybe' && maybePile.length > 0) {
      ensureThumbnailsForItems(maybePile.map((m) => m.item)).then(() => {
        setMaybePile((prev) => [...prev]);
      });
    } else if (view === 'confirm' && deletedList.length > 0) {
      ensureThumbnailsForItems(deletedList).then(() => {
        setDeletedList((prev) => [...prev]);
      });
    }
  }, [view, maybePile.length, deletedList.length]);

  // Helper to apply memory filters to raw items instantaneously (1ms)
  const applyMemoryFilters = useCallback((
    sourceItems: LazyScreenshotItem[],
    cat: FileCategoryFilter,
    minMB: number
  ) => {
    const filtered = sourceItems.filter((item) => {
      if (cat === 'photos' && item.name.toLowerCase().includes('screenshot')) return false;
      if (cat === 'screenshots') {
        const nameLower = item.name.toLowerCase();
        const isScreenshot = nameLower.includes('screenshot') || nameLower.includes('cleanshot') || nameLower.includes('capture') || nameLower.includes('screen shot');
        if (!isScreenshot) return false;
      }
      if (minMB > 0) {
        const sizeInMB = item.size / (1024 * 1024);
        if (sizeInMB < minMB) return false;
      }
      return true;
    });
    setLazyItems(filtered);
    setCurrentIndex(0);
  }, []);

  // Re-scan directory from disk
  const rescanFolder = useCallback(async (
    handle: FileSystemDirectoryHandle, 
    cat: FileCategoryFilter, 
    subfolders: boolean,
    minMB: number
  ) => {
    if (allRawItems.length === 0) {
      setScanStatus('scanning');
    } else {
      setIsRescanningDisk(true);
    }
    
    const scanOptions: ScanOptions = {
      extensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      includeSubfolders: subfolders,
      onlyScreenshotsByName: false,
    };

    try {
      const handles = await listImages(handle, scanOptions);
      
      if (handles.length === 0) {
        setScanStatus('empty_folder');
        setAllRawItems([]);
        setLazyItems([]);
        setIsRescanningDisk(false);
        return;
      }

      const items = await createLazyItems(handles);
      setAllRawItems(items);

      applyMemoryFilters(items, cat, minMB);
      setScanStatus('idle');
      setIsRescanningDisk(false);

      setHistory([]);
      setMaybePile([]);
      setDeletedList([]);
      setKeepCount(0);
    } catch (err: any) {
      console.error('[scan] Error scanning directory:', err);
      setScanStatus('permission_denied');
      setIsRescanningDisk(false);
    }
  }, [allRawItems.length, applyMemoryFilters]);

  // Landing "Choose a folder" handler
  const handleChooseFolder = async () => {
    const handle = await pickFolder();
    if (handle) {
      setFolderHandle(handle);
      setAllRawItems([]);
      setFileCategory('all');
      setMinSizeMB(0);
      setSliderVal(0);
      setIncludeSubfolders(false);
      setView('setup');
      await rescanFolder(handle, 'all', false, 0);
    } else {
      setScanStatus('permission_denied');
    }
  };

  // Resume saved session from IndexedDB
  const handleResumeSession = async () => {
    if (!savedSession) return;

    try {
      const handle = savedSession.folderHandle;
      if ('requestPermission' in handle) {
        const perm = await handle.requestPermission({ mode: 'readwrite' });
        if (perm !== 'granted') {
          setScanStatus('permission_denied');
          return;
        }
      }

      setFolderHandle(handle);
      setScanStatus('scanning');

      const handles = await listImages(handle, DEFAULT_SCAN_OPTIONS);
      const items = await createLazyItems(handles);

      setAllRawItems(items);
      setLazyItems(items);
      const restoreIdx = Math.min(savedSession.state.currentIndex, Math.max(0, items.length - 1));
      setCurrentIndex(restoreIdx);
      setKeepCount(savedSession.state.keepCount);

      const restoredDeleted = items.filter((it) => savedSession.state.deletedNames.includes(it.name));
      const restoredMaybe = items
        .filter((it) => savedSession.state.maybeNames.includes(it.name))
        .map((it, idx) => ({ item: it, originalIndex: idx }));

      setDeletedList(restoredDeleted);
      setMaybePile(restoredMaybe);

      await preloadThumbnailWindow(items, restoreIdx, 5);
      setScanStatus('idle');
      setView('review');
    } catch (err) {
      console.error('[persistence] Failed to resume saved session:', err);
      setScanStatus('permission_denied');
    }
  };

  const handleDismissResume = async () => {
    await clearSavedSession();
    setSavedSession(null);
  };

  // Reset filters empty state helper
  const handleResetFilters = () => {
    setFileCategory('all');
    setMinSizeMB(0);
    setSliderVal(0);
    applyMemoryFilters(allRawItems, 'all', 0);
  };

  // Filter change handlers (instantaneous memory filtering)
  const handleFilterCategoryChange = (cat: FileCategoryFilter) => {
    setFileCategory(cat);
    applyMemoryFilters(allRawItems, cat, minSizeMB);
  };

  const handleToggleSubfolders = () => {
    const nextSubfolders = !includeSubfolders;
    setIncludeSubfolders(nextSubfolders);
    if (folderHandle) {
      rescanFolder(folderHandle, fileCategory, nextSubfolders, minSizeMB);
    }
  };

  // Instantaneous 60fps smooth slider handler
  const handleMinSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderVal(val);
    setMinSizeMB(val);
    applyMemoryFilters(allRawItems, fileCategory, val);
  };

  // Start Reviewing CTA
  const handleStartReviewing = async () => {
    if (lazyItems.length === 0) return;
    setView('review');
    await preloadThumbnailWindow(lazyItems, 0, 5);
    setLazyItems([...lazyItems]);
  };

  // Decision Handler
  const handleDecision = async (direction: 'left' | 'right' | 'up') => {
    if (currentIndex >= lazyItems.length) return;

    const decision = direction === 'right' ? 'keep' : direction === 'left' ? 'delete' : 'maybe';
    const currentItem = lazyItems[currentIndex];
    
    setHistory((prev) => [...prev, { item: currentItem, decision, index: currentIndex }]);

    let nextKeep = keepCount;
    let nextDeleted = [...deletedList];
    let nextMaybe = [...maybePile];

    if (decision === 'keep') {
      nextKeep = keepCount + 1;
      setKeepCount(nextKeep);
    } else if (decision === 'delete') {
      if (!nextDeleted.some((d) => d.id === currentItem.id)) {
        nextDeleted = [...nextDeleted, currentItem];
        setDeletedList(nextDeleted);
      }
    } else if (decision === 'maybe') {
      if (!nextMaybe.some((m) => m.item.id === currentItem.id)) {
        nextMaybe = [...nextMaybe, { item: currentItem, originalIndex: currentIndex }];
        setMaybePile(nextMaybe);
      }
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    if (folderHandle) {
      saveSession(folderHandle, {
        currentIndex: nextIndex,
        keepCount: nextKeep,
        deleteCount: nextDeleted.length,
        deletedList: nextDeleted,
        maybePile: nextMaybe,
      });
    }

    if (nextIndex < lazyItems.length) {
      await preloadThumbnailWindow(lazyItems, nextIndex, 5);
      setLazyItems([...lazyItems]);
    }
  };

  // Un-mark single item with visual green flash feedback (#3DD68C)
  const handleUnmarkDeletedItem = (id: string) => {
    setUnmarkingId(id);
    setTimeout(() => {
      setDeletedList((prev) => prev.filter((item) => item.id !== id));
      setKeepCount((prev) => prev + 1);
      setUnmarkingId(null);
    }, 240);
  };

  // Clear entire Maybe Pile
  const handleClearMaybePile = () => {
    setKeepCount((prev) => prev + maybePile.length);
    setMaybePile([]);
  };

  // Render Client-Side HTML5 Canvas Share Card Badge
  useEffect(() => {
    if (view !== 'summary' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // Dark Card Background matching app palette (#0B0B0F)
    ctx.fillStyle = themeMode === 'light' ? '#F4F4F8' : themeMode === 'pure-black' ? '#000000' : '#0B0B0F';
    ctx.fillRect(0, 0, width, height);

    // Hairline outer border (#232330)
    ctx.strokeStyle = themeMode === 'light' ? '#E2E2E8' : '#232330';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Header badge
    ctx.fillStyle = themeMode === 'light' ? '#FFFFFF' : '#14141B';
    ctx.fillRect(80, 75, 170, 36);
    ctx.strokeStyle = themeMode === 'light' ? '#E2E2E8' : '#232330';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 75, 170, 36);

    ctx.fillStyle = themeMode === 'light' ? '#656575' : '#8B8B99';
    ctx.font = '500 15px monospace';
    ctx.fillText('SnapTidy Report', 100, 98);

    // Large Standout Storage Freed Number in Accent Color (#6E56CF)
    const freedStr = formatBytes(summaryStats?.bytesReclaimed || 0);
    ctx.fillStyle = '#6E56CF';
    ctx.font = '800 68px monospace';
    ctx.fillText(`${freedStr} freed`, 80, 205);

    // Small "Cleaned up with SnapTidy" underneath
    ctx.fillStyle = themeMode === 'light' ? '#656575' : '#8B8B99';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('Cleaned up with SnapTidy', 80, 255);

    // 3 Big Mono Numerals Side by Side (Reviewed, Kept, Deleted)
    const totalReviewed = Math.min(currentIndex, lazyItems.length);
    const boxW = 310;
    const boxH = 125;
    const startY = 320;

    const boxes = [
      { label: 'REVIEWED', val: totalReviewed.toLocaleString(), color: themeMode === 'light' ? '#0F0F14' : '#F4F4F6' },
      { label: 'KEPT', val: keepCount.toLocaleString(), color: '#3DD68C' },
      { label: 'DELETED', val: (summaryStats?.deletedCount || 0).toLocaleString(), color: '#F2555A' },
    ];

    boxes.forEach((box, idx) => {
      const startX = 80 + idx * (boxW + 35);
      ctx.fillStyle = themeMode === 'light' ? '#FFFFFF' : '#14141B';
      ctx.fillRect(startX, startY, boxW, boxH);
      ctx.strokeStyle = themeMode === 'light' ? '#E2E2E8' : '#232330';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, startY, boxW, boxH);

      ctx.fillStyle = themeMode === 'light' ? '#656575' : '#8B8B99';
      ctx.font = '500 13px monospace';
      ctx.fillText(box.label, startX + 24, startY + 42);

      ctx.fillStyle = box.color;
      ctx.font = '700 36px monospace';
      ctx.fillText(box.val, startX + 24, startY + 92);
    });

    // Footer signature
    ctx.fillStyle = themeMode === 'light' ? '#656575' : '#8B8B99';
    ctx.font = '400 18px monospace';
    ctx.fillText('100% local — open source — snaptidy', 80, 545);
  }, [view, summaryStats, keepCount, currentIndex, lazyItems.length, folderHandle?.name, themeMode]);

  // Download Canvas Share Card PNG
  const handleDownloadShareCard = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `snaptidy-${folderHandle?.name || 'stats'}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Copy Canvas Image to Clipboard
  const handleCopyShareCard = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      } catch (err) {
        console.error('[share] Copy image failed:', err);
      }
    });
  };

  // Final 2-Step Confirmation Real Deletion Execution
  const handleConfirmDeletion = async () => {
    setIsDeleting(true);
    const result = await deleteFiles(folderHandle, deletedList);

    setSummaryStats({
      deletedCount: result.deletedCount,
      bytesReclaimed: result.bytesReclaimed,
    });
    
    // Clear deleted list state since items are now permanently removed from disk
    setDeletedList([]);

    await clearSavedSession();
    setSavedSession(null);

    setIsDeleting(false);
    setIsArmingDelete(false);
    setView('summary');
  };

  // Re-open item from Maybe Pile in swipe view
  const handleReopenMaybeItem = async (maybeEntry: MaybePileItem) => {
    setMaybePile((prev) => prev.filter((m) => m.item.id !== maybeEntry.item.id));
    setCurrentIndex(maybeEntry.originalIndex);
    await preloadThumbnailWindow(lazyItems, maybeEntry.originalIndex, 5);
    setLazyItems([...lazyItems]);
    setView('review');
  };

  // Undo Handler
  const handleUndo = useCallback(async () => {
    if (history.length === 0) return;

    const lastItem = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    if (lastItem.decision === 'keep') {
      setKeepCount((prev) => Math.max(0, prev - 1));
    } else if (lastItem.decision === 'delete') {
      setDeletedList((prev) => prev.filter((d) => d.id !== lastItem.item.id));
    } else if (lastItem.decision === 'maybe') {
      setMaybePile((prev) => prev.filter((m) => m.item.id !== lastItem.item.id));
    }

    const restoredIndex = lastItem.index;
    setCurrentIndex(restoredIndex);

    if (restoredIndex < lazyItems.length) {
      await preloadThumbnailWindow(lazyItems, restoredIndex, 5);
      setLazyItems([...lazyItems]);
    }
  }, [history, lazyItems]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (view !== 'review') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDecision('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleDecision('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleDecision('up');
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setView('setup');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, currentIndex, lazyItems, history, handleUndo]);

  /* Scroll progress for Landing card pile animation */
  const { scrollYProgress } = useScroll({
    target: pileRef,
    offset: ["start end", "end start"],
  });

  const activeItem = lazyItems[currentIndex];
  const nextItem = lazyItems[currentIndex + 1];
  const peekItem = lazyItems[currentIndex + 2];

  const totalCount = lazyItems.length;
  const currentNum = Math.min(currentIndex + 1, totalCount);
  const progressPct = totalCount > 0 ? (currentIndex / totalCount) * 100 : 0;
  const totalDeletedBytes = deletedList.reduce((acc, item) => acc + item.size, 0);

  return (
    <div className="min-h-screen bg-bg text-text font-body selection:bg-accent selection:text-white flex flex-col justify-between transition-colors duration-300">
      
      {/* ——— NAV ——— */}
      {view !== 'review' && (
        <nav className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 sm:px-6 py-5 sm:py-6 border-b border-border/40">
          <div 
            onClick={() => setView('landing')}
            className="font-display text-sm sm:text-base font-bold tracking-tight text-text cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/25 transition-all shadow-xs">
              <LogoIcon className="h-4 w-4" />
            </div>
            <span className="group-hover:text-accent transition-colors">SnapTidy</span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 text-xs font-mono text-text-secondary">
            {deletedList.length > 0 && view !== 'confirm' && view !== 'summary' && (
              <button
                onClick={() => setView('confirm')}
                className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-surface border border-danger/40 text-danger hover:bg-danger/10 transition-all cursor-pointer text-[11px] sm:text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Deleted ({deletedList.length})</span>
              </button>
            )}

            {/* About & Privacy moved to bottom footer */}

            <button
              onClick={() => setView('settings')}
              className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text transition-colors cursor-pointer p-1"
              title="Settings & Shortcuts"
            >
              <Settings className="h-4 w-4" />
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] text-text-secondary transition-colors hover:text-text focus-visible:text-text"
            >
              <GitHubIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Source</span>
            </a>
          </div>
        </nav>
      )}

      {/* ——— ROUTE VIEWS ——— */}
      {view === 'landing' && (
        /* ————————————— LANDING VIEW ————————————— */
        <main className="flex-1">
          <header className="mx-auto max-w-3xl px-4 sm:px-6 pt-12 pb-16 sm:pt-24 sm:pb-28">
            <span className="mb-4 sm:mb-6 inline-block rounded-md border border-border px-2.5 py-1 font-mono text-xs text-text-secondary">
              Open-source &middot; Local-only
            </span>

            <h1 className="font-display text-[clamp(1.85rem,5.5vw,3.5rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-text">
              Stop hoarding screenshots.
            </h1>

            <p className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-lg leading-relaxed text-text-secondary">
              Point it at a folder. Swipe through thousands of screenshots in
              minutes. Nothing ever leaves your device.
            </p>

            {savedSession && (
              <div className="mt-6 sm:mt-8 rounded-xl border border-accent/40 bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shrink-0">
                    <History className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-text font-semibold block">
                      Resume session in 📁 <strong className="text-accent">{savedSession.state.folderName}</strong>?
                    </span>
                    <span className="text-[11px] font-mono text-text-secondary">
                      Item {savedSession.state.currentIndex + 1} &middot; {savedSession.state.keepCount} kept &middot; {savedSession.state.deleteCount} marked for deletion
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleDismissResume}
                    className="text-xs font-mono text-text-secondary hover:text-text px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleResumeSession}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/85 transition-colors cursor-pointer shadow-md shadow-accent/20"
                  >
                    <span>Resume Session</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              {isSupported ? (
                <button
                  type="button"
                  onClick={handleChooseFolder}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/85 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.97] cursor-pointer shadow-lg shadow-accent/20"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Choose a folder</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-4 py-2.5 text-xs font-mono text-danger">
                  <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
                  <span>Please open this in Chrome or Edge</span>
                </div>
              )}

              <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Lock className="h-3.5 w-3.5 text-text-secondary/70" />
                100% local — nothing uploads anywhere.
              </span>
            </div>
          </header>

          <section
            ref={pileRef}
            className="mx-auto max-w-3xl px-4 sm:px-6 pb-24 sm:pb-40"
            aria-label="Visual demonstration of decluttering"
          >
            <div className="relative flex h-[320px] sm:h-[440px] items-center justify-center">
              {CARDS.map((card, i) => (
                <PileCard
                  key={card.filename}
                  card={card}
                  index={i}
                  total={CARDS.length}
                  progress={scrollYProgress}
                  prefersReduced={!!prefersReduced}
                />
              ))}
            </div>
          </section>
        </main>
      )}

      {view === 'setup' && (
        /* ————————————— SETUP / SCAN SCREEN ————————————— */
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="w-full max-w-[480px]">
            <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
              
              {scanStatus === 'scanning' ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="h-4 w-4 text-text-secondary animate-spin" />
                  <p className="text-sm font-mono text-text-secondary">
                    Scanning <span className="text-text font-semibold">{folderHandle?.name || 'folder'}</span>...
                  </p>
                </div>
              ) : scanStatus === 'permission_denied' ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto text-danger">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold text-text">Folder Permission Denied</h2>
                    <p className="text-xs font-mono text-text-secondary max-w-xs mx-auto">
                      Browser permission to access this folder was cancelled or denied.
                    </p>
                  </div>
                  <button
                    onClick={handleChooseFolder}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent/85 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>Try selecting folder again</span>
                  </button>
                </div>
              ) : scanStatus === 'empty_folder' ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-text-secondary">
                    <FolderX className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold text-text">Folder is Empty</h2>
                    <p className="text-xs font-mono text-text-secondary max-w-xs mx-auto">
                      No supported image files found in <strong className="text-text">{folderHandle?.name}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handleChooseFolder}
                    className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer inline-block"
                  >
                    Choose a different folder
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-1 py-1">
                    <div className="font-mono text-4xl sm:text-5xl font-bold text-text tracking-tight flex items-center justify-center gap-2">
                      <AnimatedFileCount targetCount={lazyItems.length} />
                      {isRescanningDisk && <Loader2 className="h-4 w-4 text-text-secondary animate-spin" />}
                    </div>
                    <p className="text-xs font-mono text-text-secondary">
                      files found in <span className="text-text font-medium">{folderHandle?.name}</span>
                    </p>
                  </div>

                  <div className="pt-5 border-t border-border/60 space-y-5">
                    <div>
                      <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider block mb-2">
                        File Types
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'screenshots', label: 'Screenshots' },
                          { id: 'photos', label: 'Photos' },
                          { id: 'all', label: 'All images' },
                        ].map((cat) => {
                          const isSelected = fileCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleFilterCategoryChange(cat.id as FileCategoryFilter)}
                              className={`py-2 px-2 rounded-lg text-[11px] sm:text-xs font-mono border transition-all text-center cursor-pointer ${
                                isSelected
                                  ? 'bg-accent/20 border-accent text-text font-semibold'
                                  : 'bg-bg border-border text-text-secondary hover:border-text-secondary/40'
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div 
                      onClick={handleToggleSubfolders}
                      className="flex items-center justify-between py-2 border-t border-border/40 cursor-pointer"
                    >
                      <span className="text-xs font-body text-text">
                        Include subfolders
                      </span>
                      <input
                        type="checkbox"
                        checked={includeSubfolders}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-[#6E56CF] cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 border-t border-border/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-text-secondary">Minimum file size</span>
                        <span className="text-text">
                          {sliderVal === 0 ? 'Off (Any size)' : `> ${sliderVal} MB`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={sliderVal}
                        onChange={handleMinSizeChange}
                        className="w-full h-1.5 bg-bg rounded-lg appearance-none cursor-pointer accent-[#6E56CF]"
                      />
                    </div>
                  </div>

                  {/* Clean Inline No Images Matched Notice (without separate card unmounting) */}
                  {lazyItems.length === 0 && (
                    <div className="pt-2 text-xs font-mono text-text-secondary text-center flex items-center justify-center gap-1.5 bg-bg/60 py-2.5 px-3 rounded-lg border border-border/60">
                      <FilterX className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span>No images match these filters. <button onClick={handleResetFilters} className="text-accent hover:underline cursor-pointer font-semibold ml-1">Reset filters</button></span>
                    </div>
                  )}

                  <div className="pt-4 space-y-3 text-center">
                    <button
                      type="button"
                      onClick={handleStartReviewing}
                      disabled={lazyItems.length === 0}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#6E56CF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6E56CF]/85 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                    >
                      <span>Start reviewing &rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleChooseFolder}
                      className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer inline-block"
                    >
                      Choose a different folder
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </main>
      )}

      {view === 'review' && (
        /* ————————————— MAIN SWIPE REVIEW SCREEN ————————————— */
        <main className="flex-1 flex flex-col justify-between max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 relative">
          
          <div className="w-full h-[1px] bg-border overflow-hidden absolute top-0 left-0 right-0">
            <div 
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
              {maybePile.length > 0 && (
                <button
                  onClick={() => setView('maybe')}
                  className="hover:text-text transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-accent" />
                  <span>Maybe ({maybePile.length})</span>
                </button>
              )}
            </div>

            <div className="text-center">
              <span className="font-mono text-xs text-text-secondary">
                {currentNum} / {totalCount}
              </span>
            </div>

            <button
              onClick={() => setView('setup')}
              className="text-text-secondary hover:text-text transition-colors p-1 cursor-pointer"
              title="Pause session & return to setup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-2 sm:py-4 relative min-h-[380px] sm:min-h-[480px]">
            {currentIndex < lazyItems.length ? (
              <div className="relative w-[280px] sm:w-[340px] h-[360px] sm:h-[440px]">
                {activeItem && (
                  <SwipeCard
                    key={activeItem.id}
                    imageSrc={activeItem.objectUrl || ''}
                    filename={activeItem.name}
                    filesize={formatBytes(activeItem.size)}
                    nextImageSrc={nextItem?.objectUrl || undefined}
                    peekImageSrc={peekItem?.objectUrl || undefined}
                    onSwipeComplete={(direction) => handleDecision(direction)}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto text-accent">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-bold text-text">
                  Session Complete
                </h2>
                <p className="text-xs font-mono text-text-secondary">
                  Keep: <span className="text-success">{keepCount}</span> &middot; Delete: <span className="text-danger">{deletedList.length}</span> &middot; Maybe: {maybePile.length}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {deletedList.length > 0 && (
                    <button
                      onClick={() => setView('confirm')}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#F2555A] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#F2555A]/85 cursor-pointer shadow-lg shadow-[#F2555A]/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Review Deletions ({deletedList.length})</span>
                    </button>
                  )}

                  <button
                    onClick={() => setView('setup')}
                    className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-4 py-2.5 text-xs font-mono text-text hover:border-accent transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Return to Setup</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 sm:pt-6 pb-2">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text disabled:opacity-30 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Undo</span>
            </button>

            <span className="font-mono text-[10px] sm:text-[11px] text-text-secondary/50 select-none">
              &larr; delete &middot; &rarr; keep &middot; &uarr; maybe
            </span>
          </div>

        </main>
      )}

      {view === 'maybe' && (
        /* ————————————— MAYBE PILE SCREEN ————————————— */
        <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
          
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
            <button
              onClick={() => setView('review')}
              className="inline-flex items-center gap-1 text-xs font-mono text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to swiping</span>
            </button>

            {maybePile.length > 0 && (
              <button
                onClick={handleClearMaybePile}
                className="text-xs font-mono text-text-secondary hover:text-text transition-colors cursor-pointer"
                title="Bulk-return all items to Keep"
              >
                Clear pile
              </button>
            )}
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-1">
              Maybe pile
            </h1>
            <p className="text-xs sm:text-sm font-mono text-text-secondary">
              {maybePile.length === 1 
                ? "1 photo you weren't sure about." 
                : `${maybePile.length} photos you weren't sure about.`
              }
            </p>
          </div>

          {maybePile.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-body text-sm text-text-secondary">
                Nothing here. Anything you're unsure about during review will land here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {maybePile.map((entry) => (
                <div
                  key={entry.item.id}
                  onClick={() => handleReopenMaybeItem(entry)}
                  className="group rounded-xl border border-border bg-surface p-2 flex flex-col justify-between hover:border-accent transition-all cursor-pointer overflow-hidden"
                >
                  <div className="w-full aspect-square rounded-lg bg-bg border border-border/60 overflow-hidden flex items-center justify-center relative">
                    <LazyThumbnail
                      item={entry.item}
                      alt={entry.item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="pt-2 font-mono text-[11px] leading-tight space-y-0.5">
                    <p className="text-text font-medium truncate group-hover:text-accent transition-colors" title={entry.item.name}>
                      {entry.item.name}
                    </p>
                    <p className="text-[10px] text-text-secondary">
                      {formatBytes(entry.item.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {view === 'confirm' && (
        /* ————————————— CONFIRM DELETION SCREEN ————————————— */
        <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
          
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border/60">
            <button
              onClick={() => setView('review')}
              className="inline-flex items-center gap-1 text-xs font-mono text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to review</span>
            </button>
          </div>

          <div className="mb-8 space-y-1">
            <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight">
              {deletedList.length} files &middot; <span className="text-[#F2555A]">{formatBytes(totalDeletedBytes)}</span> will be deleted
            </div>
            <p className="text-xs font-mono text-text-secondary">
              Review files marked for deletion. Click the &times; on any thumbnail to un-mark it.
            </p>
          </div>

          {deletedList.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
              <p className="font-mono text-xs text-text-secondary">
                No files currently marked for deletion.
              </p>
              <button
                onClick={() => setView('setup')}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/85 cursor-pointer mt-2"
              >
                <span>Return to Setup</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-12">
                {deletedList.map((item) => {
                  const isUnmarking = unmarkingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-xl border bg-surface p-2 flex flex-col justify-between transition-all overflow-hidden ${
                        isUnmarking ? 'border-[#3DD68C] ring-2 ring-[#3DD68C]/50' : 'border-[#F2555A]/40 hover:border-[#F2555A]'
                      }`}
                    >
                      <button
                        onClick={() => handleUnmarkDeletedItem(item.id)}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0B0B0F]/90 border border-[#232330] flex items-center justify-center text-text-secondary hover:text-[#3DD68C] hover:border-[#3DD68C] transition-all cursor-pointer z-10"
                        title="Un-mark item and return to kept"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      <div className="w-full aspect-square rounded-lg bg-bg border border-border/60 overflow-hidden flex items-center justify-center relative">
                        <LazyThumbnail
                          item={item}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="pt-2 font-mono text-[11px] leading-tight space-y-0.5">
                        <p className="text-text font-medium truncate" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#F2555A] font-semibold">
                          {formatBytes(item.size)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-[#F2555A]/30 bg-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div>
                  <span className="text-sm font-mono text-text font-semibold block">
                    {deletedList.length} files selected &middot; {formatBytes(totalDeletedBytes)} total
                  </span>
                  <span className="text-xs font-mono text-text-secondary">
                    Irreversible action — files will be permanently deleted from local disk.
                  </span>
                </div>

                {!isArmingDelete ? (
                  <button
                    type="button"
                    onClick={() => setIsArmingDelete(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#F2555A] px-8 py-3.5 text-sm font-mono font-semibold text-white transition-all hover:bg-[#F2555A]/85 active:scale-[0.98] cursor-pointer shadow-lg shadow-[#F2555A]/25"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete {deletedList.length} files</span>
                  </button>
                ) : (
                  <div className="w-full sm:w-auto rounded-lg border border-[#F2555A] bg-[#0B0B0F] p-3 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in zoom-in-95">
                    <span className="text-xs font-mono text-[#F2555A] font-semibold flex items-center gap-1.5 px-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Are you sure? This can't be undone.</span>
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setIsArmingDelete(false)}
                        className="px-3 py-1.5 rounded text-xs font-mono text-text-secondary hover:text-text cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleConfirmDeletion}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded bg-[#F2555A] px-5 py-2 text-xs font-mono font-bold text-white hover:bg-[#F2555A]/90 transition-colors cursor-pointer shadow-md"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <span>Yes, delete</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      )}

      {view === 'summary' && (
        /* ————————————— SUMMARY SCREEN ————————————— */
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
          
          <div className="space-y-12">
            
            <div className="text-center space-y-2">
              <div className="font-mono text-5xl sm:text-7xl font-extrabold text-[#6E56CF] tracking-tight">
                <AnimatedStorageFreed bytes={summaryStats?.bytesReclaimed || 0} />
              </div>
              <p className="text-sm font-mono text-text-secondary">
                freed of local clutter from <span className="text-text font-semibold">{folderHandle?.name || 'folder'}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="rounded-xl border border-border bg-surface p-5 text-center space-y-1">
                <span className="text-xs text-text-secondary block uppercase tracking-wider">Reviewed</span>
                <span className="text-3xl font-bold text-text">
                  {Math.min(currentIndex, lazyItems.length).toLocaleString()}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 text-center space-y-1">
                <span className="text-xs text-text-secondary block uppercase tracking-wider">Kept</span>
                <span className="text-3xl font-bold text-[#3DD68C]">
                  {keepCount.toLocaleString()}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 text-center space-y-1">
                <span className="text-xs text-text-secondary block uppercase tracking-wider">Deleted</span>
                <span className="text-3xl font-bold text-[#F2555A]">
                  {(summaryStats?.deletedCount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-[#6E56CF]" />
                  <span>Share your result</span>
                </span>
                <span className="text-[11px] text-text-secondary/60">1200 &times; 630 PNG</span>
              </div>

              <div className="rounded-lg border border-border/80 overflow-hidden bg-bg">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto object-contain max-h-[320px]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyShareCard}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface border border-border px-4 py-2 text-xs font-mono font-semibold text-text hover:border-[#6E56CF] transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-[#6E56CF]" />
                  <span>{copiedShare ? 'Copied image!' : 'Copy image'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadShareCard}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface border border-border px-4 py-2 text-xs font-mono font-semibold text-text hover:border-[#6E56CF] transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[#6E56CF]" />
                  <span>Download card</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 text-center">
              <button
                type="button"
                onClick={handleChooseFolder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#6E56CF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6E56CF]/85 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                <FolderOpen className="h-4 w-4" />
                <span>Review another folder</span>
              </button>

              <button
                type="button"
                onClick={() => setView('landing')}
                className="text-xs font-mono text-text-secondary hover:text-text transition-colors cursor-pointer inline-block py-2"
              >
                Done
              </button>
            </div>

          </div>
        </main>
      )}

      {view === 'settings' && (
        /* ————————————— SETTINGS SCREEN ————————————— */
        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
          
          <div className="w-full max-w-[480px] space-y-6">
            
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
              <button
                onClick={() => setView('landing')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-text transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <span className="font-display text-base font-bold text-text">Settings</span>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-text-secondary uppercase tracking-wider">
                <Moon className="h-3.5 w-3.5 text-accent" />
                <span>Appearance</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'dark', label: 'Default Dark' },
                  { id: 'pure-black', label: 'OLED Black' },
                  { id: 'light', label: 'Clean Light' },
                ].map((mode) => {
                  const isSelected = themeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => applyTheme(mode.id as AppThemeMode)}
                      className={`py-2 px-2 rounded-lg text-xs font-mono border transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-accent/20 border-accent text-text font-semibold'
                          : 'bg-bg border-border text-text-secondary hover:border-text-secondary/40'
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-text-secondary uppercase tracking-wider">
                <Keyboard className="h-3.5 w-3.5 text-accent" />
                <span>Keyboard Shortcuts</span>
              </div>

              <div className="space-y-2 pt-1 font-mono text-xs">
                {[
                  { key: '←', action: 'Delete' },
                  { key: '→', action: 'Keep' },
                  { key: '↑', action: 'Maybe' },
                  { key: 'Z', action: 'Undo' },
                  { key: 'ESC', action: 'Pause / Exit' },
                ].map((sc, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <kbd className="px-2 py-0.5 rounded border border-border bg-bg text-text font-mono text-[11px] shadow-xs">
                      [{sc.key}]
                    </kbd>
                    <span className="text-text-secondary">{sc.action}</span>
                  </div>
                ))}
              </div>
            </div>



            <div className="rounded-xl border border-border bg-surface p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Version</span>
                <span className="text-text font-semibold">v1.0.0</span>
              </div>

              <div className="flex items-center justify-between text-text-secondary pt-2 border-t border-border/50">
                <span>Repository</span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex items-center justify-between text-text-secondary pt-2 border-t border-border/50">
                <span>License</span>
                <span className="text-text">MIT</span>
              </div>
            </div>

          </div>

        </main>
      )}

      {view === 'about' && (
        /* ————————————— ABOUT / PRIVACY SCREEN ————————————— */
        <main className="flex-1 mx-auto w-full max-w-[65ch] px-4 sm:px-6 py-10 sm:py-16">
          
          <div className="space-y-10 font-body text-sm sm:text-base text-text-secondary leading-relaxed">
            
            {/* Navigation back link */}
            <div>
              <button
                onClick={() => setView('landing')}
                className="inline-flex items-center gap-1 text-xs font-mono text-text-secondary hover:text-text transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to home</span>
              </button>
            </div>

            {/* Title */}
            <div className="space-y-2 border-b border-border pb-6">
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
                About &amp; Privacy
              </h1>
              <p className="font-mono text-xs text-text-secondary">
                Zero trackers &middot; 100% client-side execution &middot; Open source
              </p>
            </div>

            {/* Section 1: What SnapTidy does */}
            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-text tracking-tight">
                What SnapTidy does
              </h2>
              <p>
                SnapTidy is a rapid image decluttering tool designed to help developers and power users organize overflowing screenshot folders. By presenting your files in an intuitive swipe-review workspace, you can process thousands of clutter items in minutes.
              </p>
            </section>

            {/* Section 2: What it does with your files */}
            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-text tracking-tight">
                What it does with your files
              </h2>
              <p>
                SnapTidy operates under a strict local-first architecture using the browser&apos;s native <code className="font-mono text-text bg-surface px-1.5 py-0.5 rounded border border-border">File System Access API</code>.
              </p>
              <p>
                When you grant folder access, your browser provides a direct local handle to read and delete files on your machine. <strong className="text-text">Nothing is ever uploaded.</strong> No image data, filenames, or directory paths leave your browser memory.
              </p>
              <p>
                There are zero telemetry scripts, zero tracking cookies, and zero network calls during your session. Progress state is cached strictly inside your browser&apos;s IndexedDB for resuming after page refreshes.
              </p>
            </section>

            {/* Section 3: Open source */}
            <section className="space-y-3 border-t border-border pt-8">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-text tracking-tight">
                Open source
              </h2>
              <p>
                SnapTidy is entirely open source software released under the <strong className="text-text">MIT License</strong>. You are welcome to inspect, audit, or self-host the codebase on GitHub.
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-mono font-semibold text-accent hover:underline"
                >
                  <GitHubIcon className="h-4 w-4" />
                  <span>View source code on GitHub &rarr;</span>
                </a>
              </div>
            </section>

          </div>

        </main>
      )}

      {/* ——— FOOTER ——— */}
      {view !== 'review' && (
        <footer className="mx-auto flex w-full max-w-3xl items-center justify-between border-t border-border px-4 sm:px-6 py-6 sm:py-8 text-xs text-text-secondary">
          <span>
            Built with the{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_API"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-border underline-offset-2 transition-colors hover:text-text"
            >
              File System Access API
            </a>
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('about')}
              className="transition-colors hover:text-text cursor-pointer"
            >
              About &amp; Privacy
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-text focus-visible:text-text"
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}

/* ————————————————————————————————— baseline animation card for landing hero ————————————————————————————————— */
interface PileCardProps {
  card: CardData;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  prefersReduced: boolean;
}

function PileCard({ card, index, total, progress, prefersReduced }: PileCardProps) {
  const resolvedY = (total - 1 - index) * -6;

  const rawX = useTransform(
    progress,
    [0, 0.4],
    prefersReduced ? [0, 0] : [card.scattered.x, 0]
  );
  const rawY = useTransform(
    progress,
    [0, 0.4],
    prefersReduced ? [resolvedY, resolvedY] : [card.scattered.y, resolvedY]
  );
  const rawRotate = useTransform(
    progress,
    [0, 0.4],
    prefersReduced ? [0, 0] : [card.scattered.rotate, 0]
  );

  const springConfig = { stiffness: 120, damping: 20, mass: 0.5 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);
  const rotate = useSpring(rawRotate, springConfig);

  const Visual = card.renderVisual;

  return (
    <motion.div
      style={{ x, y, rotate, zIndex: index }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="absolute w-[260px] sm:w-[340px] transition-shadow duration-300"
    >
      <div
        className="flex flex-col justify-between rounded-xl border border-border p-3 sm:p-4 shadow-2xl shadow-black/60 bg-surface group hover:border-accent/50 transition-colors"
        style={{ height: 210 }}
      >
        <div className="flex-1 overflow-hidden mb-3">
          <Visual />
        </div>

        <div className="flex items-end justify-between gap-3 pt-1 border-t border-border/40">
          <span className="truncate font-mono text-[11px] text-text-secondary group-hover:text-text transition-colors">
            {card.filename}
          </span>
          <span className="shrink-0 font-mono text-[11px] text-text-secondary/70">
            {card.size}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

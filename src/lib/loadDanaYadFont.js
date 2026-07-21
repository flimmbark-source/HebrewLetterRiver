import danaYadArchiveUrl from '../data/dana-yad-alefalefalef.zip?url';

const FONT_FAMILY = 'Dana Yad';
const FONT_FILENAME = 'DanaYadAlefAlefAlef-Normal.woff';
const FONT_VALUE = 'dana-yad';
const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const LOCAL_FILE_SIGNATURE = 0x04034b50;

let loadPromise = null;
let initialized = false;

function findEndOfCentralDirectory(view) {
  const minimumOffset = Math.max(0, view.byteLength - 0xffff - 22);

  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === EOCD_SIGNATURE) return offset;
  }

  throw new Error('Dana Yad archive has no ZIP central directory');
}

function findFontEntry(archiveBytes) {
  const view = new DataView(
    archiveBytes.buffer,
    archiveBytes.byteOffset,
    archiveBytes.byteLength,
  );
  const decoder = new TextDecoder();
  const endOfCentralDirectory = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(endOfCentralDirectory + 10, true);
  let offset = view.getUint32(endOfCentralDirectory + 16, true);

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== CENTRAL_DIRECTORY_SIGNATURE) {
      throw new Error('Dana Yad archive central directory is invalid');
    }

    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const filenameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const filename = decoder.decode(
      archiveBytes.subarray(offset + 46, offset + 46 + filenameLength),
    );

    if (filename.endsWith(FONT_FILENAME)) {
      if (view.getUint32(localHeaderOffset, true) !== LOCAL_FILE_SIGNATURE) {
        throw new Error('Dana Yad archive local file header is invalid');
      }

      const localFilenameLength = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
      const dataOffset = localHeaderOffset + 30 + localFilenameLength + localExtraLength;

      return {
        compressionMethod,
        compressedSize,
        uncompressedSize,
        bytes: archiveBytes.subarray(dataOffset, dataOffset + compressedSize),
      };
    }

    offset += 46 + filenameLength + extraLength + commentLength;
  }

  throw new Error(`Dana Yad archive is missing ${FONT_FILENAME}`);
}

async function inflateEntry(entry) {
  if (entry.compressionMethod === 0) return entry.bytes;

  if (entry.compressionMethod !== 8) {
    throw new Error(`Unsupported ZIP compression method: ${entry.compressionMethod}`);
  }

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('This browser cannot extract the Dana Yad font archive');
  }

  const stream = new Blob([entry.bytes])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  const inflatedBuffer = await new Response(stream).arrayBuffer();

  if (inflatedBuffer.byteLength !== entry.uncompressedSize) {
    throw new Error('Dana Yad font data does not match the archive entry');
  }

  return inflatedBuffer;
}

function hasRegisteredFont() {
  if (typeof document === 'undefined' || !document.fonts) return false;

  for (const fontFace of document.fonts) {
    if (fontFace.family.replaceAll('"', '') === FONT_FAMILY && fontFace.status === 'loaded') {
      return true;
    }
  }

  return false;
}

async function loadDanaYadFont() {
  if (
    typeof document === 'undefined'
    || typeof FontFace === 'undefined'
    || !document.fonts
  ) {
    return null;
  }

  if (hasRegisteredFont()) return FONT_FAMILY;

  const response = await fetch(danaYadArchiveUrl);
  if (!response.ok) {
    throw new Error(`Unable to load Dana Yad archive (${response.status})`);
  }

  const archiveBytes = new Uint8Array(await response.arrayBuffer());
  const fontBuffer = await inflateEntry(findFontEntry(archiveBytes));
  const fontFace = new FontFace(FONT_FAMILY, fontBuffer, {
    style: 'normal',
    weight: '400',
  });

  await fontFace.load();
  document.fonts.add(fontFace);
  return FONT_FAMILY;
}

export function ensureDanaYadFontLoaded() {
  if (!loadPromise) {
    loadPromise = loadDanaYadFont().catch((error) => {
      loadPromise = null;
      console.warn('[Fonts] Dana Yad could not be loaded:', error);
      return null;
    });
  }

  return loadPromise;
}

function isDanaYadSelected() {
  try {
    const rawSettings = window.localStorage.getItem('gameSettings');
    if (!rawSettings) return false;
    return JSON.parse(rawSettings).gameFont === FONT_VALUE;
  } catch (error) {
    console.warn('[Fonts] Could not read the selected game font:', error);
    return false;
  }
}

function ensureInGameFontOption() {
  const select = document.getElementById('game-font-select');
  if (!select || select.querySelector(`option[value="${FONT_VALUE}"]`)) return;

  const option = document.createElement('option');
  option.value = FONT_VALUE;
  option.textContent = FONT_FAMILY;
  select.appendChild(option);

  if (isDanaYadSelected()) select.value = FONT_VALUE;
}

function observeInGameFontSelector() {
  ensureInGameFontOption();

  if (typeof MutationObserver === 'undefined' || !document.documentElement) return;

  const observer = new MutationObserver(ensureInGameFontOption);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

export function initializeDanaYadFont() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const loadWhenSelected = () => {
    if (isDanaYadSelected()) ensureDanaYadFontLoaded();
  };

  observeInGameFontSelector();
  loadWhenSelected();
  window.addEventListener('gameSettingsChanged', loadWhenSelected);
  window.addEventListener('storage', loadWhenSelected);
}

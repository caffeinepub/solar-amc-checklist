// Photos are stored embedded in the report's notes field using a delimiter.
// This ensures photos always travel with the report and are visible cross-device,
// since the notes field is proven to persist correctly in the canister.

export interface PhotoEntry {
  dataUrl: string;
  label: string;
}

const PHOTO_DELIMITER = "\n\n\x00PHOTOS\x00";

export function parseNotesAndPhotos(combined: string): {
  notes: string;
  photos: PhotoEntry[];
} {
  const idx = combined.indexOf(PHOTO_DELIMITER);
  if (idx === -1) {
    return { notes: combined, photos: [] };
  }
  const notes = combined.substring(0, idx);
  const photosJson = combined.substring(idx + PHOTO_DELIMITER.length);
  try {
    const parsed = JSON.parse(photosJson);
    if (!Array.isArray(parsed)) return { notes, photos: [] };
    return {
      notes,
      photos: parsed.filter(
        (item): item is PhotoEntry =>
          item !== null &&
          typeof item === "object" &&
          typeof item.dataUrl === "string" &&
          item.dataUrl.length > 0,
      ),
    };
  } catch {
    return { notes, photos: [] };
  }
}

export function combineNotesAndPhotos(
  notes: string,
  photos: PhotoEntry[],
): string {
  if (photos.length === 0) return notes;
  return notes + PHOTO_DELIMITER + JSON.stringify(photos);
}

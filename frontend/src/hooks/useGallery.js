import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "protocole-summer-build:gallery:v1";
const MAX_PHOTOS = 90; // ~3 mois de petit-déj
const MAX_WIDTH = 800;
const JPEG_QUALITY = 0.78;

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const save = (photos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch (e) {
    // quota exceeded — drop oldest entries until it fits
    if (e?.name === "QuotaExceededError" && photos.length > 0) {
      const trimmed = photos.slice(0, Math.max(1, photos.length - 5));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // give up
      }
    }
  }
};

// Resize + compress image file → JPEG data URL
export const resizeImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("image decode failed"));
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const w = Math.max(1, Math.floor(img.width * scale));
        const h = Math.max(1, Math.floor(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const useGallery = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    setPhotos(load());
  }, []);

  const addPhoto = useCallback(async (file) => {
    const dataUrl = await resizeImageFile(file);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: todayStr(),
      createdAt: new Date().toISOString(),
      dataUrl,
    };
    setPhotos((prev) => {
      const next = [entry, ...prev].slice(0, MAX_PHOTOS);
      save(next);
      return next;
    });
    return entry;
  }, []);

  const deletePhoto = useCallback((id) => {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setPhotos([]);
    save([]);
  }, []);

  const hasPhotoToday = photos.some((p) => p.date === todayStr());

  return { photos, addPhoto, deletePhoto, clearAll, hasPhotoToday };
};

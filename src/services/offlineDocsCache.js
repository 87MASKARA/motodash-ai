/**
 * MotoDash AI — Bóveda Offline en IndexedDB para Modo Retén (Guantera Digital)
 * Guarda en el teléfono las 6 fotos de los 4 documentos oficiales (Pase Lado 1 y 2,
 * Tarjeta de Propiedad Lado 1 y 2, SOAT y Tecnomecánica) para que abran en 0 ms
 * incluso en carreteras sin señal de internet (0% cobertura móvil).
 */

const DB_NAME = 'motodash_offline_vault_v1';
const STORE_NAME = 'checkpoint_photos';

function openOfflineVault() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return resolve(null);
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

/**
 * Guarda una foto comprimida en la bóveda offline del dispositivo
 */
export async function saveOfflineCheckpointPhoto(bikeId, slot, dataUrl, metadata = {}) {
  try {
    const db = await openOfflineVault();
    if (!db || !bikeId || !slot || !dataUrl) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        id: `${bikeId}__${slot}`,
        bikeId,
        slot,
        dataUrl,
        metadata,
        savedAt: new Date().toISOString()
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Carga todas las fotos guardadas en la bóveda offline para una moto
 */
export async function loadOfflineCheckpointPhotos(bikeId) {
  try {
    const db = await openOfflineVault();
    if (!db || !bikeId) return {};

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = Array.isArray(req.result) ? req.result : [];
        const map = {};
        for (const item of list) {
          if (item.bikeId === bikeId && item.slot && item.dataUrl) {
            map[item.slot] = item.dataUrl;
          }
        }
        resolve(map);
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

// src/stores/tempStore.ts
import { defineStore } from 'pinia';

type StoredValue = {
  value: any;
  expiresAt?: number;
  persist?: boolean;
};

export const useTempStore = defineStore('temp', {
  state: () => {
    // Auto-load session data if available
    const stored = sessionStorage.getItem('tempData');
    return {
      data: stored ? (JSON.parse(stored) as Record<string, StoredValue>) : {},
    };
  },

  actions: {
    /**
     * Save only persistent keys to sessionStorage
     */
    _saveToSession() {
      const toSave: Record<string, StoredValue> = {};
      for (const [k, v] of Object.entries(this.data)) {
        if (v.persist) toSave[k] = v;
      }
      sessionStorage.setItem('tempData', JSON.stringify(toSave));
    },

    /**
     * Store a value in the temporary store
     * @param key The key to store
     * @param value The value to store
     * @param ttlMs Optional time-to-live in seconds (auto-deletes after expiry)
     * @param persist Optional boolean, if true the value survives refresh via sessionStorage
     */
    set(key: string, value: any, ttlMs?: number, persist: boolean = false) {
      const entry: StoredValue = { value, persist };
      if (ttlMs) {
        entry.expiresAt = Date.now() + (ttlMs * 60000)
      }
      this.data[key] = entry;
      this._saveToSession();
    },

    /**
     * Retrieve a stored value
     * @param key The key to retrieve
     * @returns The stored value or undefined if expired/not found
     */
    get<T = any>(key: string): T | undefined {
      const entry = this.data[key];
      if (!entry) return undefined;

      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        delete this.data[key];
        this._saveToSession();
        return undefined;
      }
      return entry.value as T;
    },

    /**
     * Remove a specific key from the store
     * @param key The key to remove
     */
    remove(key: string) {
      delete this.data[key];
      this._saveToSession();
    },

    /**
     * Clear the entire store
     */
    clear() {
      this.data = {};
      sessionStorage.removeItem('tempData');
    },
  },
});



/*
Example use:

    import { useTempStore } from '@/stores/tempStore';

    const temp = useTempStore();

    // Store email for 1 minute, persistent across refresh
    temp.set('email', 'user@example.com', 60_000, true);

    // Store OTP for 1 minute, NOT persistent
    temp.set('otp', '123456', 60_000, false);

    // Retrieve later
    console.log(temp.get('email')); // 'user@example.com'

*/

/*
// You can use any of these:
temp.set('email', 'user@example.com');                    // no TTL, no persistence
temp.set('email', 'user@example.com', 60_000);            // TTL only
temp.set('email', 'user@example.com', undefined, true);   // persistence only
temp.set('email', 'user@example.com', 60_000, true);      // TTL + persistence
*/ 
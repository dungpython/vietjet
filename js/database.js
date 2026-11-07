/**
 * Database Manager for Vietjet Travel Prototype
 * Handles SQLite WASM (SQL.js) + IndexedDB persistence of database bytes.
 * Fallback to JSON Adapter if SQL.js WASM is not available.
 * Conforms to 04_DATA_MODEL_AND_SQLITE.md & 05_TECHNICAL_ARCHITECTURE.md
 */

import { FALLBACK_DATABASE } from './seed-data.js';

const IDB_NAME = 'VietjetTravelDB';
const IDB_VERSION = 1;
const IDB_STORE = 'sqlite_store';
const IDB_KEY_BYTES = 'db_bytes';
const IDB_KEY_JSON = 'db_json';

class DatabaseManager {
  constructor() {
    this.sqlDb = null;
    this.engine = 'uninitialized'; // 'sqlite-wasm' or 'fallback-adapter'
    this.fallbackData = null;
    this.isSaving = false;
  }

  /**
   * Opens IndexedDB helper
   */
  async _openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _getIdbItem(key) {
    try {
      const idb = await this._openIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = idb.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[DB] IndexedDB read failed:', err);
      return null;
    }
  }

  async _setIdbItem(key, value) {
    try {
      const idb = await this._openIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = idb.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[DB] IndexedDB write failed:', err);
    }
  }

  /**
   * Initializes the database.
   * Priority 1: SQL.js with bytes from IndexedDB or sqlite/db.db
   * Priority 2: JSON fallback adapter with IndexedDB persistence
   */
  async init() {
    // 1. Try SQLite WASM (SQL.js)
    if (typeof window.initSqlJs === 'function') {
      try {
        const SQL = await window.initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
        });

        // Check if we already have persisted bytes in IndexedDB
        let bytes = await this._getIdbItem(IDB_KEY_BYTES);

        if (!bytes) {
          // Fetch the sqlite/db.db file created by the user
          try {
            const resp = await fetch('sqlite/db.db');
            if (resp.ok) {
              const buf = await resp.arrayBuffer();
              bytes = new Uint8Array(buf);
              await this._setIdbItem(IDB_KEY_BYTES, bytes);
              console.log('[DB] Loaded sqlite/db.db into SQLite WASM');
            }
          } catch (fetchErr) {
            console.warn('[DB] Could not fetch sqlite/db.db:', fetchErr);
          }
        }

        if (bytes && bytes.length > 0) {
          this.sqlDb = new SQL.Database(bytes);
        } else {
          // Create new in-memory SQLite and execute schema
          this.sqlDb = new SQL.Database();
          this._initSchemaOnFreshDb();
        }

        this.sqlDb.run('PRAGMA foreign_keys = ON;');
        this.engine = 'sqlite-wasm';
        console.log('[DB] Engine active: SQLite WASM (SQL.js)');
        return;
      } catch (wasmErr) {
        console.warn('[DB] SQLite WASM init failed, switching to Fallback Adapter:', wasmErr);
      }
    }

    // 2. Fallback Adapter using seed-data with IndexedDB persistence
    console.info('[DB] Using Fallback Adapter (JSON / IndexedDB) with data from db.db');
    this.engine = 'fallback-adapter';
    const savedJson = await this._getIdbItem(IDB_KEY_JSON);
    if (savedJson) {
      this.fallbackData = savedJson;
    } else {
      this.fallbackData = {
        airlines: JSON.parse(JSON.stringify(FALLBACK_DATABASE.airlines || [])),
        flights: JSON.parse(JSON.stringify(FALLBACK_DATABASE.flights || [])),
        tours: JSON.parse(JSON.stringify(FALLBACK_DATABASE.tours || [])),
        tour_itinerary: JSON.parse(JSON.stringify(FALLBACK_DATABASE.tour_itinerary || [])),
        cart_items: [],
        bookings: [],
        booking_items: []
      };
      await this._setIdbItem(IDB_KEY_JSON, this.fallbackData);
    }
  }

  /**
   * Persists current database state to IndexedDB
   */
  async persist() {
    if (this.engine === 'sqlite-wasm' && this.sqlDb) {
      try {
        const exportedBytes = this.sqlDb.export();
        await this._setIdbItem(IDB_KEY_BYTES, exportedBytes);
      } catch (err) {
        console.error('[DB] Failed to persist SQLite bytes to IndexedDB:', err);
      }
    } else if (this.engine === 'fallback-adapter' && this.fallbackData) {
      try {
        await this._setIdbItem(IDB_KEY_JSON, this.fallbackData);
      } catch (err) {
        console.error('[DB] Failed to persist fallback JSON to IndexedDB:', err);
      }
    }
  }

  /**
   * Executes a SELECT query and returns array of objects
   */
  query(sql, params = []) {
    if (this.engine === 'sqlite-wasm' && this.sqlDb) {
      const stmt = this.sqlDb.prepare(sql);
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    }
    return null;
  }

  /**
   * Executes an INSERT / UPDATE / DELETE statement and auto-persists
   */
  async run(sql, params = []) {
    if (this.engine === 'sqlite-wasm' && this.sqlDb) {
      this.sqlDb.run(sql, params);
      await this.persist();
      return true;
    }
    return false;
  }

  getEngine() {
    return this.engine;
  }
}

export const dbManager = new DatabaseManager();

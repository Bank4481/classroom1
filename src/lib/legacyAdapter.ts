/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Discussion, Course, UserProfile } from '../types';

export interface LegacySystemConfig {
  googleAppsScriptUrl: string;
  realtimeDatabaseUrl: string;
  enableLocalStorageFallback: boolean;
  lastSyncedAt?: string;
}

const STORAGE_KEY_CONFIG = 'learnspace_legacy_config';
const STORAGE_KEY_OFFLINE_DRAFTS = 'learnspace_offline_drafts';
const STORAGE_KEY_LESSON_BOOKMARKS = 'learnspace_bookmarks';

export const getLegacyConfig = (): LegacySystemConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read legacy config from localStorage', e);
  }
  return {
    googleAppsScriptUrl: '',
    realtimeDatabaseUrl: 'https://zesty-palace-6smzh-default-rtdb.firebaseio.com',
    enableLocalStorageFallback: true,
  };
};

export const saveLegacyConfig = (config: LegacySystemConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save legacy config', e);
  }
};

/**
 * Google Apps Script Web App API Bridge
 * Connects to Google Apps Script endpoints deployed as Web Apps (GET/POST)
 */
export const testGoogleAppsScriptConnection = async (scriptUrl: string): Promise<{ success: boolean; message: string; sampleData?: any }> => {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'URL ต้องขึ้นต้นด้วย https://script.google.com/.../exec ของ Google Apps Script Web App',
    };
  }

  try {
    const response = await fetch(`${scriptUrl}?action=ping`, {
      method: 'GET',
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({ status: 'ok' }));
      return {
        success: true,
        message: 'เชื่อมต่อ Google Apps Script Web App API สำเร็จเรียบร้อย',
        sampleData: data,
      };
    } else {
      return {
        success: false,
        message: `Google Apps Script ตอบกลับด้วยสถานะ HTTP ${response.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อได้ (${err.message || 'CORS หรือข้อผิดพลาดเครือข่าย'}). ตรวจสอบว่าได้ตั้งค่า Web App เป็น "Anyone" หรือยัง`,
    };
  }
};

/**
 * Fetch discussions from Google Apps Script endpoint if configured
 */
export const fetchDiscussionsFromAppsScript = async (scriptUrl: string): Promise<Discussion[]> => {
  if (!scriptUrl) return [];
  try {
    const response = await fetch(`${scriptUrl}?action=getDiscussions`, {
      method: 'GET',
      mode: 'cors',
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.warn('Failed to fetch from Google Apps Script, falling back to Firestore', error);
    return [];
  }
};

/**
 * Firebase Realtime Database Bridge
 * Connects to Firebase Realtime Database via REST API (.json endpoints)
 */
export const testRealtimeDbConnection = async (rtdbUrl: string): Promise<{ success: boolean; message: string }> => {
  if (!rtdbUrl) {
    return { success: false, message: 'กรุณาระบุ URL ของ Firebase Realtime Database' };
  }

  const cleanUrl = rtdbUrl.replace(/\/$/, '');
  try {
    const res = await fetch(`${cleanUrl}/.json?shallow=true`, {
      method: 'GET',
    });
    if (res.ok) {
      return { success: true, message: 'เชื่อมต่อ Firebase Realtime Database สำเร็จ' };
    }
    return { success: false, message: `Realtime Database แจ้งข้อผิดพลาด HTTP ${res.status}` };
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อ Realtime Database ได้: ${err.message || 'เครือข่ายขัดข้อง'}`,
    };
  }
};

/**
 * Local Storage Draft Management
 */
export const getOfflineDraft = (key: string): string => {
  try {
    const drafts = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFLINE_DRAFTS) || '{}');
    return drafts[key] || '';
  } catch {
    return '';
  }
};

export const saveOfflineDraft = (key: string, content: string): void => {
  try {
    const drafts = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFLINE_DRAFTS) || '{}');
    if (!content.trim()) {
      delete drafts[key];
    } else {
      drafts[key] = content;
    }
    localStorage.setItem(STORAGE_KEY_OFFLINE_DRAFTS, JSON.stringify(drafts));
  } catch (e) {
    console.error('Error saving offline draft', e);
  }
};

export const clearOfflineDraft = (key: string): void => {
  saveOfflineDraft(key, '');
};

export const getAllOfflineDrafts = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_OFFLINE_DRAFTS) || '{}');
  } catch {
    return {};
  }
};

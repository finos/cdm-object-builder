import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  setItem<T = any>(localStorageKey: string, state: T) {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }

  getItem<T = any>(localStorageKey: string): T | null {
    const item = localStorage.getItem(localStorageKey);
    if (item === null) {
      return item;
    }
    return JSON.parse(item);
  }

  removeItem(localStorageKey: string) {
    localStorage.removeItem(localStorageKey);
  }

  clear() {
    localStorage.clear();
  }
}

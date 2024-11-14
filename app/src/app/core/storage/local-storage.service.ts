import { Injectable } from '@angular/core';
import { LocalStorageKey, LocalStorageMap } from './model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    private readonly _storageState$ = new BehaviorSubject<LocalStorageMap>({ bestScore: null, bestTime: null });

    public readonly storageState$ = this._storageState$.asObservable();

    constructor() {
        const bestScore = this.get('bestScore');
        const bestTime = this.get('bestTime');

        this._storageState$.next({
            bestScore: bestScore ? Number(bestScore) : null,
            bestTime: bestTime ? Number(bestTime) : null
        });
    }

    public get(key: LocalStorageKey): string | null {
        const value = localStorage.getItem(key) ?? null;
        if (!value) return null;

        return JSON.parse(value);
    }

    public set<T extends LocalStorageMap, K extends LocalStorageKey>(key: K, value: T[K]): void {
        localStorage.setItem(key as string, JSON.stringify(value));
        this._storageState$.next({
            ...this._storageState$.value,
            [key]: value
        });
    }
}

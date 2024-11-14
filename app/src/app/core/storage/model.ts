export interface LocalStorageMap {
    bestTime: number | null;
    bestScore: number | null;
}

export type LocalStorageKey = keyof LocalStorageMap;

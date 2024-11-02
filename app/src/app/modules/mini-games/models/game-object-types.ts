import { BehaviorSubject } from 'rxjs';

export interface RelObjectCoords {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface GameContainerInfo {
    id: string;
    coords$: BehaviorSubject<AbsObjectCoords>;
}

export interface AbsObjectCoords {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

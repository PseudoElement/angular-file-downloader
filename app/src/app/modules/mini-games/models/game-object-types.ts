import { BehaviorSubject } from 'rxjs';

export interface RelObjectCoords {
    leftX: number;
    rightX: number;
    topY: number;
    bottomY: number;
    visibleRightX: number;
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

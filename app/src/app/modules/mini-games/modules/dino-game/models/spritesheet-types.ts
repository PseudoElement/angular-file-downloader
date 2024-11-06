export type SpriteAnimation = 'inactive' | 'moving' | 'die' | 'jump';

export type GameObjectSpritesheetConfigs = {
    [key in SpriteAnimation]?: SpriteSheetConfig;
};

export interface SpriteSheetConfig {
    offsetTop: number;
    offsetLeft: number;
    rows: number;
    columns: number;
    count: number;
    imgWidth: number;
    imgHeight: number;
    canvasWidth: number;
    canvasHeight: number;
}

export type ImagesForGameObject = {
    inactive?: string[];
    moving?: string[];
    die?: string[];
    jump?: string[];
};

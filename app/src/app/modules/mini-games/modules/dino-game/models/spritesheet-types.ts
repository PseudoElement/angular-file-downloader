export type SpriteAnimation = 'inactive' | 'move' | 'die' | 'jump';

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
    [key in SpriteAnimation]?: string[];
};

export type LoadedImagesForGameObject = {
    [key in SpriteAnimation]?: HTMLImageElement[];
};

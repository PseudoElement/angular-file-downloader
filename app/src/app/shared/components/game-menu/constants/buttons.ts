export interface MenuButton {
    text: string;
    type: MenuButtonType;
}

export type MenuState = 'start' | 'pause' | 'restart' | 'hidden';
export type MenuButtonType = 'start' | 'continue' | 'controls';

export const MENU_BUTTONS: Record<Exclude<MenuState, 'hidden'>, MenuButton[]> = {
    start: [
        { type: 'start', text: 'Start' },
        { type: 'controls', text: 'Controls' }
    ] as const,
    restart: [
        { type: 'start', text: 'Restart' },
        { type: 'controls', text: 'Controls' }
    ] as const,
    pause: [
        { type: 'continue', text: 'Continue' },
        { type: 'controls', text: 'Controls' }
    ] as const
} as const;

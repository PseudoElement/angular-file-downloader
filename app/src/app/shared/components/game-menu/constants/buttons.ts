export interface MenuButton {
    text: string;
    type: MenuButtonType;
}

export type MenuState = 'start' | 'pause' | 'restart' | 'hidden';
export type MenuButtonType = 'start' | 'continue' | 'settings' | 'restart' | 'end';

export const MENU_BUTTONS: Record<Exclude<MenuState, 'hidden'>, MenuButton[]> = {
    start: [
        { type: 'start', text: 'Start' },
        { type: 'settings', text: 'Settings' }
    ] as const,
    restart: [
        { type: 'restart', text: 'Restart' },
        { type: 'settings', text: 'Settings' }
    ] as const,
    pause: [
        { type: 'continue', text: 'Continue' },
        { type: 'restart', text: 'Restart' },
        { type: 'settings', text: 'Settings' },
        { type: 'end', text: 'Exit' }
    ] as const
} as const;

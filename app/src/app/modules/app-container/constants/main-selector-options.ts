import { GAMES_IDS } from '../../games-downloader/constants/games';
import { MINI_GAMES } from '../../mini-games/constants/mini-game-names';
import { MainSelectorOption } from '../models/components-types';

const START_RGB = 'rgb(240, 240, 240)';

export const MAIN_SELECTOR_OPTIONS: MainSelectorOption[] = [
    {
        isOpen: false,
        value: 'Downloads',
        bgColorRGB: START_RGB,
        children: [
            {
                isOpen: false,
                value: 'Download text files',
                children: [],
                navigationUrl: '/download-files'
            },
            {
                isOpen: false,
                value: 'Download games',
                children: [
                    {
                        isOpen: false,
                        value: 'Asteroids',
                        navigationUrl: `/download-games/${GAMES_IDS.ASTEROIDS}`,
                        children: []
                    },
                    {
                        isOpen: false,
                        value: 'Knight platformer',
                        navigationUrl: `/download-games/${GAMES_IDS.KNIGTH_PLATFORMER}`,
                        children: []
                    },
                    {
                        isOpen: false,
                        value: 'Space shooter',
                        navigationUrl: `/download-games/${GAMES_IDS.SPACE_SHOOTER}`,
                        children: []
                    },
                    {
                        isOpen: false,
                        value: 'Flappy bird',
                        navigationUrl: `/download-games/${GAMES_IDS.FLAPPY_BIRD}`,
                        children: []
                    },
                    {
                        isOpen: false,
                        value: 'Rust',
                        navigationUrl: `/download-games/${GAMES_IDS.RUST}`,
                        children: []
                    },
                    {
                        isOpen: false,
                        value: 'CS 2.0',
                        navigationUrl: `/download-games/${GAMES_IDS.CS_2}`,
                        children: []
                    },
                    {
                        isOpen: false,
                        value: 'WH40K Space Marine 2',
                        navigationUrl: `/download-games/${GAMES_IDS.SPACE_MARINE_2}`,
                        children: []
                    }
                ],
                navigationUrl: '/download-games'
            }
        ]
    },
    {
        isOpen: false,
        value: 'My mini-games',
        bgColorRGB: START_RGB,
        children: [
            {
                isOpen: false,
                value: 'Chrome Dino',
                navigationUrl: `/mini-games/${MINI_GAMES.DINO_GAME}`,
                children: []
            },
            {
                isOpen: false,
                value: 'Flappy Birds',
                navigationUrl: `/mini-games/${MINI_GAMES.FLAPPY_BIRD}`,
                children: []
            }
        ]
    },
    {
        isOpen: false,
        value: 'Telegram Bots',
        navigationUrl: '/telegram-bots',
        bgColorRGB: START_RGB,
        children: []
    },
    {
        isOpen: false,
        value: 'Tutorial',
        navigationUrl: '/tutorial',
        bgColorRGB: START_RGB,
        children: []
    },
    {
        isOpen: false,
        value: 'License',
        navigationUrl: '/license',
        bgColorRGB: START_RGB,
        children: []
    },
    {
        isOpen: false,
        value: 'Docs',
        bgColorRGB: START_RGB,
        children: [
            {
                isOpen: false,
                value: 'Angular docs',
                bgColorRGB: START_RGB,
                navigationUrl: 'https://angular.dev/overview',
                children: []
            },
            {
                isOpen: false,
                value: 'TypeScript docs',
                bgColorRGB: START_RGB,
                navigationUrl: 'https://www.typescriptlang.org/docs',
                children: []
            },
            {
                isOpen: false,
                value: 'Golang docs',
                bgColorRGB: START_RGB,
                navigationUrl: 'https://go.dev/doc',
                children: []
            },
            {
                isOpen: false,
                value: 'ECMAScript specs',
                bgColorRGB: START_RGB,
                navigationUrl: 'https://tc39.es/ecma262/2024',
                children: []
            }
        ]
    }
];

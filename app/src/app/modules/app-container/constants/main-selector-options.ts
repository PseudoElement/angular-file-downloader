import { MainSelectorOption } from '../models/components-types';

const START_RGB = 'rgb(240, 240, 240)';

export const MAIN_SELECTOR_OPTIONS: MainSelectorOption[] = [
    {
        isOpen: false,
        value: 'Tools',
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
                        value: 'Vampire Survivors',
                        children: []
                    },
                    {
                        isOpen: false,
                        value: 'Rust',
                        children: []
                    },
                    {
                        isOpen: false,
                        value: 'CS 2.0',
                        children: []
                    }
                ],
                navigationUrl: '/download-games'
            }
        ]
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
        value: 'About',
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

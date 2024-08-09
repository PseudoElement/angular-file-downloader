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
        bgColorRGB: START_RGB,
        children: []
    },
    {
        isOpen: false,
        value: 'License',
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
        value: 'Angular documentation',
        bgColorRGB: START_RGB,
        navigationUrl: 'https://angular.dev/overview',
        children: []
    }
];

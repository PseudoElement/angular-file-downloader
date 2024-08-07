import { MainSelectorOption } from '../models/components-types';

export const MAIN_SELECTOR_OPTIONS: MainSelectorOption[] = [
    {
        isOpen: false,
        value: 'Tools',
        bgColorRGB: 'rgb(250, 250, 250)',
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
                children: [],
                navigationUrl: '/download-games'
            }
        ]
    },
    {
        isOpen: false,
        value: 'Tutorial',
        bgColorRGB: 'rgb(250, 250, 250)',
        children: []
    },
    {
        isOpen: false,
        value: 'License',
        bgColorRGB: 'rgb(250, 250, 250)',
        children: []
    }
];

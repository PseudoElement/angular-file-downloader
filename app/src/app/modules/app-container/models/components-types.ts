export interface MainSelectorOption {
    isOpen: boolean;
    value: string;
    children: MainSelectorOption[];
    navigationUrl?: string;
    bgColorRGB?: string;
}

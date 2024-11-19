import { Pipe, PipeTransform } from '@angular/core';

const specificKeys = { Space: 'space', ArrowRight: '→', ArrowLeft: '←', ArrowDown: '↓', ArrowUp: '↑' } as const;

type SpecificKeyCode = keyof typeof specificKeys;

@Pipe({
    name: 'prettifyCtrlKey'
})
export class PrettifyControlKeyPipe implements PipeTransform {
    public transform(friendly: string, keyCode: string): string {
        if (this.isSpecificKey(keyCode)) {
            return this.handleSpecficKey(keyCode);
        }

        return friendly.toLowerCase();
    }

    private isSpecificKey(keyCode: string): keyCode is SpecificKeyCode {
        return keyCode in specificKeys;
    }

    private handleSpecficKey(keyCode: SpecificKeyCode): string {
        return specificKeys[keyCode];
    }
}

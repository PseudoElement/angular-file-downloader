import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'shortifyText'
})
export class ShortifyTextPipe implements PipeTransform {
    transform(text: string, maxLenght: number = 100): string {
        return text.length < maxLenght ? text : `${text.slice(0, maxLenght)}...`;
    }
}

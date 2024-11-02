import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatMs'
})
export class FormatMillisecsPipe implements PipeTransform {
    transform(ms: number): string {
        var minutes = Math.floor(ms / 60000);
        var seconds = ((ms % 60000) / 1000).toFixed(0);

        return `${minutes}:${+seconds < 10 ? `0${seconds}` : seconds}`;
    }
}

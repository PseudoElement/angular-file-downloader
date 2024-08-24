import { Component, Input } from '@angular/core';
import { ButtonType } from 'src/app/shared/models/buttons';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss'
})
export class ButtonComponent {
    @Input({ required: true }) text!: string;

    @Input() type: ButtonType = 'raised';
}

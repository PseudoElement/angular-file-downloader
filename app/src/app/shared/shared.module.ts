import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputComponent } from './components/input/input.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorMappingPipe } from './pipes/error-mapping.pipe';
import { SelectComponent } from './components/select/select.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgLetDirective } from './directives/ng-let.directive';
import { ArrowDownButtonComponent } from './components/icons/arrow-down-button/arrow-down-button.component';
import { DeleteButtonComponent } from './components/buttons/delete-button/delete-button.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonComponent } from './components/buttons/button/button.component';
import { PerspectOnHoverDirective } from './directives/perspect-on-hover.directive';
import { AnimatedButtonComponent } from './components/buttons/animated-button/animated-button.component';
import { ArrowDownLongComponent } from './components/icons/arrow-down-long/arrow-down-long.component';
import { ModalComponent } from './components/modal/modal.component';
import { ExternalAppInfoComponent } from './components/external-app-info/external-app-info.component';
import { ShortifyTextPipe } from './pipes/shortify-text.pipe';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { GameMenuComponent } from './components/game-menu/game-menu.component';
import { GameMenuButtonComponent } from './components/game-menu-button/game-menu-button.component';
import { FormatMillisecsPipe } from './pipes/format-timestamp.pipe';
import { TimerComponent } from './components/timer/timer.component';
import { GameInfoElementComponent } from './components/game-info-element/game-info-element.component';

@NgModule({
    exports: [
        InputComponent,
        CheckboxComponent,
        SelectComponent,
        NgLetDirective,
        ArrowDownButtonComponent,
        DeleteButtonComponent,
        ButtonComponent,
        PerspectOnHoverDirective,
        AnimatedButtonComponent,
        ArrowDownLongComponent,
        ModalComponent,
        ExternalAppInfoComponent,
        ShortifyTextPipe,
        DatePickerComponent,
        GameMenuComponent,
        GameMenuButtonComponent,
        FormatMillisecsPipe,
        TimerComponent,
        GameInfoElementComponent
    ],
    declarations: [
        InputComponent,
        CheckboxComponent,
        SelectComponent,
        ErrorMappingPipe,
        NgLetDirective,
        ArrowDownButtonComponent,
        DeleteButtonComponent,
        ButtonComponent,
        PerspectOnHoverDirective,
        AnimatedButtonComponent,
        ArrowDownLongComponent,
        ModalComponent,
        ExternalAppInfoComponent,
        ShortifyTextPipe,
        DatePickerComponent,
        GameMenuComponent,
        GameMenuButtonComponent,
        FormatMillisecsPipe,
        TimerComponent,
        GameInfoElementComponent
    ],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [provideNativeDateAdapter()]
})
export class SharedModule {}

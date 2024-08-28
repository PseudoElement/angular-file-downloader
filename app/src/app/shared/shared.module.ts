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
import { DownloadButtonComponent } from './components/buttons/download-button/download-button.component';
import { ArrowDownLongComponent } from './components/icons/arrow-down-long/arrow-down-long.component';

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
        DownloadButtonComponent,
        ArrowDownLongComponent
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
        DownloadButtonComponent,
        ArrowDownLongComponent
    ],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        FormsModule
    ]
})
export class SharedModule {}

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
import { ArrowDownButtonComponent } from './components/buttons/arrow-down-button/arrow-down-button.component';
import { DeleteButtonComponent } from './components/buttons/delete-button/delete-button.component';

@NgModule({
    exports: [InputComponent, CheckboxComponent, SelectComponent, NgLetDirective, ArrowDownButtonComponent, DeleteButtonComponent],
    declarations: [
        InputComponent,
        CheckboxComponent,
        SelectComponent,
        ErrorMappingPipe,
        NgLetDirective,
        ArrowDownButtonComponent,
        DeleteButtonComponent
    ],
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, ReactiveFormsModule, FormsModule]
})
export class SharedModule {}

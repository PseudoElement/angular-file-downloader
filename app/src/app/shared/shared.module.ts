import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputComponent } from './components/input/input.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorMappingPipe } from './pipes/error-mapping.pipe';

@NgModule({
    exports: [InputComponent, CheckboxComponent],
    declarations: [InputComponent, CheckboxComponent, ErrorMappingPipe],
    imports: [CommonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule]
})
export class SharedModule {}

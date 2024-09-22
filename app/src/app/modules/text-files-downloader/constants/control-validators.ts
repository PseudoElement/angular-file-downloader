import { Validators } from '@angular/forms';

export const MIN_CTRL_VALIDATORS = [Validators.required, Validators.max(10), Validators.min(1)];
export const MAX_CTRL_VALIDATORS = [Validators.required, Validators.max(30), Validators.min(11)];
export const NULL_VALUE_PERCENT_VALIDATORS = [Validators.required, Validators.max(100), Validators.min(0)];

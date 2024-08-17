import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface ILetContext<T> {
    ngLet: T | null;
}

@Directive({
    selector: '[ngLet]'
})
export class NgLetDirective<T> {
    private context: ILetContext<T> = { ngLet: null };

    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<ILetContext<T>>) {
        viewContainer.createEmbeddedView(templateRef, this.context);
    }

    @Input()
    set ngLet(value: T) {
        this.context.ngLet = value;
    }
}

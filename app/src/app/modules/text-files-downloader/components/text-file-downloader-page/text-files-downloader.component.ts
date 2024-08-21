import { Component } from '@angular/core';
import { FileBuilderService } from '../../services/file-builder.service';
import { DocumentType, FileBuilderForm, SqlColumnControl, TextColumnControl } from '../../models/file-builder-types';
import { FormControl, FormGroup } from '@angular/forms';
import { DOCUMENT_TYPE_OPTIONS } from '../../constants/document-type-options';

@Component({
    selector: 'app-text-files-downloader-page',
    templateUrl: './text-files-downloader.component.html',
    styleUrl: './text-files-downloader.component.scss'
})
export class TextFilesDownloaderPageComponent {
    public readonly docTypeOptions = DOCUMENT_TYPE_OPTIONS;

    public readonly isSqlDocType$ = this.fileBuilderSrv.isSqlDocType$;

    constructor(private readonly fileBuilderSrv: FileBuilderService) {}

    public get form(): FormGroup<FileBuilderForm> {
        return this.fileBuilderSrv.fileBuilderForm;
    }

    ngOnInit(): void {
        this.fileBuilderSrv.addNewColumn();
        this.fileBuilderSrv.addNewColumn();
    }

    public get columnsControls(): FormGroup<TextColumnControl | SqlColumnControl>[] {
        return this.fileBuilderSrv.columnsFormArrayControls;
    }

    public get docTypeControl(): FormControl<DocumentType> {
        return this.fileBuilderSrv.docTypeControl;
    }

    public get docNameControl(): FormControl<string> {
        return this.fileBuilderSrv.docNameControl;
    }

    public get needCreateSqlTableControl(): FormControl<boolean> | undefined {
        return this.fileBuilderSrv.needCreateSqlTableControl;
    }

    public deleteColumn(index: number): void {
        this.fileBuilderSrv.deleteColumn(index);
    }
}

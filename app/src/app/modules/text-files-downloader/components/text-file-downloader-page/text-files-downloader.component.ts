import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FileBuilderService } from '../../services/file-builder.service';
import { DocumentType, FileBuilderForm, SqlColumnControl, TextColumnControl } from '../../models/file-builder-types';
import { FormControl, FormGroup } from '@angular/forms';
import { DOCUMENT_TYPE_OPTIONS } from '../../constants/document-type-options';
import { animate, style, transition, trigger } from '@angular/animations';
import { DownloadService } from '../../services/download.service';

@Component({
    selector: 'app-text-files-downloader-page',
    templateUrl: './text-files-downloader.component.html',
    styleUrl: './text-files-downloader.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('opacityAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.0)' }),
                animate('200ms', style({ opacity: 1, transform: 'scale(1.0)' }))
            ]),
            transition(':leave', [
                style({ opacity: 1, transform: 'scale(1.0)' }),
                animate('200ms', style({ opacity: 0, transform: 'scale(0.0)' }))
            ])
        ])
    ]
})
export class TextFilesDownloaderPageComponent {
    public readonly docTypeOptions = DOCUMENT_TYPE_OPTIONS;

    public readonly isSqlDocType$ = this.fileBuilderSrv.isSqlDocType$;

    public readonly isDownloading$ = this.downloadSrv.isDownloading$;

    public get form(): FormGroup<FileBuilderForm> {
        return this.fileBuilderSrv.fileBuilderForm;
    }

    constructor(
        private readonly fileBuilderSrv: FileBuilderService,
        private readonly downloadSrv: DownloadService,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        if (this.fileBuilderSrv.needAddDefaultColumns) {
            this.fileBuilderSrv.addNewColumn();
            this.fileBuilderSrv.addNewColumn();
            this.fileBuilderSrv.disableAddingDefaultColumns();
        }
    }

    public get columnsControls(): FormGroup<TextColumnControl | SqlColumnControl>[] {
        return this.fileBuilderSrv.columnsFormArray.controls;
    }

    public get docTypeControl(): FormControl<DocumentType> {
        return this.fileBuilderSrv.docTypeControl;
    }

    public get docNameControl(): FormControl<string> {
        return this.fileBuilderSrv.docNameControl;
    }

    public get rowsCountControl(): FormControl<string> {
        return this.fileBuilderSrv.rowsCountControl;
    }

    public get tableNameControl(): FormControl<string> | undefined {
        return this.fileBuilderSrv.tableNameControl;
    }

    public get needCreateSqlTableControl(): FormControl<boolean> | undefined {
        return this.fileBuilderSrv.needCreateSqlTableControl;
    }

    public addColumn(): void {
        this.fileBuilderSrv.addNewColumn();
    }

    public deleteColumn(index: number): void {
        this.fileBuilderSrv.deleteColumn(index);
    }

    public async downloadFile(): Promise<void> {
        await this.downloadSrv.downloadTxtFile(this.form, this.fileBuilderSrv.isSqlDocType);
        this.cdr.markForCheck();
    }
}

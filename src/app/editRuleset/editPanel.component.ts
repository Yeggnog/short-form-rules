import { Component, ElementRef, EventEmitter, ViewChild, Input, Output } from "@angular/core";
import { blockData, documentMeta } from "./editorTypes";
import { TextEditorFill } from "./editPanelFills/textEditorFill.component";
import { TableEditorFill } from "./editPanelFills/tableEditorFill.component";
import { DiceTableEditorFill } from "./editPanelFills/diceTableEditorFill.component";
import { MetadataEditorFill } from "./editPanelFills/metadataEditorFill.component";

@Component({
    selector: 'edit-panel',
    standalone: true,
    imports: [TextEditorFill, TableEditorFill, DiceTableEditorFill, MetadataEditorFill],
    template: `
    <div [class]="getPanelClass()">
    <div id="rsEditPanelSlider">
        <div class="flex-row">
            @if(!editingMetadata){
                <button class="unfilled margin-s" (click)="onDelete()"><img class="icon" src="delete_icon_blue.svg"> Delete</button>
            }
            <button #StartButton class="unfilled margin-s" (click)="onCancel()"><img class="icon" src="close_icon_blue.svg"> Cancel</button>
            <button class="unfilled margin-s" (click)="onSubmit()"><img class="icon" src="check_icon_blue.svg"> Save</button>
        </div>

        @if(editingMetadata){
            <metadata-edit-fill #EditorFill [metadata]="metaData" (dataChanged)="onMetaChange($event)" />
        }
        @else{
            @switch(blockData.blockType){
                @case("table"){
                    <table-edit-fill #EditorFill [blockData]="blockData" (dataChanged)="onDataChange($event)" />
                }
                @case("diceTable"){
                    <dice-table-edit-fill #EditorFill [blockData]="blockData" (dataChanged)="onDataChange($event)" />
                }
                @default{
                    <text-edit-fill #EditorFill [blockData]="blockData" (dataChanged)="onDataChange($event)" />
                }
            }
        }
    </div>
    </div>
    `,
    styleUrl: './rulesetEditor.css'
})
export class EditPanel {
    @Input() editorVisible = false;
    @Input() editingMetadata = false;
    @Input() blockData: blockData = {} as blockData;
    @Input() metaData: documentMeta = {} as documentMeta;
    @Output() submitChanges = new EventEmitter<blockData>();
    @Output() submitMeta = new EventEmitter<documentMeta>();
    @Output() deleteBlock = new EventEmitter();
    @Output() editorVisibleChange = new EventEmitter<boolean>();
    @ViewChild('EditorFill') editorFill!: TextEditorFill | TableEditorFill | DiceTableEditorFill | MetadataEditorFill;
    @ViewChild('StartButton', {static: false}) startButton!: ElementRef;

    onDelete(){
        this.deleteBlock.emit();
    }

    onCancel(){
        this.editorVisibleChange.emit(this.editorVisible);
    }

    onSubmit(){
        if(this.editingMetadata){
            this.submitMeta.emit(this.metaData);
        }else{
            // if hidden data still exists in a dice table, then delete it to save on storage
            if(this.blockData.blockType == "diceTable" && this.blockData.tableContents.length > (this.blockData.diceType + 1)){
                this.blockData.tableContents.length = (this.blockData.diceType + 1);
            }

            this.submitChanges.emit(this.blockData);
        }

        this.editorVisibleChange.emit(this.editorVisible);
    }

    // accept incoming changes from editor fill components
    onDataChange(data: blockData){
        this.blockData = data;
    }
    onMetaChange(data: documentMeta){
        this.metaData = data;
    }

    // updates editor fill state to match global state on reopening the panel
    onPanelOpen(data: blockData, meta: documentMeta){
        this.blockData = data;
        if(this.editingMetadata){
            this.editorFill.updateMeta(meta);
        }else{
            this.editorFill.updateData(data);
        }

        setTimeout(() => {
            this.startButton.nativeElement.focus();
        }, 1);
    }

    getPanelClass(){
        return (this.editorVisible) ? "rsEditPanel" : "rsEditPanelClosed";
    }
}
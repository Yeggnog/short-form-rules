import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { blockData, documentMeta } from "../editorTypes";

@Component({
    selector: 'text-edit-fill',
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="flex-row">
            <button class="unfilled flex black" (click)="pasteIntoText('h1')">H1</button>
            <button class="unfilled flex black" (click)="pasteIntoText('h2')">H2</button>
            <button class="unfilled flex black" (click)="pasteIntoText('h3')">H3</button>
            <button class="unfilled flex black" (click)="pasteIntoText('h4')">H4</button>
            <button class="unfilled flex black" (click)="pasteIntoText('kw')">Kw</button>
        </div>

        <label for="textEditor" class="sr-only">Block Content:</label><br>
        <textarea name="textEditor" #textEditor class="rsTextEdit textInput" maxLength=1200 (change)="onTextChange($event)" [(ngModel)]="blockText" [value]="blockData['contents']"></textarea><br>

        <input type="checkbox" name="blockQuoteToggle" value="true" [(ngModel)]="blockQuoteChecked" (click)="onBQSelectionChange($event)">
        <label for="blockQuoteToggle"> Blockquote</label>
    `,
    styleUrl: '../rulesetEditor.css'
})
export class TextEditorFill{
    @Input() blockData = {} as blockData;
    @Output() dataChanged = new EventEmitter<blockData>();
    @ViewChild('textEditor', {static: false}) textEditElement!: ElementRef;

    blockText = "";
    blockQuoteChecked = false;

    ngOnChanges(){
        this.blockText = this.blockData.contents;
        this.blockQuoteChecked = this.blockData.isBlockQuote;
    }

    updateData(data: blockData){
        this.blockData = data;
    }
    updateMeta(meta: documentMeta){} // Needs to be defined, but not useful for this fill

    onTextChange(event: any){
        this.submitChanges();
    }

    onBQSelectionChange(event: any){
        this.blockQuoteChecked = event.target.checked;
        this.submitChanges();
    }

    pasteIntoText(type: string){
        // Determine wrapper to paste
        var wrapper = ["", ""];
        switch(type){
            case "h1": wrapper = ["# ", ""]; break;
            case "h2": wrapper = ["## ", ""]; break;
            case "h3": wrapper = ["### ", ""]; break;
            case "h4": wrapper = ["#### ", ""]; break;
            case "kw": wrapper = ["**", "**"]; break;
        }

        const textEditor = this.textEditElement.nativeElement as HTMLTextAreaElement;

        // Paste the wrapper around the edit range
        var preSpliceText = this.blockText.slice(0, textEditor.selectionStart);
        var spliceText = this.blockText.slice(textEditor.selectionStart, textEditor.selectionEnd);
        var postSpliceText = this.blockText.slice(textEditor.selectionEnd);
        this.blockText = (preSpliceText + wrapper[0] + spliceText + wrapper[1] + postSpliceText);

        // refocus the text area at the proper position
        textEditor.focus();
        setTimeout(()=>{
            textEditor.setSelectionRange(textEditor.selectionStart + wrapper[0].length, textEditor.selectionEnd + wrapper[0].length);
        }, 1);

        this.submitChanges();
    }

    // send the updates back to the editor component
    submitChanges(){
        var newBlockData = {
            contents: this.blockText,
            isBlockQuote: this.blockQuoteChecked,

            blockId: this.blockData.blockId,
            blockType: this.blockData.blockType,
            tableContents: this.blockData.tableContents,
            diceType: this.blockData.diceType
        };

        this.dataChanged.emit(newBlockData);
    }
};
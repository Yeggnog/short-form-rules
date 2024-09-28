import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { blockData, documentMeta } from "../editorTypes";
import { ParseHtmlPipe } from "../../../htmlsanitize";

@Component({
    selector: 'table-edit-fill',
    standalone: true,
    imports: [FormsModule, ParseHtmlPipe],
    template: `
        <div class="flex-row">
            <button class="unfilled flex black" (click)="addRowCol('addColBefore')"><img class="icon" src="add_col_before_icon.svg" alt="Add column before"></button>
            <button class="unfilled flex black" (click)="addRowCol('addColAfter')"><img class="icon" src="add_col_after_icon.svg" alt="Add column after"></button>
            <button class="unfilled flex black" (click)="addRowCol('addRowBefore')"><img class="icon" src="add_row_before_icon.svg" alt="Add row before"></button>
            <button class="unfilled flex black" (click)="addRowCol('addRowAfter')"><img class="icon" src="add_row_after_icon.svg" alt="Add row after"></button>
            <button class="unfilled flex black" (click)="deleteRowCol('deleteCol')"><img class="icon" src="delete_col_icon.svg" alt="Delete column"></button>
            <button class="unfilled flex black" (click)="deleteRowCol('deleteRow')"><img class="icon" src="delete_row_icon.svg" alt="Delete row"></button>
        </div>

        <label for="cellText" class="sr-only">Cell Content:</label><br>
        <div class="flex-row">
        <input type="text" name="cellText" #cellEditor class="textInput squared" (change)="onCellTextChange($event)"  [(ngModel)]="cellContents" />
        <button class="fill-black squared" (click)="onCellTextChange(cellContents)"><img class="icon" src="check_icon.svg" alt="Confirm"></button>
        </div><br>

        <div class="tableFrame">
        <table class="table-flex">
            @for(row of tableContents; track $index; let isHeader = $first, tableRow = $index){
                <tr>
                @for(cell of row; track $index; let tableCol = $index){
                    @if(isHeader){
                        <th [class]="getSelectionClass(tableRow, tableCol)">
                            <a href='#' (click)="onCellSelectAccessible(tableRow, tableCol)">
                                @if(tableContents[tableRow][tableCol] != ''){
                                    {{ tableContents[tableRow][tableCol] }}
                                }@else{ <span class="hidden">Empty<span class="sr-only"> Cell</span></span> }
                            </a>
                        </th>
                    }
                    @else{
                        <td [class]="getSelectionClass(tableRow, tableCol)">
                            <a href='#' (click)="onCellSelectAccessible(tableRow, tableCol)">
                                @if(tableContents[tableRow][tableCol] != ''){
                                    {{ tableContents[tableRow][tableCol] }}
                                }@else{ <span class="hidden">Empty<span class="sr-only"> Cell</span></span> }
                            </a>
                        </td>
                    }
                }
                </tr>
            }
        </table>
        </div>
    `,
    styleUrl: '../rulesetEditor.css'
})
export class TableEditorFill{
    @Input() blockData = {} as blockData;
    @Output() dataChanged = new EventEmitter<blockData>();
    @ViewChild('cellEditor', {static: false}) cellEditElement!: ElementRef;

    tableContents = [] as string[][];
    selection = [0, 0];
    cellContents = "";

    ngOnChanges(){
        this.tableContents = [] as string[][];

        // deep-copy the table to prevent edits leaking into the source state
        for(let row=0; row<this.blockData.tableContents.length; row++){
            this.tableContents.push([]);

            for(let col=0; col<this.blockData.tableContents[row].length; col++){
                this.tableContents[row].push( this.blockData.tableContents[row][col] );
            }
        }
    }

    updateData(data: blockData){
        this.blockData = data;
    }
    updateMeta(meta: documentMeta){} // Needs to be defined, but not useful for this fill

    onCellSelect(row: number, col: number){
        this.selection = [row, col];
        this.cellContents = this.tableContents[row][col];
        this.cellEditElement.nativeElement.focus();
    }
    onCellSelectAccessible(row: number, col: number){
        this.onCellSelect(row, col);
        return false; // tell the site not to navigate to the link
    }

    onCellTextChange(event: any){
        this.tableContents[this.selection[0]][this.selection[1]] = this.cellContents;

        this.submitChanges();
    }

    addRowCol(command: string){
        // Determine what to place and where to place it
        var insertPosition = 0;
        var type = "col";
        switch(command){
            case "addColBefore":
                insertPosition = this.selection[1];
            break;
            case "addColAfter":
                insertPosition = this.selection[1] + 1;
            break;
            case "addRowBefore":
                type = "row";
                insertPosition = this.selection[0];
            break;
            case "addRowAfter":
                type = "row";
                insertPosition = this.selection[0] + 1;
            break;
        }

        // Place the new row / column
        if(type == "row"){
            // splice in a new row at the right size
            var rowLen = 3;
            if(this.tableContents.length > 0){
                rowLen = this.tableContents[0].length;
            }
            this.tableContents.splice(insertPosition, 0, new Array(rowLen) as string[]);
        }else{
            // splice a blank cell into every row
            for(let rowId=0; rowId<this.tableContents.length; rowId++){
                this.tableContents[rowId].splice(insertPosition, 0, "");
            }
        }

        this.submitChanges();
    }

    deleteRowCol(command: string){
        var deletePosition = 0;
        var type = "col";
        switch(command){
            case "deleteCol":
                deletePosition = this.selection[1];
            break;
            case "deleteRow":
                type = "row";
                deletePosition = this.selection[0];
            break;
        }

        // Delete the current row / column
        if(type == "row"){
            // delete an entire row
            this.tableContents.splice(deletePosition, 1);
        }else{
            // delete a cell from every row
            for(let rowId=0; rowId<this.tableContents.length; rowId++){
                this.tableContents[rowId].splice(deletePosition, 1);
            }
        }

        // clear the selection if the table dimensions are too small
        if(this.tableContents.length <= 0){
            this.selection = [0, 0];
        }else if(this.tableContents[0].length <= 0){
            this.selection = [0, 0];
        }

        this.submitChanges();
    }

    getSelectionClass(tableRow: number, tableCol: number){
        return (tableRow == this.selection[0] && tableCol == this.selection[1]) ? "tdSelected" : "";
    }

    // send the updates back to the editor component
    submitChanges(){
        var newBlockData = {
            tableContents: this.tableContents,

            blockId: this.blockData.blockId,
            blockType: this.blockData.blockType,
            contents: this.blockData.contents,
            isBlockQuote: this.blockData.isBlockQuote,
            diceType: this.blockData.diceType
        };

        this.dataChanged.emit(newBlockData);
    }
};
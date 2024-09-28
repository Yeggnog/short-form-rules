import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { blockData, documentMeta } from "../editorTypes";
import { ParseHtmlPipe } from "../../../htmlsanitize";

@Component({
    selector: 'dice-table-edit-fill',
    standalone: true,
    imports: [FormsModule, ParseHtmlPipe],
    template: `
        <div class="flex-row">
            <button class="unfilled flex black" (click)="addCol('addColBefore')"><img class="icon" src="add_col_before_icon.svg" alt="Add column before"></button>
            <button class="unfilled flex black" (click)="addCol('addColAfter')"><img class="icon" src="add_col_after_icon.svg" alt="Add column after"></button>
            <button class="unfilled flex black" (click)="deleteCol()"><img class="icon" src="delete_col_icon.svg" alt="Delete column"></button>
        </div>

        <label for="diceType">Dice Type:</label><br>
        <select name="diceType" class="selectInput" (change)="onDiceTypeChange($event)">
            @for(diceOption of diceOptions; track $index){
                @if(diceOption == diceType){
                    <option [value]="diceOption" selected>1d{{ diceOption }}</option>
                }
                @else{
                    <option [value]="diceOption">1d{{ diceOption }}</option>
                }
            }
        </select><br>

        <label for="cellText" class="sr-only">Cell Content:</label><br>
        <div class="flex-row">
        <input type="text" name="cellText" #cellEditor class="textInput squared" (change)="onCellTextChange($event)"  [(ngModel)]="cellContents" />
        <button class="fill-black squared" (click)="onCellTextChange(cellContents)"><img class="icon" src="check_icon.svg" alt="Confirm"></button>
        </div><br>

        <div class="tableFrame">
        <table class="table-flex">
            @for(row of tableContents; track $index; let isHeader = $first, tableRow = $index){
                @if(tableRow < diceType + 1){
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
            }
        </table>
        </div>
    `,
    styleUrl: '../rulesetEditor.css'
})
export class DiceTableEditorFill{
    @Input() blockData = {} as blockData;
    @Output() dataChanged = new EventEmitter<blockData>();
    @ViewChild('cellEditor', {static: false}) cellEditElement!: ElementRef;

    diceOptions = [ 4, 6, 8, 10, 12, 20, 100 ];

    tableContents = [] as string[][];
    selection = [0, 0];
    cellContents = "";
    diceType = 4;
    maxTableLength = 0;

    ngOnChanges(){
        this.diceType = this.blockData.diceType;
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
    updateMeta(meta: documentMeta){} // needs to be defined, but not useful for this fill

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

    onDiceTypeChange(event: any){
        this.diceType = parseInt(event.target.value);

        // reassign the table rows to match
        let targetLength = this.diceType + 1;
        if(targetLength > this.tableContents.length){
            // add rows
            var rowLen = 3;
            if(this.tableContents.length > 0){
                rowLen = this.tableContents[0].length;
            }

            const currentLength = this.tableContents.length;
            for(let i=0; i<(targetLength - currentLength); i++){
                this.tableContents.push(new Array(rowLen));
            }
        }

        // rewrite the leftmost column to reflect the new dice type
        for(let row=0; row<this.tableContents.length; row++){
            if(row == 0){
                // dice type indicator
                this.tableContents[row][0] = ("1d" + this.diceType);
            }else{
                // dice value
                this.tableContents[row][0] = row.toString();
            }
        }

        this.submitChanges();
    }

    addCol(command: string){
        // Determine what to place and where to place it
        var insertPosition = 0;
        switch(command){
            case "addColBefore":
                insertPosition = this.selection[1];
            break;
            case "addColAfter":
                insertPosition = this.selection[1] + 1;
            break;
        }

        // splice a blank cell into every row
        for(let rowId=0; rowId<this.tableContents.length; rowId++){
            this.tableContents[rowId].splice(insertPosition, 0, "");
        }

        this.submitChanges();
    }

    deleteCol(){
        // delete a cell from every row
        for(let rowId=0; rowId<this.tableContents.length; rowId++){
            this.tableContents[rowId].splice(this.selection[1], 1);
        }

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
            diceType: this.diceType,

            blockId: this.blockData.blockId,
            blockType: this.blockData.blockType,
            contents: this.blockData.contents,
            isBlockQuote: this.blockData.isBlockQuote
        };

        this.dataChanged.emit(newBlockData);
    }
};
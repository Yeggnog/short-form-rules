import { Component, Input } from "@angular/core";
import { blockData } from "./editorTypes";
import { ParseHtmlPipe, ParseMDPipe } from "../../htmlsanitize";

@Component({
    selector: 'rs-block',
    standalone: true,
    imports: [ParseHtmlPipe, ParseMDPipe],
    template: `
        @if(blockData['blockType'] == "table" || blockData['blockType'] == "diceTable"){
            <p [innerHtml]="printTableContents(blockData['tableContents']) | parseExistingHtml"></p>
        }
        @else{
            @if(blockData['contents'] != ""){
                <p [class]="getBlockClass()" [innerHtml]="blockData['contents'] | parseToHtml"></p>
            }
            @else{
                <p [class]="getBlockClass()">Write some text here</p>
            }
        }
    `,
    styleUrl: './rulesetEditor.css'
})
export class RulesetBlock{
    @Input() blockData: blockData = {} as blockData;
    @Input() onSelected = (block: blockData) => {}
    @Input() selectedBlockId = "";

    printTableContents(tableContents: string[][]): string{
        var printedResult = `<table class=${this.getBlockClass()}>`;

        for(let row=0; row<tableContents.length; row++){
            if(!(this.blockData.blockType == "diceTable" && row >= (this.blockData.diceType + 1))){
                printedResult += `<tr>`;
                for(let col=0; col<tableContents[row].length; col++){
                    if(row == 0){
                        printedResult += `<th> ${tableContents[row][col]} </th>`;
                    }else{
                        printedResult += `<td> ${tableContents[row][col]} </td>`;
                    }
                }
                printedResult += "</tr>";
            }
        }
        printedResult += "</table>";

        return printedResult;
    }

    getBlockClass(): string{
        switch(this.blockData.blockType){
            case "text":
                if(this.blockData.isBlockQuote){
                    return "rsBlockQuoteBlock";
                }else{
                    return "rsTextBlock";
                }
            case "table": return "rsTableBlock";
            case "diceTable": return "rsDiceTableBlock";
        }
        return "";
    }
};
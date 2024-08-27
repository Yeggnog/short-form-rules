import { Component, Input } from '@angular/core';
import { RulesetCard } from './rulesetcard.component';

const cardsPerPage = 3; // arbitrarily shortened due to a small pool of test content

@Component({
    selector: 'ruleset-card-container',
    standalone: true,
    imports: [RulesetCard],
    template: `
    <div class="rsCardContainer">
        @for(header of headerData; track header['id']){
            @if($index >= (currentPage * cardsPerPage) && $index < ((currentPage + 1) * cardsPerPage)){
                <ruleset-card [uuid]="header['id']" [title]="header['title']" [author]="header['author']" [system]="header['system']" [type]="header['type']" [color]="header['color']" />
            }
        }
    </div>
    <div class="flex-row centerContents">
        <button class="filled margin-s" (click)="prevPage()">Previous</button>
        <span class="centered margin-s">{{ currentPage + 1 }} of {{ getMaxPage() }}</span>
        <button class="filled margin-s" (click)="nextPage()">Next</button>
    </div>
    `,
    styleUrl: '../rulesetoverview.component.css'
})
export class RulesetCardContainer {
    @Input() headerData: Record<string,string>[] = [];
    currentPage = 0;
    cardsPerPage = cardsPerPage;

    nextPage(){
        // advance forward and loop back if on the last page
        if((this.currentPage * cardsPerPage) + cardsPerPage < this.headerData.length){
            this.currentPage += 1;
        }else{
            this.currentPage = 0;
        }
    }

    prevPage(){
        // go back and loop to the end if on the first page
        if(this.currentPage == 0){
            this.currentPage = this.getMaxPage();
        }else{
            this.currentPage -= 1;
        }
    }

    getMaxPage(){
        return Math.ceil(this.headerData.length / cardsPerPage);
    }
}
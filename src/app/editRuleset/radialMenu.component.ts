import { Component, EventEmitter, ElementRef, ViewChild, Input, Output } from "@angular/core";

@Component({
    selector: 'radial-menu',
    standalone: true,
    imports: [],
    template: `
        <div [class]="getMenuClass()">
            <div class="radial-spacer"></div>
            <button #StartButton class="radialBtn" (click)="onSelected('text')"><img class="icon-fill" src="text_icon.svg" alt="Text block"></button>
            <div class="radial-spacer"></div>
            <button class="radialBtn" (click)="onSelected('table')"><img class="icon-fill" src="table_icon.svg" alt="Table"></button>
            <div class="radial-center"><img class="icon-fill" src="add_icon_blue.svg"></div>
            <button class="radialBtn" (click)="onSelected('blockText')"><img class="icon-fill" src="blockquote_icon.svg" alt="Block quote"></button>
            <div class="radial-spacer"></div>
            <button class="radialBtn" (click)="onSelected('diceTable')"><img class="icon-fill" src="dice_icon.svg" alt="Dice table"></button>
            <div class="radial-spacer"></div>
        </div>
    `,
    styleUrl: './radialMenu.component.css'
})
export class RadialMenu{
    @Output() selectOption = new EventEmitter<string>();
    @Input() menuVisible = false;
    @ViewChild('StartButton', {static: false}) startButton!: ElementRef;

    ngOnChanges(){
        if(this.menuVisible){
            setTimeout(() => {
                this.startButton.nativeElement.focus();
            }, 1);
        }
    }

    onSelected(type: string){
        this.selectOption.emit(type);
    }

    getMenuClass(){
        return (this.menuVisible) ? "rsRadialMenu" : "rsRadialMenuClosed";
    }
};
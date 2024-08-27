import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'confirm-modal',
    standalone: true,
    template: `
        <dialog #confirmModal class="profileModal" (click)="dismissModal($event)">
            <h2>{{ headlineText }}</h2>
            <p>{{ bodyText }}</p>
            <div class="flex-row">
                @if(dangerous){
                    <button class="err margin-s" (click)="confirm()"><img class="icon" src="delete_icon_red.svg"> {{ confirmText }}</button>
                    <button class="unfilled margin-s" (click)="decline()"><img class="icon" src="close_icon_blue.svg"> {{ declineText }}</button>
                }
                @else{
                    <button class="unfilled margin-s" (click)="confirm()"><img class="icon" src="check_icon_blue.svg"> {{ confirmText }}</button>
                    <button class="unfilled margin-s" (click)="decline()"><img class="icon" src="close_icon_blue.svg"> {{ declineText }}</button>
                }
            </div>
        </dialog>
    `,
    styleUrl: './profileStyles.css'
})
export class ConfirmModal {
    @Input() openEvent!: EventEmitter<boolean>;
    @Output() response = new EventEmitter<boolean>();

    @Input() headlineText = "Confirm?";
    @Input() bodyText = "Do you want to proceed with this action?";
    @Input() confirmText = "Yes, proceed";
    @Input() declineText = "No, cancel";
    @Input() dangerous = false; // highlights the yes option in red for important actions

    @ViewChild('confirmModal') modal!: ElementRef;

    ngOnInit(){
        this.openEvent.subscribe((event) => {
            if(!this.modal.nativeElement.open){
                this.modal.nativeElement.showModal();
            }
        });
    }
    dismissModal(event: any){
        if(event.target == this.modal.nativeElement){
            this.modal.nativeElement.close();
        }
    }

    confirm(){
        this.response.emit(true);
        this.modal.nativeElement.close();
    }
    decline(){
        this.response.emit(false);
        this.modal.nativeElement.close();
    }
}
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { logoutUser } from '../authhandler';

@Component({
    selector: 'profile-modal',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    template: `
        <dialog #profileModal class="profileModal" (click)="dismissModal($event)">
            <h2>{{ username }}</h2>
            <h3 class=centerContent><a routerLink="/profile" routerLinkActive="true" class="headerFont">Profile</a> <img class="icon" src="chevron_right_icon_dark.svg"></h3>
            <button class="filled" (click)="logout()">Log Out</button>
        </dialog>
    `,
    styleUrl: './profileStyles.css'
})
export class ProfileModal {
    constructor(private router:Router) { }
    @Input() openEvent!: EventEmitter<boolean>;
    @Output() logoutEvent = new EventEmitter<boolean>();
    @ViewChild('profileModal') modal!: ElementRef;
    username = "";

    ngOnInit(){
        if(sessionStorage['username']){
            this.username = sessionStorage['username'];
        }

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

    logout(){
        logoutUser((successful: boolean) => {
            if(successful){
                this.logoutEvent.emit(true);
                this.modal.nativeElement.close();
                
                // redirect to the home page
                this.router.navigate(['']);
            }
        });
    }
}
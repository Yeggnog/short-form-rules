import { Component, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileModal } from './profileModal.component';

@Component({
    selector: 'site-nav',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, ProfileModal],
    template: `
        <div class="site-nav flex-row centerContent">
            <a routerLink="/" routerLinkActive="true"> <img class="icon-lg" src="dice_icon.svg"> </a>
            <a routerLink="/" routerLinkActive="true"> <h1>ShortFormRules</h1> </a>
            @if(username != ""){
                <button class="profileOpen" (click)="openProfileEmitter.emit(true)" >{{ username }}</button>
            }
            @else{
                <a routerLink="/login" routerLinkActive="true"><button class="profileOpen">Log In</button> </a>
            }
        </div>
        <profile-modal [openEvent]="openProfileEmitter" (logoutEvent)="onLogout()" />
    `,
    styleUrl: './app.component.css'
})
export class SiteHeader {
    username = "";
    profileOpen = false;
    openProfileEmitter = new EventEmitter<boolean>();

    ngOnInit(){
        if(sessionStorage['username']){
            this.username = sessionStorage['username'];
        }
    }

    onLogout(){
        this.username = "";
    }
}
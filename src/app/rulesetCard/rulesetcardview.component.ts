import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RulesetCardContainer } from './rulesetcardcontainer.component';
import { fetchHeaders } from '../../datafetch';
import { SiteHeader } from '../siteHeader.component';
import { Toast, ToastManager } from '../toast.component';

@Component({
    selector: 'ruleset-card-view',
    standalone: true,
    imports: [RulesetCardContainer, SiteHeader, Toast, RouterLink, RouterLinkActive],
    template: `
    <div class="flex-col">
        <site-nav />
        @if(username != ''){
            <div class="flex-row sticky bg-black">
                <a routerLink="create" routerLinkActive="true" class="margin-s"><button class="filled"><img class="icon" src="add_icon.svg"> Create a Ruleset</button></a>
            </div>
        }

        <div class="rsCardView">
            <ruleset-card-container [headerData]="headers" />
        </div>

        @if(toastManager.toasts.length > 0){
            <toast [data]="toastManager.toasts[0]" (close)=toastManager.closeToast($event) />
        }
    </div>
    `,
    styleUrl: '../rulesetoverview.component.css'
})
export class RulesetCardView {
    headers: Record<string,string>[] = [];
    toastManager: ToastManager = new ToastManager();
    username = '';

    async ngOnInit(){
        const headers = await(fetchHeaders());
        if(headers){
            this.headers = headers;
        }else{
            this.toastManager.createToast("Failed to fetch the card data - try again later.", "error");
        }

        // check if the user is logged in
        if(sessionStorage['username'] && sessionStorage['accessToken']){
            this.username = sessionStorage['username'];
        }
    }
}

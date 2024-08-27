import { Component, EventEmitter } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SiteHeader } from "./siteHeader.component";
import { ConfirmModal } from "./confirmModal.component";
import { Toast, ToastManager } from "./toast.component";
import { RulesetCardContainer } from "./rulesetCard/rulesetcardcontainer.component";
import { documentMeta } from "./editRuleset/editorTypes";
import { fetchHeadersByUser } from "../datafetch";
import { deleteUser } from "../authhandler";

@Component({
    selector: 'profile-view',
    standalone: true,
    imports: [SiteHeader, Toast, RouterLink, RouterLinkActive, RulesetCardContainer, ConfirmModal],
    template: `
    <div class="flex-col fullscreen-v">
        <site-nav />

        <div class="rsReaderContainer">
            <div class="rsReaderPage">

            <h4>Profile: {{ username }}</h4>

            <h4>Your Rulesets</h4>
            <ruleset-card-container [headerData]="rulesetHeaders" />

            <button class="err" (click)="attemptDelete()"><img class="icon" src="delete_icon_red.svg"> Delete Account</button>

            </div>
        </div>

        @if(toastManager.toasts.length > 0){
            <toast [data]="toastManager.toasts[0]" (close)=toastManager.closeToast($event) />
        }

        <confirm-modal headlineText="Confirm Account Deletion" bodyText="Are you sure you want to delete your account?" confirmText="Yes, delete my account" declineText="No, don't delete it" [dangerous]="true" [openEvent]="openModalEmitter" (response)="delete($event)" />
    </div>
    `,
    styleUrl: './profileStyles.css'
})
export class ProfileView {
    constructor(private router:Router) { }
    toastManager = new ToastManager();
    openModalEmitter = new EventEmitter<boolean>();

    rulesetHeaders: documentMeta[] = [];
    username = "";

    ngOnInit(){
        if(sessionStorage['username']){
            this.username = sessionStorage['username'];
            this.getUserRulesets();
        }
    }

    async getUserRulesets(){
        let headers = await fetchHeadersByUser(sessionStorage.getItem('accessToken'));
        if(headers){
            this.rulesetHeaders = headers as documentMeta[];
        }
    }

    attemptDelete(){
        this.openModalEmitter.emit(true);
    }

    delete(response: boolean){
        if(response){
            // confirmed, delete the account
            deleteUser((successful: boolean) => {
                if(successful){
                    this.toastManager.createToast("Account deleted successfully, redirecting...", "normal");
                    sessionStorage.clear();
                    setTimeout(() => {
                        this.router.navigate(['']);
                    }, 2000);
                }else{
                    this.toastManager.createToast("Failed to delete the account - please try again later.", "error");
                }
            });
        }
    }
}
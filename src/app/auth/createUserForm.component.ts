import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SiteHeader } from "../siteHeader.component";
import { Toast, ToastManager } from "../toast.component";
import { evaluatePassword, evaluateNotEmpty, createUser } from '../../authhandler';

@Component({
    selector: 'create-user-form',
    standalone: true,
    imports: [SiteHeader, Toast, RouterLink, RouterLinkActive],
    template: `
    <div class="flex-col fullscreen-v">
        <site-nav />

        <a routerLink="" routerLinkActive="true" class="margin-s"><button class="unfilled"><img class="icon" src="arrow_back_icon_blue.svg"> Back</button></a>

        <div class="rsReaderContainer">
        <form id="CreateUserForm" class="rsReaderPage">
            <h4>Create an Account</h4>
        
            <label for="Username">Username</label><br>
            <input id="Username" name="username" #username [class]="usernameInputClass" type="text" (change)="evalCurrentUsername($event)" /><br>

            <label for="Email">Email</label><br>
            <input id="Email" name="email" #email [class]="emailInputClass" type="email" (change)="evalCurrentEmail($event)" /><br>

            <label for="Password">Password</label><br>
            <input id="Password" name="password" #password [class]="passwordInputClass" type="password" minlength=8 (change)="evalCurrentPassword($event)" /><br>

            @if(submitUnlocked){
                <button id="SubmitForm" class="filled" type="button" (click)="createUser()"><img class="icon" src="check_icon.svg"> Create Account</button>
            }
            @else{
                <button id="SubmitForm" class="fill-grey" type="button" disabled><img class="icon" src="check_icon.svg"> Create Account</button>
            }

            <h4>Password Strength:</h4>
            <div>
                @for(criterion of passwordCriteria; track $index){
                    @if(criterion.met){
                        <span class="centerContent right">{{ criterion.labelText }} <img class="icon" src="check_icon_blue.svg"></span>
                    }
                    @else{
                        <span class="centerContent wrong">{{ criterion.labelText }} <img class="icon" src="close_icon_red.svg"></span>
                    }
                    <br>
                }
            </div><br>

            </form>
        </div>

        @if(toastManager.toasts.length > 0){
            <toast [data]="toastManager.toasts[0]" (close)=toastManager.closeToast($event) />
        }
    </div>
    `,
    styleUrl: '../createRuleset/createFormStyles.css'
})
export class CreateUser {
    constructor(private router:Router) { }
    toastManager = new ToastManager();
    @ViewChild('username') usernameInput!: ElementRef;
    @ViewChild('email') emailInput!: ElementRef;
    @ViewChild('password') passwordInput!: ElementRef;

    usernameInputClass = "textInput";
    emailInputClass = "textInput";
    passwordInputClass = "textInput";
    passwordCriteria = [
        { labelText: "At least 8 characters", met: false },
        { labelText: "At least one number", met: false },
        { labelText: "At least one special character", met: false },
        { labelText: "At least one uppercase letter", met: false },
        { labelText: "At least one lowercase letter", met: false }
    ];
    submitUnlocked = false;

    evalCurrentPassword(event: any){
        let {valid, criteria} = evaluatePassword(event.target.value);
        this.updatePasswordDisplay(valid, criteria);
        this.unlockSubmit();
    }
    evalCurrentUsername(event: any){
        const valid = evaluateNotEmpty(event.target.value);
        this.usernameInputClass = (valid) ? "textInput" : "textInput textInput-wrong";
        this.unlockSubmit();
    }
    evalCurrentEmail(event: any){
        const valid = evaluateNotEmpty(event.target.value);
        this.emailInputClass = (valid) ? "textInput" : "textInput textInput-wrong";
        this.unlockSubmit();
    }

    unlockSubmit(){
        if(evaluatePassword(this.passwordInput.nativeElement.value).valid && evaluateNotEmpty(this.usernameInput.nativeElement.value) && evaluateNotEmpty(this.emailInput.nativeElement.value)){
            this.submitUnlocked = true;
        }else{
            this.submitUnlocked = false;
        }
    }

    updatePasswordDisplay(valid: boolean, criteria: {length: boolean, number: boolean, specialChar: boolean, uppercase: boolean, lowercase: boolean}){
        // update criteria displays
        this.passwordCriteria[0].met = criteria.length;
        this.passwordCriteria[1].met = criteria.number;
        this.passwordCriteria[2].met = criteria.specialChar;
        this.passwordCriteria[3].met = criteria.uppercase;
        this.passwordCriteria[4].met = criteria.lowercase;

        this.passwordInputClass = (valid) ? "textInput" : "textInput textInput-wrong";
    }

    async createUser(){
        let {valid, criteria} = evaluatePassword(this.passwordInput.nativeElement.value);
        if(!valid){
            this.updatePasswordDisplay(valid, criteria);
            this.toastManager.createToast("The password does not meet the requirements - please try again.", "error");
            return;
        }

        if(!evaluateNotEmpty(this.emailInput.nativeElement.value)){
            this.toastManager.createToast("Your email cannot be empty - please try again.", "error");
            return;
        }

        if(!evaluateNotEmpty(this.usernameInput.nativeElement.value)){
            this.toastManager.createToast("Your username cannot be empty - please try again.", "error");
            return;
        }

        createUser(this.usernameInput.nativeElement.value, this.passwordInput.nativeElement.value, this.emailInput.nativeElement.value, (successful: boolean) => {
            if(successful){
                this.toastManager.createToast("Account created successfully, redirecting...", "normal");
                setTimeout(()=>{
                    // add the username as a query parameter to save the user having to re-type it
                    this.router.navigateByUrl(`/confirm-account?username=${encodeURIComponent(this.usernameInput.nativeElement.value)}`);
                }, 2000);
            }else{
                // generic error toast
                this.toastManager.createToast("Account creation failed - please try again later.", "error");
            }
        });
    }
}
import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SiteHeader } from "../siteHeader.component";
import { Toast, ToastManager } from "../toast.component";
import { evaluateNotEmpty, loginUser } from '../../authhandler';
import { InvalidParameterException, UserNotConfirmedException, UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";

@Component({
    selector: 'login-form',
    standalone: true,
    imports: [SiteHeader, Toast, RouterLink, RouterLinkActive],
    template: `
    <div class="flex-col">
        <site-nav />

        <a routerLink="" routerLinkActive="true" class="margin-s"><button class="unfilled"><img class="icon" src="arrow_back_icon_blue.svg"> Back</button></a>

        <div class="rsReaderContainer">
        <form id="LoginForm" class="rsReaderPage">
            <h4>Log into ShortFormRules</h4>

            <label for="Username">Username<br>
            <input id="Username" name="username" #username [class]="usernameInputClass" type="text" (change)="evalUsernamePassword($event)" />
            </label><br>

            <label for="Password">Password<br>
            <input id="Password" name="password" #password [class]="passwordInputClass" type="password" (change)="evalUsernamePassword($event)" />
            </label><br>

            @if(submitUnlocked){
                <button id="SubmitForm" class="filled" type="button" (click)="loginUser()"><img class="icon" src="check_icon.svg"> Log in</button>
            }
            @else{
                <button id="SubmitForm" class="fill-grey" type="button" disabled><img class="icon" src="check_icon.svg"> Log in</button>
            }

            <p>
                Don't have an account?
                <a routerLink="/create-account" routerLinkActive="true">Create an account</a>
            </p><br>

            @if(confirmLinkVisible){
                <p>
                    Confirm your email address:
                    <a routerLink="/confirm-account" routerLinkActive="true">Confirm your email</a>
                </p><br>
            }
        </form>
        </div>

        @if(toastManager.toasts.length > 0){
            <toast [data]="toastManager.toasts[0]" (close)=toastManager.closeToast($event) />
        }
    </div>
    `,
    styleUrl: '../createRuleset/createFormStyles.css'
})
export class LoginUser {
    constructor(private router:Router) { }
    toastManager = new ToastManager();
    @ViewChild('username') usernameInput!: ElementRef;
    @ViewChild('password') passwordInput!: ElementRef;

    usernameInputClass = "textInput";
    passwordInputClass = "textInput";
    confirmLinkVisible = false;
    submitUnlocked = false;

    evalUsernamePassword(event: any){
        const valid = evaluateNotEmpty(event.target.value);
        this.usernameInputClass = (valid) ? "textInput" : "textInput textInput-wrong";
        
        // unlock the submit button if the two are non-empty
        if(evaluateNotEmpty(this.usernameInput.nativeElement.value) && evaluateNotEmpty(this.passwordInput.nativeElement.value)){
            this.submitUnlocked = true;
        }else{
            this.submitUnlocked = false;
        }
    }

    async loginUser(){
        if(!evaluateNotEmpty(this.passwordInput.nativeElement.value)){
            this.passwordInputClass = "textInput textInput-wrong";
            this.toastManager.createToast("Your password cannot be empty - please try again.", "error");
            return;
        }

        if(!evaluateNotEmpty(this.usernameInput.nativeElement.value)){
            this.usernameInputClass = "textInput textInput-wrong";
            this.toastManager.createToast("Your username cannot be empty - please try again.", "error");
            return;
        }

        loginUser(this.usernameInput.nativeElement.value, this.passwordInput.nativeElement.value, (successful: boolean, error: any) => {
            if(successful){
                this.toastManager.createToast("Logged in successfully, redirecting...", "normal");
                this.submitUnlocked = false;
                this.confirmLinkVisible = false;
                this.usernameInputClass = "TextInput";
                this.passwordInputClass = "TextInput";
                setTimeout(()=>{
                    this.router.navigate(['']);
                }, 2000);
            }else{
                if(error instanceof InvalidParameterException){
                    this.toastManager.createToast("The username or password entered may be incorrect - please check and try again.", "error");
                }else if(error instanceof UserNotConfirmedException){
                    this.toastManager.createToast("You have not yet confirmed your email - please confirm and try again.", "error");
                    this.confirmLinkVisible = true;
                }else if(error instanceof UserNotFoundException){
                    this.toastManager.createToast("That account does not exist - did you mean to create an account?", "error");
                }else{
                    // generic error toast
                    this.toastManager.createToast("Login failed - please try again later.", "error");
                }
                this.passwordInput.nativeElement.value = '';
                this.usernameInputClass = "textInput textInput-wrong";
                this.passwordInputClass = "textInput textInput-wrong";
                this.submitUnlocked = false;
            }
        });
    }
}
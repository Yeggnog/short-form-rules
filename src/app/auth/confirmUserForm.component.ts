import { Component, ElementRef, ViewChild, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SiteHeader } from "../siteHeader.component";
import { Toast, ToastManager } from "../toast.component";
import { evaluateConfirmCode, evaluateNotEmpty, confirmUser, resendConfirmation } from '../../authhandler';
import { AliasExistsException, CodeDeliveryFailureException, CodeMismatchException, ExpiredCodeException, TooManyFailedAttemptsException, TooManyRequestsException, UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";

@Component({
    selector: 'confirm-user-form',
    standalone: true,
    imports: [SiteHeader, Toast, RouterLink, RouterLinkActive],
    template: `
    <div class="flex-col">
        <site-nav />

        <a routerLink="/create-account" routerLinkActive="true" class="margin-s"><button class="unfilled"><img class="icon" src="arrow_back_icon_blue.svg"> Back</button></a>

        <div class="rsReaderContainer">
        <form id="ConfirmUserForm" class="rsReaderPage">
            <h4>Confirm your account</h4>
            <p>You should be getting an email shortly with a confirmation code. Enter it here to confirm your account.</p>

            <label for="Username">Username<br>
            <input id="Username" name="username" #username class="textInput" type="text" />
            </label><br>

            <label for="Confirm">Confirmation Code<br>
            <input id="Confirm" name="confirmCode" #confirmCode class="textInput" type="text" minlength=6 maxlength=6 />
            </label><br>

            <button id="SubmitForm" class="filled" type="button" (click)="confirmUser()"><img class="icon" src="check_icon.svg"> Confirm Account</button><br>
        
            @if(resendButtonVisible){
                <button id="ResendCode" class="unfilled" type="button" (click)="resendCode()">Resend Confirmation Code</button><br>
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
export class ConfirmUser {
    route = inject(ActivatedRoute);
    constructor(private router:Router) { }
    toastManager = new ToastManager();
    @ViewChild('username') usernameInput!: ElementRef;
    @ViewChild('confirmCode') codeInput!: ElementRef;

    codeInputClass = "textInput";
    resendButtonVisible = false;

    evalCurrentCode(event: any){
        let valid = evaluateConfirmCode(event.target.value);
        this.codeInputClass = (valid) ? "textInput" : "textInput textInput-wrong";
    }

    ngOnInit(){
        this.route.queryParams.subscribe(params => {
            // autofill with the username query param after the elementRef becomes active
            setTimeout(() => {
                if(params['username']){
                    this.usernameInput.nativeElement.value = decodeURIComponent(params['username']);
                }
            }, 1);
        });
   }

    async resendCode(){
        resendConfirmation(this.usernameInput.nativeElement.value, (successful: boolean, error: Error | undefined) => {
            if(successful){
                this.toastManager.createToast("Sent a new confirmation code.", "normal");
                this.resendButtonVisible = false;
            }else{
                if(error instanceof CodeDeliveryFailureException){
                    this.toastManager.createToast("The code was unable to be delivered - please check that your email is correct.", "error");
                }else if(error instanceof UserNotFoundException){
                    this.toastManager.createToast("The user does not exist - please check that the username is correct.", "error");
                }else if(error instanceof TooManyRequestsException){
                    this.toastManager.createToast("You have made too many requests - please try again later.", "error");
                }else{
                    // generic error toast
                    this.toastManager.createToast("Failed to resend the confirmation code - please try again later.", "error");
                }
            }
        });
    }

    async confirmUser(){
        let valid = evaluateConfirmCode(this.codeInput.nativeElement.value);
        if(!valid){
            this.codeInputClass = (valid) ? "textInput" : "textInput textInput-wrong";
            this.toastManager.createToast("The confirmation code should only contain numbers - please try again.", "error");
            return;
        }

        if(!evaluateNotEmpty(this.usernameInput.nativeElement.value)){
            this.toastManager.createToast("Your username cannot be empty - please try again.", "error");
            return;
        }

        confirmUser(this.usernameInput.nativeElement.value, this.codeInput.nativeElement.value, (successful: boolean, error: any) => {
            if(successful){
                this.toastManager.createToast("Account confirmed, redirecting...", "normal");
                this.resendButtonVisible = false;
                setTimeout(()=>{
                    this.router.navigate(['']);
                }, 2000);
            }else{
                if(error instanceof CodeMismatchException){
                    this.toastManager.createToast("The code entered is not correct - please check you entered it correctly.", "error");
                }else if(error instanceof ExpiredCodeException){
                    this.toastManager.createToast("This confirmation code has expired - please try again with another code.", "error");
                }else if(error instanceof AliasExistsException){
                    this.toastManager.createToast("Account confirmation failed - another account is registered with this email.", "error");
                }else if(error instanceof TooManyFailedAttemptsException){
                    this.toastManager.createToast("The process has failed too many times - please try again later.", "error");
                }else{
                    // generic error toast
                    this.toastManager.createToast("Account confirmation failed - please try again later.", "error");
                }
                this.resendButtonVisible = true;
            }
        });
    }
}
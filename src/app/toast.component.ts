import { Component, EventEmitter, Input, Output } from '@angular/core';
import { toastData } from './editRuleset/editorTypes';
import { generateBlockIndex } from '../datafetch';

@Component({
    selector: 'toast',
    standalone: true,
    template: `
    @if(data){
        <div [class]="getToastClass(data.type)">
            <h4>{{ data.message }}</h4>
            @if(data.type == "error"){
                <button class="button err unfilled margin-s" (click)="onClose()"><img class="icon" src="close_icon_red.svg"> Close</button>
            }@else{
                <button class="button unfilled margin-s" (click)="onClose()"><img class="icon" src="close_icon_blue.svg"> Close</button>
            }
        </div>
    }
    `,
    styleUrl: './toast.component.css'
})
export class Toast{
    @Input() data: toastData | undefined = undefined;
    @Output() close: EventEmitter<string> = new EventEmitter;

    onClose(){
        if(this.data){
            // emit the toast id so its ToastManager can remove it from the list
            this.close.emit(this.data.id);
        }
    }

    getToastClass(toastType: string){
        const errorClass = (toastType == "error") ? "errorToast " : "";
        return "toast " + errorClass;
    }
}

// Encapsulated class for adding toasts to a page, just add this and one toast component
export class ToastManager {
    public toasts: toastData[];

    constructor(){
        this.toasts = [];
    }
    
    createToast(message: string, type: string){
        const toastId = generateBlockIndex(9999);
        const newToast = {
            id: toastId,
            message: message,
            type: type
        } as toastData;

        let newToasts = this.toasts.slice();
        newToasts.push(newToast);
        this.toasts = newToasts;

        if(type != "error" && this.toasts.length == 1){
            // make the first normal toast auto-expire
            setTimeout(()=>{this.closeToast(toastId)}, 5000);
        }
    }

    closeToast(id: string){
        if(this.toasts.length == 0){
            return;
        }

        let toastIndex = this.toasts.findIndex((toast) => toast.id == id);
        
        if(toastIndex != -1){
            this.toasts.splice(toastIndex, 1);

            // if a non-error toast follows this one, set the expiration callback for it
            if(this.toasts.length > 0 && this.toasts[0].type != "error"){
                setTimeout(()=>{this.closeToast(this.toasts[0].id)}, 5000);
            }
        }
    }
}
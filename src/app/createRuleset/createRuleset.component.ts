import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { headerColor, colorOptions } from "../renderingUtils";
import { createRuleset } from "../../datafetch";
import { RulesetTypeOption } from "./rulesetTypeOption.component";
import { SiteHeader } from "../siteHeader.component";
import { Toast, ToastManager } from "../toast.component";

@Component({
    selector: 'create-ruleset',
    standalone: true,
    imports: [FormsModule, SiteHeader, Toast, RulesetTypeOption, RouterLink, RouterLinkActive],
    template: `
    <div class="flex-col">
        <site-nav />

        <a routerLink="" routerLinkActive="true" class="margin-s"><button class="unfilled"><img class="icon" src="arrow_back_icon_blue.svg"> Back</button></a>

        <div class="rsReaderContainer">
        <div id="RulesetPreviewCard" class="rsCard sticky">
            <h2 class="rsHeader centerContent" [style]="'background-color: ' + getHeaderColor(color)">{{ title }}</h2>
            <div class="rsCardBody">
                {{ author }}<br>
                <span>{{ system }}</span> - <span>{{ type }}</span><br>
            </div>
        </div>
        
        <form id="CreateRulesetForm" class="rsReaderPage">
            <label for="RulesetTitle">Title</label><br>
            <input id="RulesetTitle" name="title" [class]="titleDisplayClass" type="text" [value]="title" [(ngModel)]="title" (ngModelChange)="postTitleUpdate($event)" /><br>

            <label for="RulesetAuthor">Author</label><br>
            <input id="RulesetAuthor" name="author" class="textInput" type="text" placeholder="Sample Author" [(ngModel)]="author" /><br>

            <label for="RulesetSystem">Game System</label><br>
            <select id="RulesetSystem" class="selectInput" (change)="postSystemUpdate($event)">
                <option value="D&D 5e">D&D (5th Edition)</option>
                <option value="D&D 3.5">D&D (3.5)</option>
                <option value="Pathfinder">Pathfinder</option>
                <option value="PBtA">Powered By The Apocalypse (PBtA)</option>
                <option value="Lancer">Lancer</option>
                <option value="Custom" selected>Custom</option>
            </select><br>


            <label for="RulesetType">What type of ruleset is it?</label><br>
            @for(typeOption of typeOptions; track typeOption.name){
                <ruleset-type-option [optionName]="typeOption.name" [optionDesc]="typeOption.desc" [selectedType]="type" (change)="postTypeUpdate($event)" />
            }

            <label for="RulesetColor">Header Color</label><br>
            <div tabIndex=0 class="flex-row flex-wrap">
                @for(option of colorOptions; track option.name){
                    <input [id]="option.value" type="radio" name="RulesetColor" [value]="option.value" (change)="postColorUpdate($event)" class="sr-only">
                    <label [for]="option.value" [class]="getSwatchClass(option.value)" [style]="'background-color: ' + option.color">{{ option.value }}</label><br>
                }
            </div><br>

            <button id="SubmitForm" class="filled" (click)="createRuleset()"><img class="icon" src="check_icon.svg"> Create</button>
        </form>
        </div>

        @if(toastManager.toasts.length > 0){
            <toast [data]="toastManager.toasts[0]" (close)=toastManager.closeToast($event) />
        }
    </div>
    `,
    styleUrls: [ './createFormStyles.css', '../rulesetReader/rulesetHeader.css' ]
})
export class CreateRuleset {
    constructor(private router:Router) { }
    toastManager = new ToastManager();

    title = 'Untitled Ruleset';
    author = '';
    system = 'Custom';
    type = 'Standalone';
    color = 'Blue';

    typeOptions = [
        { name: "Standalone", desc: "This ruleset can be used by itself with no supplemental material." },
        { name: "Supplement", desc: "This is a set of rules and content that expand a base ruleset in a specific way." },
        { name: "Encounter", desc: "This is a piece of game content to be run with a base ruleset (and the selected supplements, if applicable)." },
        { name: "Statblock", desc: "This is a set of stats for an entity, object or concept, usable within a base ruleset (and the selected supplements, if applicable)." }
    ];

    colorOptions = colorOptions;

    // post-update logic (for non-ngModel fields)
    titleDisplayClass = "textInput";
    postTitleUpdate(newTitle: string){
        if(newTitle == ""){
            this.titleDisplayClass = "textInput textInput-wrong";
        }else{
            this.titleDisplayClass = "textInput";
        }
    }
    postSystemUpdate(event: any){
        this.system = event.target.value;
    }
    postTypeUpdate(event: any){
        this.type = event.target.value;
    }
    postColorUpdate(event: any){
        this.color = event.target.value;
    }

    async createRuleset(){
        // validate form entries
        if(this.author == ""){
            this.author = "No Author";
        }

        if(this.title != ""){
            // create the ruleset
            createRuleset("", {
                title: this.title,
                author: this.author,
                system: this.system,
                type: this.type,
                color: this.color
            }, (successful: boolean, rulesetKey: string) => {
                if(successful){
                    // navigate to the ruleset's edit page
                    this.toastManager.createToast("Ruleset created successfully. redirecting...", "normal");
                    setTimeout(()=>{
                        this.router.navigate([`/edit/${rulesetKey}`]);
                    }, 2000);
                }else{
                    this.toastManager.createToast("Unable to create the ruleset - try again later.", "error");
                }
            });
        }
    }

    closeToast(event: string){
        this.toastManager.closeToast(event);
    }

    getHeaderColor(color: string){
        return headerColor(color);
    }

    getSwatchClass(color: string){
        return (color == this.color) ? "colorSwatch colorSwatch-selected" : "colorSwatch";
    }
}
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { blockData, documentMeta } from "../editorTypes";
import { RulesetTypeOption } from "../../createRuleset/rulesetTypeOption.component";
import { colorOptions } from "../../renderingUtils";

@Component({
    selector: 'metadata-edit-fill',
    standalone: true,
    imports: [FormsModule, RulesetTypeOption],
    template: `
        <label for="RulesetTitle">Title</label><br>
        <input id="RulesetTitle" name="title" [class]="titleDisplayClass" type="text" [value]="title" [(ngModel)]="title" (ngModelChange)="postTitleUpdate($event)" /><br>

        <label for="RulesetAuthor">Author</label><br>
        <input id="RulesetAuthor" name="author" class="textInput" type="text" placeholder="Sample Author" [(ngModel)]="author" (ngModelChange)="postAuthorUpdate($event)" /><br>

        <label for="RulesetSystem">Game System</label><br>
        <select id="RulesetSystem" class="selectInput" (change)="postSystemUpdate($event)">
            @for(systemOption of systemOptions; track systemOption.name){
                <option [value]="systemOption.value">{{ systemOption.name }}</option>
            }
        </select><br>


        <label for="RulesetType">What type of ruleset is it?</label><br>
        @for(typeOption of typeOptions; track typeOption.name){
            <ruleset-type-option [optionName]="typeOption.name" [optionDesc]="typeOption.desc" [selectedType]="type" (change)="postTypeUpdate($event)" />
        }

        <label for="RulesetColor">Header Color</label><br>
        <div class="flex-row flex-wrap">
            @for(option of colorOptions; track option.name){
                <input [id]="option.value" type="radio" name="RulesetColor" [value]="option.value" (change)="postColorUpdate($event)" class="sr-only">
                <label [for]="option.value" [class]="getSwatchClass(option.value) + ' ' + option.class">{{ option.value }}</label><br>
            }
        </div>
    `,
    styleUrl: '../../createRuleset/createFormStyles.css'
})
export class MetadataEditorFill{
    @Input() metadata = {} as documentMeta;
    @Output() dataChanged = new EventEmitter<documentMeta>();

    title = 'Untitled Ruleset';
    author = '';
    system = 'Custom';
    type = 'Standalone';
    color = 'Blue';

    systemOptions = [
        { name: "D&D 5e", value: "D&D (5th Edition)" },
        { name: "D&D 3.5", value: "D&D (3.5)" },
        { name: "Pathfinder", value: "Pathfinder" },
        { name: "PBtA", value: "Powered By The Apocalypse (PBtA)" },
        { name: "Lancer", value: "Lancer" },
        { name: "Custom", value: "Custom" }
    ];

    typeOptions = [
        { name: "Standalone", desc: "This ruleset can be used by itself with no supplemental material." },
        { name: "Supplement", desc: "This is a set of rules and content that expand a base ruleset in a specific way." },
        { name: "Encounter", desc: "This is a piece of game content to be run with a base ruleset (and the selected supplements, if applicable)." },
        { name: "Statblock", desc: "This is a set of stats for an entity, object or concept, usable within a base ruleset (and the selected supplements, if applicable)." }
    ];

    colorOptions = colorOptions;

    ngOnChanges(){
        this.title = this.metadata.title;
        this.author = this.metadata.author;
        this.system = this.metadata.system;
        this.type = this.metadata.type;
        this.color = this.metadata.color;
    }

    updateData(data: blockData){} // Needs to be defined, but not useful for this fill
    updateMeta(meta: documentMeta){
        this.metadata = meta;
    }

    titleDisplayClass = "textInput";

    // post update logic for making the form responsive
    postTitleUpdate(newTitle: string){
        if(newTitle == ""){
            this.titleDisplayClass = "textInput textInput-wrong";
        }else{
            this.titleDisplayClass = "textInput";
        }
        this.submitChanges();
    }
    postAuthorUpdate(newAuthor: string){
        this.submitChanges();
    }
    postSystemUpdate(event: any){
        this.system = event.target.value;
        this.submitChanges();
    }
    postTypeUpdate(event: any){
        this.type = event.target.value;
        this.submitChanges();
    }
    postColorUpdate(event: any){
        this.color = event.target.value;
        this.submitChanges();
    }

    // send the updates back to the editor component
    submitChanges(){
        var newMetadata = {
            title: this.title,
            author: this.author,
            system: this.system,
            type: this.type,
            color: this.color
        };

        this.dataChanged.emit(newMetadata);
    }

    getSwatchClass(color: string){
        return (color == this.color) ? "colorSwatch colorSwatch-selected" : "colorSwatch";
    }
};
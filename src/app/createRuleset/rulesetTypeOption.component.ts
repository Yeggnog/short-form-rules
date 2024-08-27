import { Component, Input } from '@angular/core';

@Component({
    selector: 'ruleset-type-option',
    standalone: true,
    template: `
        <div [class]="getTypeClass()">
            <div class="rsTypeRadioSection">
                <input [id]="optionName" type="radio" name="RulesetType" [value]="optionName" [checked]="(optionName == selectedType)">
            </div>
            <label [for]="optionName" class="rsTypeDescriber">
                <h3>{{ optionName }}</h3>
                <p>{{ optionDesc }}</p>
            </label>
        </div><br>
    `,
    styleUrl: './createFormStyles.css'
})
export class RulesetTypeOption {
    @Input() optionName = "";
    @Input() optionDesc = "";
    @Input() selectedType = "";

    getTypeClass(){
        return (this.optionName == this.selectedType) ? "rsTypeOption rsTypeOption-selected" : "rsTypeOption";
    }
}
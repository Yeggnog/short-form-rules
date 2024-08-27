import { Component, Input } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { headerColorClass } from '../renderingUtils';
import { scrubTitleString } from '../../datafetch';

// customize the link route based on the passed-in data
@Pipe({ name: 'viewRoute', standalone: true })
export class ViewRoute implements PipeTransform {
  transform(routeId: string | number, title: string): string {
    const routeTitle = scrubTitleString(title);
    return "/view/"+routeTitle+"-"+routeId;
  }
}

@Component({
    selector: 'ruleset-card',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, ViewRoute],
    template: `
    <div class="rsCard">
        <a [routerLink]="uuid | viewRoute: title" routerLinkActive="true"><h2 [class]="getHeaderColor(color) + ' centerContent'">{{ title }} <img class="icon" src="chevron_right_icon.svg"></h2></a>
        <div class="rsCardBody">
            <span>{{ author }}</span> - 
            <span>{{ system }}</span> <span> ({{ type }})</span><br>
        </div>
    </div>
    `,
    styleUrl: '../rulesetoverview.component.css'
})
export class RulesetCard {
    @Input() uuid = '';
    @Input() title = '';
    @Input() author = '';
    @Input() system = '';
    @Input() type = '';
    @Input() color = '';
    
    getHeaderColor(color: string){
        return headerColorClass(color);
    }
}
import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ParseMDPipe } from '../../htmlsanitize';
import { fetchRuleset } from '../../datafetch';
import { ActivatedRoute } from '@angular/router';
import { headerColor } from '../renderingUtils';
import { blockData } from '../editRuleset/editorTypes';
import { mdToBlocks } from '../../blocktranslate';
import { RulesetBlock } from '../editRuleset/rulesetBlock.component';
import { SiteHeader } from '../siteHeader.component';
import { Toast, ToastManager } from '../toast.component';

// customize the link route based on the passed-in data
@Pipe({ name: 'viewRoute', standalone: true })
export class ViewRoute implements PipeTransform {
  transform(routeKey: string, action: string): string {
    return "/"+action+"/"+routeKey;
  }
}

@Component({
    selector: 'ruleset-view',
    standalone: true,
    imports: [ParseMDPipe, RulesetBlock, SiteHeader, Toast, ViewRoute, RouterLink, RouterLinkActive],
    template: `
    <div class="flex-col fullscreen-v">
        <site-nav />
        @if(metadata && metadata !== {}){
            <div class="rsHeader sticky" [style]="'background-color: ' + getHeaderColor(metadata['color'])">
                <h2>{{ metadata['title'] }}</h2>
                <span>{{ metadata['author'] }}</span> - 
                <span>{{ metadata['system'] }}</span> <span> ({{ metadata['type'] }})</span><br>
                @if(rulesetEditable){
                    <a [routerLink]="rulesetUUID | viewRoute: 'edit'" routerLinkActive="true"><button class="unfilled"><img class="icon" src="edit_icon_blue.svg"> Edit</button></a>
                }
                @else{
                    <br>
                }
            </div>
        }
        @else{
            <div class="rsHeader sticky">
                <h2>Sample Ruleset Title</h2>
                Sample Author<br>
                <span>Custom</span> - <span>Supplement</span><br>
            </div>
        }

        <div class="rsReaderContainer">
            @if(rulesetBlocks.length > 0){
                <div class="rsReaderPage">
                    @for(block of rulesetBlocks; track block['blockId']){
                        <div class="rsBlock">
                            <rs-block [blockData]="block"/>
                        </div>
                    }
                </div>
            }
            @else{
                <div class="rsReaderPage">
                    <h2>This ruleset doesn't have any content...</h2>
                </div>
            }
        </div>

        @if(toastManager.toasts.length > 0){
            <toast [data]="toastManager.toasts[0]" (close)=toastManager.closeToast($event) />
        }
    </div>
    `,
    styleUrl: '../rulesetoverview.component.css'
})
export class RulesetView {
    metadata: Record<string,string> = {
        title: "Untitled Ruleset",
        author: "",
        system: "Custom",
        type: "Standalone",
        color: "black"
    };
    rulesetBlocks: blockData[] = [];
    rulesetUUID = "";
    route = inject(ActivatedRoute);
    toastManager: ToastManager = new ToastManager();
    rulesetEditable = false;

    async ngOnInit(){
        const urlId = this.route.snapshot.paramMap.get("id");

        if(urlId){
            this.rulesetUUID = urlId;
            const rulesetResponse = await fetchRuleset(urlId);

            if(rulesetResponse){
                this.rulesetEditable = rulesetResponse.editable;
                this.metadata = rulesetResponse.rulesetData.meta;
                const rulesetData = rulesetResponse.rulesetData.stream;
                this.rulesetBlocks = mdToBlocks(rulesetData);
            }else{
                this.toastManager.createToast("Failed to fetch the ruleset data - try again later.", "error");
            }
        }
    }

    getHeaderColor(color: string){
        return headerColor(color);
    }
}
import { Component, Input, ViewChild, inject, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ParseMDPipe } from '../../htmlsanitize';
import { headerColor } from "../renderingUtils";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { fetchRuleset, editRuleset, deleteRuleset, generateBlockIndex, scrubTitleString } from "../../datafetch";
import { EditPanel } from "./editPanel.component";
import { blockData, documentMeta } from "./editorTypes";
import { RulesetBlock } from "./rulesetBlock.component";
import { RadialMenu } from "./radialMenu.component";
import { blocksToMd, mdToBlocks } from "../../blocktranslate";
import { SiteHeader } from "../siteHeader.component";
import { Toast, ToastManager } from "../toast.component";
import { authChallenge } from "../../authhandler";
import { ConfirmModal } from "../confirmModal.component";

// "sensible default" fill data for each type of block
const defaultBlockData = (type: string) => {
    switch(type){
        case "table": return {
            blockId: "MissingNo.", blockType: "table",
            contents: '',
            isBlockQuote: false,
            tableContents: [
                ["Header 1", "Header 2", "Header 3"],
                ["Item A1", "Item B1", "Item C1"],
                ["Item A2", "Item B2", "Item C2"]
            ],
            diceType: 0
        } as blockData;

        case "diceTable": return {
            blockId: "MissingNo.", blockType: "diceTable",
            contents: '',
            isBlockQuote: false,
            tableContents: [
                ["1d4", "Header 1", "Header 2"],
                ["1", "Item A1", "Item B1"],
                ["2", "Item A2", "Item B2"],
                ["3", "Item A3", "Item B3"],
                ["4", "Item A4", "Item B4"]
            ],
            diceType: 4
        } as blockData;

        case "blockText": return {
            blockId: "MissingNo.", blockType: "text",
            contents: '',
            isBlockQuote: true,
            tableContents: [],
            diceType: 0
        } as blockData;

        default: return {
            blockId: "MissingNo.", blockType: "text",
            contents: '',
            isBlockQuote: false,
            tableContents: [],
            diceType: 0
        } as blockData;
    }
}

@Component({
    selector: 'edit-ruleset',
    standalone: true,
    imports: [SiteHeader, Toast, ParseMDPipe, FormsModule, EditPanel, RulesetBlock, RadialMenu, RouterLink, RouterLinkActive, ConfirmModal],
    template: `
    <div class="flex-col fullscreen-v">
        <site-nav />
        @if(cleanedMetadata){
            <div class="rsHeader sticky" [style]="'background-color: ' + getHeaderColor(cleanedMetadata['color'])">
                <div class="flex-row">
                    <a [routerLink]="getViewRoute()" routerLinkActive="true" class="margin-s"><span class="light"><img class="icon" src="arrow_back_icon.svg"> Back</span></a>
                </div>
                <h2>{{ cleanedMetadata['title'] }}</h2>
                <span>{{ cleanedMetadata['author'] }}</span> - 
                <span>{{ cleanedMetadata['system'] }}</span> <span> ({{ cleanedMetadata['type'] }})</span><br>
                <div class="flex-row flex-wrap">
                    <button class="filled margin-s" (click)="editMeta()"><img class="icon" src="edit_icon.svg"> Edit</button>
                    <button class="filled margin-s" (click)="openRadialMenu()"><img class="icon" src="add_icon.svg"> New Block</button>
                    <button class="filled margin-s" (click)="finalizeEdits()"><img class="icon" src="save_icon.svg"> Save Changes</button>
                    <button class="unfilled err margin-s" (click)="openModalEmitter.emit(true)"><img class="icon" src="delete_icon_red.svg"> Delete ruleset</button>
                </div>
            </div>
        }
        @else{
            <div class="rsHeader sticky">
                <h2>Sample Ruleset Title</h2>
                Sample Author<br>
                <span>Custom</span> - <span>Supplement</span><br>
                <button class="filled margin-s" (click)="editMeta()"><img class="icon" src="edit_icon.svg"> Edit</button>
                <button class="filled margin-s" (click)="openRadialMenu()"><img class="icon" src="add_icon.svg"> New Block</button>
            </div>
        }

        <div class="rsEditorContainer">
            <div [class]="getReaderClass()">
                @if(rulesetBlocks.length > 0){
                    <div class="rsReaderPage" (contextmenu)="openRadialMenu()">
                        @for(block of rulesetBlocks; track block['blockId']){
                            <div [class]="getBlockClass(block)" (click)="onSelectBlock(block)">
                                <rs-block [blockData]="block" [onSelected]="onSelectBlock" [selectedBlockId]="selectedBlockId" (contextmenu)="selectBlockNoEdit(block)" />
                            </div>
                        }
                    </div>
                }
                @else{
                    <div class="rsReaderPage" (contextmenu)="openRadialMenu()">
                        <h2> Welcome to ShortFormRules! Right click or hit the add button to get started. </h2>
                    </div>
                }
            </div>

            <edit-panel [(editorVisible)]="editPanelVisible" #EditPanel [editingMetadata]="editingMetadata" [blockData]="selectedBlockData" [metaData]="cleanedMetadata" (submitChanges)="updateSelectedBlock($event)" (submitMeta)="updateMeta($event)" (deleteBlock)="deleteSelectedBlock()" />

            <radial-menu [menuVisible]="radialMenuVisible" (selectOption)="createNewBlock($event)" />
        </div>

        @if(toastManager.toasts.length > 0){
            <toast [data]="toastManager.toasts[0]" (close)=toastManager.closeToast($event) />
        }

        <confirm-modal headlineText="Delete this ruleset?" bodyText="Are you sure you want to delete this ruleset?" confirmText="Yes, delete it" declineText="No, don't delete it" [dangerous]="true" [openEvent]="openModalEmitter" (response)="deleteRuleset($event)" />
    </div>
    `,
    styleUrl: './rulesetEditor.css'
})
export class EditRuleset {
    @Input() metadata: Record<string,string> | undefined = undefined;
    @Input() rulesetData = "There is no data for this ruleset.";

    route = inject(ActivatedRoute);
    constructor(private router:Router) { }
    @ViewChild('EditPanel') editPanel!: EditPanel;
    openModalEmitter = new EventEmitter<boolean>();
    toastManager = new ToastManager();

    // puts the metadata into the expected format for the metadata editor fill
    cleanedMetadata = {
        title: "Untitled Ruleset",
        author: "",
        system: "Custom",
        type: "Standalone",
        color: "black"
    } as documentMeta;
    savedRulesetTitle = '';

    rulesetBlocks: blockData[] = [];
    selectedBlockId = "";
    selectedBlockData = {} as blockData;

    editPanelVisible = false;
    radialMenuVisible = false;
    editingMetadata = false;
    rulesetEditable = false;

    async ngOnInit(){
        const urlId = this.route.snapshot.paramMap.get("id");

        if(urlId){
            // auth challenge prior to fetching the full data
            let authToken = sessionStorage.getItem('accessToken');
            if(authToken == null){
                // Auth challenge failed, redirect to the homepage
                this.router.navigate(['']);
                return;
            }

            authChallenge(urlId, async (successful: boolean) => {
                if(successful){
                    const rulesetResponse = await fetchRuleset(urlId);
                    if(rulesetResponse){
                        this.rulesetEditable = rulesetResponse.editable;
                        this.metadata = rulesetResponse.rulesetData.meta;
                        this.cleanedMetadata = {
                            title: this.metadata['title'],
                            author: this.metadata['author'],
                            system: this.metadata['system'],
                            type: this.metadata['type'],
                            color: this.metadata['color']
                        } as documentMeta;

                        this.rulesetData = rulesetResponse.rulesetData.stream;
                        this.rulesetBlocks = mdToBlocks(this.rulesetData);
                    }else{
                        this.toastManager.createToast("Failed to fetch the ruleset data - try again later.", "error");
                    }
                }else{
                    // Auth challenge failed, redirect to the homepage
                    this.router.navigate(['']);
                    return;
                }
            });
        }
    }

    async finalizeEdits(){
        // finalize the edits if the document has changed
        if(this.metadata){
            const mdDocument = blocksToMd(this.rulesetBlocks);
            editRuleset(this.metadata['id'], mdDocument, this.cleanedMetadata, this.savedRulesetTitle, (successful: boolean) => {
                if(successful){
                    this.toastManager.createToast("Changes saved!", "normal");

                    if(this.savedRulesetTitle != this.cleanedMetadata.title){
                        // if the title was changed, redirect to the proper edit page
                        setTimeout(() => {
                            if(this.metadata){
                                this.router.navigate([`/edit/${scrubTitleString(this.cleanedMetadata.title)}-${this.metadata['id']}`]);
                                this.savedRulesetTitle = '';
                            }
                        }, 200);
                    }
                }else{
                    this.toastManager.createToast("Failed to save changes, try again later.", "error");
                }
            });
        }
    }

    deleteRuleset(confirmResponse: boolean){
        if(!confirmResponse){
            return;
        }

        if(this.metadata){
            deleteRuleset(this.metadata['id'], this.cleanedMetadata, (successful: boolean) => {
                if(successful){
                    // navigate back to the card view page
                    this.toastManager.createToast("Deleted the ruleset, redirecting...", "normal");
                    setTimeout(()=>{
                        this.router.navigate(['']);
                    }, 2000);
                }else{
                    this.toastManager.createToast("Deletion was unsuccessful, try again later.", "error");
                }
            });
        }
    }

    createNewBlock(blockType: string){
        // create the block data
        var newBlockData = defaultBlockData(blockType);
        newBlockData.blockId = generateBlockIndex(999999); // generate a random 6-digit id

        // insert the block at the selected position
        var insertPosition = this.rulesetBlocks.findIndex((block) => block.blockId == this.selectedBlockId);
        if(insertPosition != -1){
            this.rulesetBlocks.splice(insertPosition + 1, 0, newBlockData);
        }else{
            // if nothing is selected, put the new block at the end
            this.rulesetBlocks.push(newBlockData);
        }

        this.deselectAll();
        this.selectBlockNoEdit(newBlockData);
    }

    // called when the editor panel confirms its local changes
    updateSelectedBlock(editedBlockData: blockData){
        for(var i=0; i<this.rulesetBlocks.length; i++){
            let block = this.rulesetBlocks[i];
            if(block.blockId == editedBlockData.blockId){
                this.rulesetBlocks[i] = editedBlockData;
                return;
            }
        }
    }

    deleteSelectedBlock(){
        var deletePosition = -1;
        for(var i=0; i<this.rulesetBlocks.length; i++){
            let block = this.rulesetBlocks[i];
            if(block.blockId == this.selectedBlockId){
                deletePosition = i;
                break;
            }
        }
        if(deletePosition != -1){
            this.rulesetBlocks.splice(i, 1);
            this.editPanelVisible = false;
        }
    }

    // called when a block in the ruleset is clicked on to select it
    onSelectBlock(block: blockData){
        this.radialMenuVisible = false;
        this.editingMetadata = false;

        if(!this.editPanelVisible || block !== this.selectedBlockData){
            this.selectedBlockData = block;
            this.selectedBlockId = block.blockId;

            // open the edit panel
            if(!this.editPanelVisible){
                this.editPanelVisible = true;

                // update the edit panel with the most recent information
                this.editPanel.onPanelOpen(this.selectedBlockData, this.cleanedMetadata);
            }
        }else if(this.editPanelVisible){
            this.deselectAll();
        }
    }

    // selects a block without opening the edit panel (for insert ordering)
    selectBlockNoEdit(block: blockData){
        if(this.selectedBlockId == block.blockId){
            this.selectedBlockId = "";
        }else{
            this.selectedBlockId = block.blockId;
        }
        this.editingMetadata = false;
    }

    openRadialMenu(){
        this.radialMenuVisible = !this.radialMenuVisible;
        return false;
    }

    editMeta(){
        this.editingMetadata = true;
        this.editPanelVisible = true;
    }

    updateMeta(meta: documentMeta){
        if(meta.title != this.cleanedMetadata.title){
            this.savedRulesetTitle = this.cleanedMetadata.title;
        }
        this.cleanedMetadata = meta;
    }

    deselectAll(){
        this.radialMenuVisible = false;
        this.editPanelVisible = false;
        this.editingMetadata = false;
        this.selectedBlockId = "";
        this.selectedBlockData = {} as blockData;
    }

    getViewRoute(){
        if(this.metadata){
            if(this.savedRulesetTitle != ''){
                return '/view/' + scrubTitleString(this.savedRulesetTitle) + '-' + this.metadata['id'];
            }else{
                return '/view/' + scrubTitleString(this.cleanedMetadata.title) + '-' + this.metadata['id'];
            }
        }else{
            return "";
        }
    }

    getBlockClass(block: blockData): string{
        var baseClass = "";
        
        const selectionClass = (block.blockId === this.selectedBlockId) ? " rsBlockSelected" : " rsBlock";
        return baseClass + selectionClass;
    }

    getReaderClass(){
        return "rsReaderContainer" + ((this.editPanelVisible) ? " rsReaderContainerGrouped" : "");
    }

    getHeaderColor(color: string){
        return headerColor(color);
    }
}
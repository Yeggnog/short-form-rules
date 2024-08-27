import { blockData, headerData } from "./app/editRuleset/editorTypes";
import { RulesetBlock } from "./app/editRuleset/rulesetBlock.component";

const startBlockDivider = "==== Block ====";
const endBlockDivider = "==== EndBlock ====";

export function mdToBlocks(rawMarkdown: string): blockData[]{
    // break the string into blocks
    var blockStrings = rawMarkdown.split("\n");

    // deserialize blocks into objects
    var blocks = [] as blockData[];
    blockStrings = blockStrings.reverse();
    while(blockStrings.length > 0){
        var poppedString = blockStrings.pop();
        if(poppedString == startBlockDivider){
            var blockString = blockStrings.pop();

            if(blockString){
                var parsedObj = JSON.parse(blockString.replace('\n', ''));
                blocks.push(parsedObj);
            }
        }
    }

    return blocks;
}

export function blocksToMd(blocks: blockData[]): string{
    // serialize blocks and add separators
    var blockStrings = [] as string[];
    blocks.forEach((block: blockData) => {
        blockStrings.push(startBlockDivider + "\n" + JSON.stringify(block) + "\n" + endBlockDivider);
    });

    return blockStrings.join("\n");
}

/*
export function sanitizeBlocks(rsblocks: blockData[]){

    let rulesetStream = blocksToMd(rsblocks);

    console.log("Got stream in:");
    console.log(rulesetStream);
    let blocks = mdToBlocks(rulesetStream);
    console.log("Parsed into blocks:");
    console.log(blocks);

    for(let i=0; i<blocks.length; i++){
        if(blocks[i].blockType == "text"){
            // sanitize to just raw markdown
            const mdTest = /[^\w\d\s\#\*\^\(\)\[\]\+\'\"\.\\,/-=@$%&?<>:;|]/
            blocks[i].contents.replace(mdTest, '');
        }
    }
    console.log("Sanitized blocks:");
    console.log(blocks);
}
*/

export function parseHeaders(blocks: blockData[]): headerData[] {
    // check clipped newlines for hashes and add to list if true
    let headers = [] as headerData[];

    for(let block of blocks){
        if(block.blockType == "text"){
            // Read through the text data line-by-line
            let textContents = block.contents.split('\n');
            for(let line of textContents){
                if(line.match( /(?<=^\s*#+\s+)\w/ )){
                    let headerLine = line.trim();

                    // get the header level (h1, h2, etc.)
                    let headerLevel = 0;
                    let numOfHashes = 0;
                    while(headerLine.at(numOfHashes) == '#'){
                        numOfHashes += 1;
                        headerLevel = Math.min(numOfHashes, 6);
                    }

                    // trim the string to just the content
                    headerLine = headerLine.slice(numOfHashes + 1).trim();

                    console.log("Matched line ["+headerLine+"] to the pattern (header level "+headerLevel+")");
                    headers.push({ header: headerLine, level: headerLevel } as headerData);
                }
            }
        }
    }
    return headers;

    /*
    const sampleString = `
    # This is a good header
        ## This is a header with whitespace
    ###### This is a maxed header
    ############# This header is overcompensating
    apple # This is a bad header
    # #This is a worse header
    `;
    
    let splitCont = sampleString.split('\n');
    for(let line of splitCont){
        if(line.match( /(?<=^\s*#+\s+)\w/ )){
            let headerLine = line.trim();

            // get the header level (h1, h2, etc.)
            let headerLevel = 0;
            let numOfHashes = 0;
            while(headerLine.at(numOfHashes) == '#'){
                numOfHashes += 1;
                headerLevel = Math.min(numOfHashes, 6);
            }

            // trim the string to just the content
            headerLine = headerLine.slice(numOfHashes + 1).trim();

            console.log("Matched line ["+headerLine+"] to the pattern (header level "+headerLevel+")");
        }
    }
    */
}
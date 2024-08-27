
export type blockData = {
    blockId: string,             // random 6-digit id string
    blockType: string,           // one of "text", "table", "diceTable"
    contents: string,            // text / blockquotes only
    isBlockQuote: boolean,       // text / blockquotes only
    tableContents: string[][],   // all tables
    diceType: number             // dice tables only
};

export type documentMeta = {
    title: string,
    author: string,
    system: string,
    type: string,
    color: string
};

export type toastData = {
    id: string,                 // random numerical id
    message: string,
    type: string                // "error" makes it not expire, other strings are treated as "normal"
};

// not used in the main app, intended for a planned "table of contents" feature
export type headerData = {
    header: string,
    level: number               // the header's level number (h1, h2, h3, etc.)
}
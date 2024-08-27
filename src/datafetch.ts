import { documentMeta } from "./app/editRuleset/editorTypes";

export async function fetchHeaders(): Promise<Record<string, string>[] | undefined>{
    let resp = undefined;
    try{
        resp = await fetch(`http://localhost:8080/headers`);
    }catch(err){
        return undefined;
    }

    if(resp && resp.status == 200 && resp.body){
        let reader = resp.body.getReader();
        
        let data = await reader.read();
        if(data.value){
            let decode = new TextDecoder();
            return JSON.parse(decode.decode(data.value));
        }
    }
    return [];
};

// fetch only the headers created by the current user
export async function fetchHeadersByUser(accessToken: string | null): Promise<Record<string, string>[] | undefined>{

    if(accessToken == null){
        return [];
    }

    let resp = undefined;
    try{
        resp = await fetch(`http://localhost:8080/headers/user`, {
            method: 'GET',
            headers: {
                'Authorization': accessToken.toString()
            }
        });
    }catch(err){
        return undefined;
    }

    if(resp && resp.status == 200 && resp.body){
        let reader = resp.body.getReader();
        
        let data = await reader.read();
        if(data.value){
            let decode = new TextDecoder();
            return JSON.parse(decode.decode(data.value));
        }
    }
    return [];
};

export async function fetchRuleset(key: string): Promise<{editable: boolean, rulesetData: {meta:Record<string, string>, stream:string}} | undefined>{
    let resp = undefined;
    try{
        let accessToken = '';
        if(sessionStorage['accessToken']){
            accessToken = sessionStorage['accessToken'].toString();
        }
        
        resp = await fetch(`http://localhost:8080/rulesets/${key}`, {
            method: 'GET',
            headers: {
                'Authorization': accessToken
            }
        });
    }catch(err){
        return undefined;
    }

    if(resp && resp.status == 200 && resp.body){
        let reader = resp.body.getReader();
        let data = await reader.read();
        if(data.value){
            let decode = new TextDecoder();
            return JSON.parse(decode.decode(data.value));
        }
    }
    return {
        editable: false,
        rulesetData: {
            meta: {},
            stream: ''
        }
    };
}

export async function createRuleset(body: string, meta: documentMeta, callback: (successful: boolean, rulesetKey: string) => void){
    let resp = undefined;
    try{
        let accessToken = '';
        if(sessionStorage['accessToken']){
            accessToken = sessionStorage['accessToken'].toString();
        }
        
        resp = await fetch(`http://localhost:8080/rulesets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({ body: body, meta: meta })
        });
    }catch(err){
        // handle fetch errors
        callback(false, "");
    }

    if(resp){
        let key = (await resp.json()).key;

        if(resp.status == 201){
            callback(true, key);
        }else{
            callback(false, key);
        }
    }
}

export async function editRuleset(id: string, body: string, meta: documentMeta, callback: (successful: boolean) => void){
    let resp = undefined;
    try{
        let accessToken = '';
        if(sessionStorage['accessToken']){
            accessToken = sessionStorage['accessToken'].toString();
        }
        
        resp = await fetch(`http://localhost:8080/rulesets`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({ body: body, meta: meta, id: id })
        });
    }catch(err){
        // handle fetch errors
        callback(false);
    }

    if(resp){
        if(resp.status == 200){
            callback(true);
        }else{
            callback(false);
        }
    }
}

export async function deleteRuleset(id: string, meta: documentMeta, callback: (successful: boolean) => void){
    const rulesetTitle = scrubTitleString(meta.title);
    const rulesetKey = (rulesetTitle + "-" + id);

    let resp = undefined;
    try{
        resp = await fetch(`http://localhost:8080/rulesets/${rulesetKey}`, {
            method: 'DELETE',
            headers: {
                'Authorization': sessionStorage['accessToken'].toString()
            }
        });
    }catch(err){
        // handle fetch errors
        callback(false);
    }

    if(resp){
        if(resp.status == 204){
            callback(true);
        }else{
            callback(false);
        }
    }
}

export function generateUUID(){
    return self.crypto.randomUUID();
}

export function generateBlockIndex(maxRange: number){
    // get a random value in the range, round and pad to the maximum range's length
    const indexVal = Math.floor(Math.random() * maxRange);
    return indexVal.toString().padStart(maxRange.toString().length, "0");
}

export function scrubTitleString(title: string): string{
    const disallowedChars = /[+=_|\\/?\":;<>{}\[\]`^#%~.]/g;
    var firstScrub = title.toLowerCase().replace(disallowedChars, '').trim().substring(0, 32); // cut off at 32 characters for brevity
    return firstScrub.replace(/ /g, "-");
}

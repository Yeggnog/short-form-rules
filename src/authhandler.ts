import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommandInput, ResendConfirmationCodeCommand, GlobalSignOutCommand, DeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { config } from './config';

const cognitoClient = new CognitoIdentityProviderClient({
    region: config.region,
});

export async function createUser(username: string, password: string, email: string, callback: (successful: boolean) => void){
    const params = {
        ClientId: config.clientId,
        Username: username,
        Password: password,
        UserAttributes: [
            { Name: "email", Value: email },
        ],
    };
    
    try {
        const command = new SignUpCommand(params);
        const response = await cognitoClient.send(command);

        if(response){
            callback(true);
        }
    } catch (error) {
        callback(false);
    }
}

export async function confirmUser(username: string, confirmCode: string, callback: (successful: boolean, err: Error | undefined) => void){
    const params = {
        ClientId: config.clientId,
        Username: username,
        ConfirmationCode: confirmCode
    };

    try {
        const command = new ConfirmSignUpCommand(params);
        const response = await cognitoClient.send(command);

        if(response){
            callback(true, undefined);
        }
    }catch(error: any) {
        callback(false, error);
    }
}

export async function resendConfirmation(username: string, callback: (successful: boolean, err: Error | undefined) => void){
    const params = {
        ClientId: config.clientId,
        Username: username
    };

    try {
        const command = new ResendConfirmationCodeCommand(params);
        const response = await cognitoClient.send(command);

        if(response){
            callback(true, undefined);
        }
    }catch(error: any) {
        callback(false, error);
    }
}

export async function loginUser(username: string, password: string, callback: (successful: boolean, error: any) => void){
    const params = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: config.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
    } as InitiateAuthCommandInput;

    try {
        const command = new InitiateAuthCommand(params);
        const { AuthenticationResult } = await cognitoClient.send(command);

        if (AuthenticationResult) {
            // write login info to session storage
            sessionStorage.setItem("accessToken", AuthenticationResult.AccessToken || '');
            sessionStorage.setItem("username", username); // username is written separately for access without decoding the access token
            
            callback(true, undefined);
        }
    } catch (error) {
        callback(false, error);
    }
}

export async function logoutUser(callback: (successful: boolean) => void){
    let accessToken = sessionStorage.getItem('accessToken');

    if(accessToken){
        try{
            const command = new GlobalSignOutCommand({ AccessToken: accessToken });
            await cognitoClient.send(command);

            callback(true);
        }catch(error: any){
            callback(false);
        }

        sessionStorage.clear();
    }else{
        callback(true);
    }
}

export async function deleteUser(callback: (successful: boolean, error: Error | undefined) => void){
    let accessToken = sessionStorage.getItem('accessToken');

    if(accessToken){
        try{
            const command = new DeleteUserCommand({ AccessToken: accessToken });
            await cognitoClient.send(command);

            callback(true, undefined);
        }catch(error: any){
            callback(false, error);
        }

        sessionStorage.clear();
    }else{
        callback(false, new Error("The user must be logged in."));
    }
}

export async function authChallenge(rulesetKey: string, callback: (successful: boolean) => void){
    let accessToken = sessionStorage.getItem('accessToken');

    if(accessToken){
        let resp = undefined;
        try{
            resp = await fetch(`http://localhost:8080/rulesets/auth/${rulesetKey}`, {
                method: 'GET',
                headers: {
                    'Authorization': sessionStorage['accessToken'].toString()
                }
            });
        }catch(err){
            // handle fetch/auth errors
            return callback(false);
        }

        if(resp){
            if(resp.status == 200){
                return callback(true);
            }else{
                return callback(false);
            }
        }
    }
}

// Utility functions
export function evaluatePassword(password: string){
    const uppercaseTest = /[A-Z]+/;
    const lowercaseTest = /[a-z]+/;
    const numberTest = /[0-9]+/;
    const specialCharTest = /[\^\*\[\]\(\)\+\/\\\$><':;|_~!"{}=-@#%&.,`?]+/;

    let results = {
        length: (password.length >= 8),
        uppercase: uppercaseTest.test(password),
        lowercase: lowercaseTest.test(password),
        number: numberTest.test(password),
        specialChar: specialCharTest.test(password)
    };
    const valid = (results.length && results.uppercase && results.lowercase && results.number && results.specialChar);

    return {valid: valid, criteria: results};
}

export function evaluateNotEmpty(username: string){
    return /\S+/.test(username);
}

export function evaluateConfirmCode(code: string){
    const numberTest = /^[0-9]+$/;

    const allNumbers = numberTest.test(code);
    const rightLength = (code.length == 6);

    return (allNumbers && rightLength);
}

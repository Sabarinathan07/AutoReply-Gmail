const fs = require("fs").promises;
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

// defining the required Oauth scopes for gmail api
const SCOPES = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.labels",
];

// defining the file paths that contain token and credentials
const TOKEN_PATH = path.join(process.cwd(), "/auth/token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "/auth/credentials.json");

// function to load the saved gmail credentials if exist
const loadSavedCredentialsIfExist = async () => {
    try {
        // read the token file
        const content = await fs.readFile(TOKEN_PATH);
        // parse into string into json 
        const credentials = JSON.parse(content);
        // create google auth object will be used for all the gmail functions
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
};

// function to save the gmail credentials to file called token.json
const saveCredentials = async (client) => {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const { installed, web } = JSON.parse(content);
    const { client_id, client_secret } = installed || web;

    // convert json object to string
    const payload = JSON.stringify({
        type: "authorized_user",
        client_id,
        client_secret,
        refresh_token: client.credentials.refresh_token,
    });

    await fs.writeFile(TOKEN_PATH, payload);
};

// function to get a new access token using the refresh token
const authorize = async () => {
    // try to load saved credentials
    const existingCredentials = await loadSavedCredentialsIfExist();
    if (existingCredentials) {
        // if there is a saved credentials return them
        return existingCredentials;
    }

    // if no saved credentials authenticate and get new credentials
    const newCredentials = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });

    // save the new credentials
    if (newCredentials.credentials) {
        await saveCredentials(newCredentials);
    }

    // return the obtained credentials
    return newCredentials;
};

// explore the authorize function to use in other modules
module.exports = {
    authorize,
};

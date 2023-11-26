const fs = require("fs").promises;
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const SCOPES = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.labels",
];

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

const loadSavedCredentialsIfExist = async () => {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
};

const saveCredentials = async (client) => {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const { installed, web } = JSON.parse(content);
    const { client_id, client_secret } = installed || web;

    const payload = JSON.stringify({
        type: "authorized_user",
        client_id,
        client_secret,
        refresh_token: client.credentials.refresh_token,
    });

    await fs.writeFile(TOKEN_PATH, payload);
};

const authorize = async () => {
    const existingCredentials = await loadSavedCredentialsIfExist();
    if (existingCredentials) {
        return existingCredentials;
    }

    const newCredentials = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });

    if (newCredentials.credentials) {
        await saveCredentials(newCredentials);
    }

    return newCredentials;
};

module.exports = {
    authorize,
};

import { google } from "googleapis";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const NODE_ENV = process.env.NODE_ENV;
const REDIRECT_URI_LOCAL = process.env.REDIRECT_URI_LOCAL;
const REDIRECT_URI_WEB = process.env.REDIRECT_URI;

const REDIRECT_URI = NODE_ENV === "development" ? REDIRECT_URI_LOCAL : REDIRECT_URI_WEB;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

export const getGoogleAuthUrl = (state?: string) => {
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ];

    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes,
        state: state
    });
};

export const getGoogleUserInfo = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
    });

    const { data } = await oauth2.userinfo.get();
    return data;
};

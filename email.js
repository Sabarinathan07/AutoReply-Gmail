const { google } = require("googleapis");

const listEmails = async (auth) => {
    const gmail = google.gmail({ version: "v1", auth });

    try {
        const response = await gmail.users.messages.list({
            userId: "me",
            labelIds: ["INBOX"],
        });
        return response.data.messages || [];
    } catch (error) {
        throw new Error(`Error listing messages: ${error.message}`);
    }
};


const sendAutoReply = async (auth, messageId) => {
    const gmail = google.gmail({ version: "v1", auth });

    try {
        const email = await gmail.users.messages.get({
            userId: "me",
            id: messageId,
        });
        const headers = email.data.payload.headers;
        const fromHeader = headers.find((header) => header.name === "From");
        const toEmail = fromHeader ? fromHeader.value : undefined;
        const SenderName = toEmail.split(' ')[0];
        const toHeader = headers.find((header) => header.name === "To");
        const fromEmail = toHeader ? toHeader.value : undefined;
        const subjectHeader = headers.find(
            (header) => header.name === "Subject"
        );

        const subject = subjectHeader ? subjectHeader.value : undefined;

        if (!toEmail) throw new Error("Sender Email Address is not Found!");
        if (!fromEmail)
            throw new Error("Authorised Email Address is not Found!");

        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString(
            "base64"
        )}?=`;

        const autoReplyMessage1 =
            "I hope this message finds you well. Thank you for reaching out to me. Your email has been received, and I appreciate the time you took to contact me.";

        const autoReplyMessage2 =
            "Please know that I am available from Monday - Friday between 10:00 AM - 7:00 PM.";
        const messageParts = [
            `From: <${fromEmail}>`,
            `To: ${toEmail}`,
            "Content-Type: text/html; charset=utf-8",
            "MIME-Version: 1.0",
            `Subject: Re: ${utf8Subject}`,
            "",
            `Hi ${SenderName}! <br><br><br><br>`,
            "",
            `${autoReplyMessage1} <br><br><br>`,
            "",
            `${autoReplyMessage2}`,
        ];
        const message = messageParts.join("\n");

        // The body needs to be base64url encoded.
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });

        console.log(`Email has been sent to the ${toEmail}`);
       
    } catch (error) {
        console.error(`Error while replying email ${error.message}`);
    }
};

const isEmailThreadUnanswered = async (auth, threadId) => {
    try {
        const thread = await fetchThreadWithId(auth, threadId);

        if (thread.messages.length > 0) {
            const firstMessage = thread.messages[0];
            const secondMessage = thread.messages[1];

            return (
                (firstMessage.labelIds &&
                    (firstMessage.labelIds.includes("AutoReply") ||
                        firstMessage.labelIds.includes("Label_2") ||
                        firstMessage.labelIds.includes("SENT"))) ||
                (secondMessage &&
                    (secondMessage.labelIds.includes("SENT") ||
                        secondMessage.labelIds.includes("AutoReply")))
            );
        }
        return false;
    } catch (error) {
        console.error(`Error checking replies: ${error.message}`);
        return false;
    }
};

const fetchThreadWithId = async (auth, threadId) => {
    const gmail = google.gmail({ version: "v1", auth });

    try {
        const response = await gmail.users.threads.get({
            userId: "me",
            id: threadId,
        });
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching thread with id: ${error.message}`);
    }
};

const addLabel = async (auth, messageId, labelName) => {
    try {
        const gmail = google.gmail({ version: "v1", auth });
        const existingLabels = await gmail.users.labels.list({ userId: "me" });

        const label = existingLabels.data.labels.find((l) => l.name === labelName);

        if (!label) {
            const createdLabel = await gmail.users.labels.create({
                userId: "me",
                requestBody: { name: labelName },
            });
            labelName = createdLabel.data.id;
        } else {
            labelName = label.id;
        }

        await gmail.users.messages.modify({
            userId: "me",
            id: messageId,
            requestBody: { addLabelIds: [labelName] },
        });
    } catch (error) {
        throw new Error(`Error in labeling: ${error.message}`);
    }
};

module.exports = {
    listEmails,
    sendAutoReply,
    isEmailThreadUnanswered,
    fetchThreadWithId,
    addLabel,
};

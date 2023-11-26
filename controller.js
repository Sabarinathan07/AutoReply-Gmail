const auth = require("./auth");
const email = require("./email");

const checkEmail = async () => {
    try {
        const authClient = await auth.authorize();
        const messages = await email.listEmails(authClient);

        for (const message of messages) {
            const { id: messageId, threadId } = message;
            const labelName = "AutoReply";

            if (!(await email.isEmailThreadUnanswered(authClient, threadId))) {
                await email.sendAutoReply(authClient, messageId);
                await email.addLabel(authClient, messageId, labelName);
            }
        }
        console.log("Unanswered Thread emails have been replied!");
    } catch (error) {
        console.error("Error:", error.message);
    }
};

module.exports = {
    checkEmail,
};



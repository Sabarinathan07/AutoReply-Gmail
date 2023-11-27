// import the auth and email modules
const auth = require("./auth/auth");
const emailUtils = require("./utils/emailUtils");

// defining a function to reply unanswered emails
const replyUnansweredEmail = async () => {
    try {
        // authorize and obtain the authenticated email
        const authClient = await auth.authorize();

        // retrieve list of emails of the authenticated user's email
        const emails = await emailUtils.listEmails(authClient);

        // iterate each email 
        for (const email of emails) {
            const { id: emailId, threadId } = email;
            const labelName = "AutoReply";

            // check if the email thread has been answered or not
            if (!(await emailUtils.isEmailThreadAnswered(authClient, threadId))) {
                // if it does not have any replies it will send an auto reply email
                await emailUtils.sendAutoReply(authClient, emailId);

                // add a label called AutoReply to that email
                await emailUtils.addLabel(authClient, emailId, labelName);
            }
        }

        // log a  success message after processing all the emails
        console.log("Unanswered Thread emails have been replied!");
    } catch (error) {
        console.error(`Error while checking unanswered email: ${error.message}`);
    }
};

// export the function to use in other modules
module.exports = {
    replyUnansweredEmail,
};



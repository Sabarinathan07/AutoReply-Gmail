const controller = require("./controller");

const runApplication = async() => {
    console.log("Application has been started!");
    try {
        await controller.checkEmail();
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
    
    // Set up an interval to invoke the function every 45 to 120 seconds
    setInterval(async () => {
        try {
            await controller.checkEmail();
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }, getRandomInterval());
};

const getRandomInterval = () => {
    // Generate a random number between 45 and 120 seconds
    return Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000; // Convert to milliseconds
};

// Call the runApplication function to start the interval
runApplication();

export const error = (message: string | undefined) => {
    if(message ){
        console.log("Error on Orange Cat: ");
        console.log("   " + message);
        console.log(".");
        process.exit(1);
    }
}
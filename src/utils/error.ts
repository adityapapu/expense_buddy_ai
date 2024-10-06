export const getErrorMessage = (error: unknown, defaultMsg?: string): string => {
    let message: string = defaultMsg ?? "Something went wrong";  // Allows for customizable default message

    if (error instanceof Error) {
        message = error.message;
    } else if (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
        message = (error as { message: string }).message;  // Ensures the message is actually a string
    } else if (typeof error === "string") {
        message = error;
    } else if (!message) {  // Handles cases where default message is not set and no other condition is met
        message = "An unknown error occurred.";
    }

    return message;
};

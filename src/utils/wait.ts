export const wait = (delayInMillis = 0): Promise<void> => {
    return new Promise(res => setTimeout(res, delayInMillis));
};

export function randomize(startNum, endNum) {
    if (startNum > endNum) {
        console.log("Error startNum must be less then endNum");
        return;
    } else
        return Math.floor(Math.random() * (endNum - startNum + 1)) + startNum;
}

export function getLimitedCount(count, maxCount) {
    return Math.min(count, maxCount);
}

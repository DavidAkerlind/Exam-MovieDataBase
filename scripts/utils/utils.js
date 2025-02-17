export function randomize(startNum, endNum) {
    console.log("randomize()");
    if (startNum > endNum) {
        console.log("Error startNum must be less then endNum");
        return;
    } else
        return Math.floor(Math.random() * (endNum - startNum + 1)) + startNum;
}

export function getLimitedCount(count, maxCount) {
    console.log("getLimitedCount()");

    return Math.min(count, maxCount);
}

export function shuffleArray(array) {
    console.log("shuffleArray()");

    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [
            shuffledArray[j],
            shuffledArray[i],
        ];
    }
    return shuffledArray;
}

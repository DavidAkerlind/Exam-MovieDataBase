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

export async function checkImageExists(url) {
    console.log("checkImageExists()");

    if (!url || url === "N/A") {
        console.log("Invalid URL:", url);
        return "./res/icons/missing-poster.svg";
    }

    try {
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
            throw new Error("Image does not exist");
        }
        return url;
    } catch (error) {
        console.log(error.message);
        return "./res/icons/missing-poster.svg";
    }
}

export function extractTitle(text) {
    return text.replace(/\s-\s\([^)]*\)$/, "");
}

export function getBasePath() {
    return window.location.hostname === "davidakerlind.github.io"
        ? "/Exam-MovieDataBase"
        : "";
}

export function getCurrentPath() {
    return window.location.pathname.replace(getBasePath(), "");
}
export function adjustPath(basePath) {
    return window.location.pathname.replace(basePath, "");
}

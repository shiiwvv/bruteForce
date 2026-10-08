export const capitalizeInitialsInString = (str) => {
    return str
        .split(" ")
        .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
        .join(" ");
};

export const capitalizeInitialsInStringWithHyphen = (str) => {
    return str
        .split("-")
        .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
        .join(" ");
};

export const platformConfig = [
    "leetcode",
    'geeksforgeeks',
    "gfg",
    "codeforces",
    "codechef",
]; 
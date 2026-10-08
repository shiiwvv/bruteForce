
import { capitalizeInitialsInString, platformConfig, capitalizeInitialsInStringWithHyphen } from "./constants.js"

document.addEventListener("DOMContentLoaded", async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("chrome: ", chrome);
    console.log("activeTab: ", activeTab);


    if (activeTab && activeTab.url) {
        const statusMsg = document.getElementById("status-msg");

        const urlArray = activeTab.url.split("/");
        console.log("urlArray: ", urlArray);
        const platformArray = urlArray[2].split(".");
        console.log("platformArray: ", platformArray);

        const platformName = (platformArray.length === 3) ? platformArray[1] : platformArray[0];
        console.log("platform Name : ", platformName);
        let problemTitle = null;
        if (platformName === "leetcode" || platformName === "geeksforgeeks") {
            problemTitle = urlArray[4];
        }
        if (!platformConfig.includes(platformName)) {
            showStatus("Platform not supported", "text-rose-500");
            return;
        }

        document.getElementById('link').value = activeTab.url;
        document.getElementById('platform').value = capitalizeInitialsInString(platformName);
        if (problemTitle) {
            document.getElementById('title').value = capitalizeInitialsInStringWithHyphen(problemTitle);
        }
    }
})

document.getElementById('save-btn').addEventListener('click', async (event) => {
    const saveBtn = document.getElementById("save-btn");
    const statusMsg = document.getElementById("status-msg");
    const platformName = document.getElementById("platform").value;

    console.log("Check Flag One");

    if (!platformConfig.includes(platformName.toLowerCase())) {
        showStatus("Platform not supported", "text-rose-500");
        return;
    }

    console.log("Check Flag One");
    const reminderTime = document.getElementById("reminderTime").value;
    console.log("reminder : ", reminderTime);
    const problemData = {
        title: document.getElementById("title").value,
        platform: document.getElementById("platform").value,
        topic: document.getElementById("topic").value,
        difficulty: document.getElementById("difficulty").value,
        time: document.getElementById("time").value,
        link: document.getElementById("link").value,
        notes: document.getElementById("notes").value,
        solved: document.getElementById("solved").checked,
        // Only include reminderTime if the user selected a date
        ...(reminderTime && { ISOString: new Date(reminderTime).toISOString() })
    };

    if (!problemData.title || !problemData.platform || !problemData.topic || !problemData.link) {
        showStatus("Please fill all required fields.", "text-rose-500");
        return;
    }

    console.log("problemData: ", problemData);

    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    try {
        const response = await fetch("http://localhost:1000/api/v1/problem/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(problemData)
        });

        console.log("CheckPoint One");
        if (response.status === 401) {
            showStatus("Unauthorized. Please log in to BruteForce.", "text-rose-500");
            saveBtn.textContent = "Save Problem";
            saveBtn.disabled = false;
            return;
        }

        if (response.ok) {
            console.log("CheckPoint Two");
            showStatus("Problem saved successfully!", "text-emerald-500");
        } else {
            console.log("CheckPoint Three");
            const errorData = await response.json();
            showStatus(errorData.message || "Failed to save.", "text-rose-500");
            saveBtn.textContent = "Save Problem";
            saveBtn.disabled = false;
        }
    } catch (error) {
        console.log("CheckPoint Four");
        console.log("error : ", error);
        showStatus("Server error.", "text-rose-500");
        saveBtn.textContent = "Save Problem";
        saveBtn.disabled = false;
    }
});


function showStatus(message, colorClass) {
    const statusMsg = document.getElementById("status-msg");
    statusMsg.textContent = message;
    statusMsg.className = `mt-3 p-2 rounded-md text-xs text-center font-medium block ${colorClass} bg-[#1c1f26] border border-[#2b303b]`;
}





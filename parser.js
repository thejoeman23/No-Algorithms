function runBetterCSS(code) {
    console.log("Running BetterCSS parser...");

    // --- Rule 1: "in" condition ---
    const ruleRegex = /if\s+(not\s+)?(.+?)\s+in\s+(.+?)\s*\{([\s\S]*?)\}/g;
    code = code.replace(ruleRegex, (match, not, childSel, parentSel, css) => {
        console.log(match, not, childSel, parentSel, css);
        const isNot = !!not;
        console.log(isNot)
        const parent = document.querySelector(parentSel.trim());
        const exists = parent && parent.querySelector(childSel.trim());
        const conditionPassed = isNot ? !exists : exists;

        if (conditionPassed) {
            injectCSS(css.trim() + "}");
        }

        // Remove this match from the code by replacing it with an empty string
        return "";
    });

    // --- Rule 2: "content has" condition ---
    const ruleRegex1 = /if\s+(not\s+)?(.+?)(lowercase\s+)?content\s+has\s*(.+?)\s*\{([\s\S]*?)\}/g;
    code = code.replace(ruleRegex1, (match, not, elSel, lowercase, value, css) => {
        const isNot = !!not;
        const el = document.querySelector(elSel.trim());
        let val = value.trim();

        // Safely remove quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }

        if (el) {
            const text = lowercase ? el.textContent.toLowerCase() : el.textContent;
            const compareVal = lowercase ? val.toLowerCase() : val;
            const exists = text.includes(compareVal);
            const conditionPassed = isNot ? !exists : exists;
            if (conditionPassed) {
                injectCSS(css.trim());
            }
        } else if (isNot) {
            // If element doesn’t exist and it’s a "not" rule
            injectCSS(css.trim() + "}");
        }

        // Remove this match from the code
        return "";
    });

    // --- Inject remaining normal CSS ---
    if (code.trim()) {
        injectCSS(code.trim());
        console.log("Injected remaining CSS:\n" + code.trim());
    }
}

function injectCSS(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    console.log("Injected CSS:\n" + css);
}

console.log("Loading block.bettercss...");

fetch(chrome.runtime.getURL("./sites/block.bettercss"))
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load block.bettercss: " + response.status);
        }
        return response.text();
    })
    .then(runBetterCSS)
    .catch(err => console.error(err));

// fetch("block.bettercss")
//     .then(response => {
//         if (!response.ok) {
//             throw new Error("Failed to load block.bettercss: " + response.status);
//         }
//         return response.text();
//     })
//     .then(runBetterCSS)
//     .catch(err => console.error(err));
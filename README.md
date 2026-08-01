# ⏱️ The Chrono Tracker

> A lightning-fast, local-storage enabled time and code tracking utility. Never lose a shift log to a phantom browser refresh again.

Welcome to the modern era of shift tracking. Formerly the *Mara Code Tracker*, this application has been completely rebuilt from the ground up in React to provide a sleek, uninterrupted workflow for professionals who need to document their daily activities without the fuss of heavy databases or clunky interfaces. 

## ✨ The Brilliant Bits (Features)

*   **Zero-Latency Logging:** Powered entirely by the browser's `localStorage`. Your data is saved the absolute millisecond you log it. 
*   **Intelligent Visual Grouping:** Taking a breather? The Chronograph automatically stitches your departure codes (like Lunch or Break) to your subsequent Login, giving you a beautiful, unified block of time away from the desk.
*   **Quick Action Hotkeys:** One-click deployment for your most common codes (`BR1`, `LUN`, `USB/RR`, `MEE`, `CAN`, `TRA`). 
*   **Bespoke TXT Export:** Ditch the archaic email drafts. One click generates a dynamically named `.txt` file of your daily logs, instantly downloaded and ready to share.
*   **Adaptive UI (Light & Dark Mode):** Because staring at a blinding white screen at 2:00 AM is absolutely dreadful. Toggle themes with a single click.

## 🛠️ The Tech Stack

*   **Core:** React (Functional Components & Hooks)
*   **Styling:** Pure, unadulterated CSS with dynamic custom properties (variables) for seamless theme switching.
*   **Memory:** HTML5 `localStorage` API.
*   **Export Handling:** Native JS Blob and Object URL generation.

## 🚀 Getting Started

Want to run the Chronograph locally? It’s a doddle. 

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/ChrisCamJS/chrono-tracker.git
   \`\`\`
2. **Navigate into the directory:**
   \`\`\`bash
   cd chriscam-chronograph
   \`\`\`
3. **Install the dependencies:**
   \`\`\`bash
   npm install
   \`\`\`
4. **Spin up the development server:**
   \`\`\`bash
   npm start
   \`\`\`

## 📖 How to Use

1. **Start Your Day:** Hit the **Log In** button.
2. **Custom Notes:** Need to log something specific? Type it into the input field and hit `Enter` (or click a quick action to attach your custom note to a specific code).
3. **Step Away:** Click `BR1`, `LUN`, or `BR2`. When you return and click **Log In**, the app will magically pair your departure and return times into one visually grouped block.
4. **Wrap It Up:** At the end of your shift, click **Export to .TXT**, grab your file, and click **Clear Logs** to wipe the slate clean for tomorrow. 

## 👨‍💻 Developer & Credits

Designed and engineered by **Christopher Cameron Tow**. 
*   **Portfolio:** [ChrisCam.pro](https://chriscam.pro)

---
*Stay tracked, stay tidy, and never lose a timestamp again.*

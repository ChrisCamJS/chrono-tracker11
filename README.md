# ⏱️ Chrono Tracker

A robust, React-based time tracking utility designed for seamless workflow logging, session management, and time auditing. 

## ✨ Features

* **Smart Session Tracking:** Quick Action buttons toggle between "Start" and "End" states. The tracker strictly enforces active sessions, preventing you from accidentally starting a new task without closing the current one.
* **Live Active Totals:** Calculates real-time durations for key metrics (`Case Notes`, `USB/RR`, `IT Issues`, `Meeting`, `Training`, and `Outbound Call`) down to the second.
* **Persistent Memory:** Fully integrated with `localStorage`. Your logs, active sessions, and theme preferences survive browser refreshes and accidental tab closures.
* **Custom Notes Integration:** Type a custom note and click a Quick Action button to seamlessly append the note to the code (e.g., `Case Notes - Spoke with client`).
* **Advanced Editing & Auditing:**
  * Edit the text of any log without breaking the background time calculations.
  * Edit the timestamp of any log (capped at 2 edits to prevent time-travel abuse).
  * Edited times permanently display an *(originally: [time])* stamp for accurate auditing.
* **.TXT Exporting:** Instantly download a cleanly formatted text file containing your daily logs and calculated totals.
* **Immersive UI/UX:**
  * Full Light/Dark mode support.
  * Native Fullscreen API integration for distraction-free tracking.
  * Visual session linking (matching colored borders connect your Start and End punches).
  * Fully responsive mobile and desktop layouts.

## 🚀 Built With

* **React** (Hooks: `useState`, `useEffect`)
* **Vite** (Build Tool)
* **Vanilla CSS** (Custom CSS Grid & Flexbox, no external libraries)

## 👤 Author

Designed and Developed by **Christopher Cameron Tow**

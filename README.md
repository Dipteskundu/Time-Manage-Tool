# ⏳ Time Management Plan Generator

## 📌 Description
The **Time Management Plan Generator** is a lightweight web application that transforms your daily tasks and available hours into a balanced, time‑blocked schedule. It helps you stay focused, avoid burnout, and visually track your progress throughout the day.

## 🔗 Live Project
- Live demo: https://time-mangement-tool.netlify.app/

## 🖼️ Project Preview
<p align="left">
  <img src="https://i.ibb.co.com/TqDc7hJV/Screenshot-2025-12-23-201401.png" alt="Time Management Plan Generator preview" width="60%">
</p>

## �️ Technologies Used
- HTML5
- Tailwind CSS (CDN + CLI for local builds)
- Vanilla JavaScript (ES6+)
- Google Fonts (Outfit)

## 🚀 Core Features
- ⚡ Smart scheduling algorithm that distributes tasks using the Fisher–Yates shuffle.
- 🌡️ Dynamic intensity modes:
  - **Same Day (🌤️)** – gentle pace with ~40% break time.
  - **Normal Day (⚡)** – balanced 75/25 work–break ratio.
  - **Hustle Mode (🔥)** – focused ~85% work time for deadlines.
- 🎨 Responsive glassmorphism UI with gradients and micro‑animations.
- ⌨️ Quick task entry with keyboard‑friendly inputs.
- ⏱️ Real‑time timeline and progress tracking.
- 🏆 Gamified completion state to celebrate finishing your plan.

## � Dependencies
**Runtime / CDN**
- Tailwind CSS CDN – `https://cdn.tailwindcss.com`
- Google Fonts – Outfit family

**Development**
- Node.js and npm (for local tooling)
- `tailwindcss` (dev dependency, see `package.json`)

## 🧑‍💻 Run the Project Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/TimeManagementApp.git
   cd TimeManagementApp
   ```

2. **Open directly in the browser (simplest)**
   - Open `index.html` in your browser, or  
   - Use an extension like “Live Server” in VS Code to serve the file.

3. **(Optional) Work with Tailwind locally**
   - Install dependencies:
     ```bash
     npm install
     ```
   - Build Tailwind CSS:
     ```bash
     npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
     ```
   - Serve `index.html` from the project root using any static server  
     (for example, VS Code Live Server or `npx serve .`).

## 📚 Links & Resources

- Source code (local project): this repository
- Tailwind CSS docs: https://tailwindcss.com/docs
- Google Fonts – Outfit: https://fonts.google.com/specimen/Outfit

# SRT Checker

A lightweight and modern web application to validate and analyze `.srt` subtitle files.
Built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

🔗 **Live Demo [here](https://srt-checker-x44f.vercel.app/)**

## 🚀 Features

Ensure your subtitles meet standard broadcasting or reading requirements with these checks:

- **Drag & Drop Interface**: Easily upload your `.srt` files.
- **Minimum Time Gap**: Check if there is enough time between two subtitle blocks (configurable in ms).
- **Length Validation**:
  - **Max characters per subtitle**: Warns if a block contains too much text.
  - **Max characters per line**: Ensures lines aren't too long for the screen.
- **Display Options**: Toggle between showing subtitle index numbers or start timecodes for easier debugging.

## 🛠 Tech Stack

- Next.js] (App Router)
- TypeScript
- Tailwind CSS

## 📦 Getting Started

To run the project locally, follow these steps:

### Prerequisites

Make sure you have `node` and `npm` (or `yarn`/`pnpm`/`bun`) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/gabinollier/srt-checker.git](https://github.com/gabinollier/srt-checker.git)
   cd srt-checker

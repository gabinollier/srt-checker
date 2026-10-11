# SRT Checker

A lightweight web application to validate and analyze `.srt` subtitle files.

## Features

`.srt` (SubRip Text) files are used to store video subtitles. These subtitles, in order to be comply with the readability standards, 
need to meet a series of requirements, which this app helps to check :
- Minimum Time Gap: Check if there is enough time between two subtitle blocks (configurable in ms).
- Length Validation:
  - Max characters per subtitle: Warns if a block contains too much text.
  - Max characters per line: Ensures lines aren't too long for the screen.

## Getting Started

To run the project locally, follow these steps:

Make sure you have `node` and `npm` (or `yarn`/`pnpm`/`bun`) installed on your machine, then :

```bash
   git clone https://github.com/gabinollier/srt-checker.git
   cd srt-checker
   npm run dev
```

![logo-github](https://github.com/ryohey/signal/assets/5355966/8f28894d-b3e0-45ae-9216-fbec0800d91b)

![Node.js CI](https://github.com/ryohey/signal/workflows/Node.js%20CI/badge.svg) [![Join the chat at https://discord.gg/XQxzNdDJse](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/XQxzNdDJse)

signal is a user-friendly music sequencer application developed using web technology, designed for seamless, cross-platform use.

## Goals

- **Cross-Platform Compatibility:** Ensure accessibility across various devices and operating systems.
- **Simple User Interface:** Focus on an intuitive, non-complicated user interface for ease of use.
- **MIDI Compatibility:** Support for MIDI format to facilitate a wide range of music production needs.

## Concepts

signal is conceptualized not as a replacement for a Digital Audio Workstation (DAW), but as a complementary tool. It excels during the initial stages of music composition and sketching, allowing artists to quickly and efficiently lay down their musical ideas. To keep the focus on composition without distractions, signal comes with intentional limitations:

- **Basic Sound Quality:** Prioritizes simplicity over high-quality sound production.
- **No Effects (Fx):** Excludes sound effects to streamline the music creation process.
- **Lightweight Design:** Optimized for minimal resource usage, ensuring a fast and responsive user experience.

By setting these constraints, signal aims to offer a streamlined and distraction-free environment, ideal for artists focusing on the core aspects of musical composition and idea development.

## Setup Instructions

### Cloning the Repository

1. Open your terminal.
2. Clone the repository by running:
   ```sh
   git clone https://github.com/ryohey/signal.git
   ```
3. Navigate into the project directory:
   ```sh
   cd signal
   ```

### Setting up Firebase Configuration

1. This project uses Firebase. If you haven't already, create a Firebase project at the [Firebase Console](https://console.firebase.google.com/).
2. Once your Firebase project is set up, navigate to the project settings in the Firebase Console.
3. Under the 'General' tab, you will find your Firebase configuration settings (API key, Auth domain, etc.).
4. Keep this information handy as you will need it to set up your environment variables.

### Configuring Environment Variables

1. Locate the `.env.example` file in the root directory of the project.
2. Copy the contents of `.env.example` into a new file named `.env` in the same directory.
3. Replace the placeholder values in the `.env` file with your Firebase configuration values:
   - `FIREBASE_API_KEY` - Your Firebase API key
   - `FIREBASE_AUTH_DOMAIN` - Your Firebase Auth domain
   - `FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
   - `FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
   - `FIREBASE_APP_ID` - Your Firebase app ID

### Installing Dependencies

1. In the project root directory, run the following command to install the required dependencies:
   ```sh
   npm install
   ```

### Running the Application

1. To start the application, run:
   ```sh
   npm start
   ```
2. The application should now be running on [http://localhost:3000](http://localhost:3000).

## Contribution

As the creator of signal, I, @ryohey, welcome any form of contribution to this music sequencer application. Your support, whether it's through code improvements, bug fixes, or feedback, is invaluable in enhancing and evolving signal.

### Reporting Bugs

- Encountered a bug? Please use [GitHub Issues](https://github.com/ryohey/signal/issues) to report it. Your reports are crucial in identifying and resolving problems, ensuring a smoother experience for everyone.

### Join Our Discord Community

- I've set up a [Discord community](https://discord.gg/XQxzNdDJse) for signal users. It's a space for mutual support, sharing tips, and discussing music production. Your participation would be a wonderful addition to our growing community.

### Support Through GitHub Sponsors

- signal is a personal project that I've been passionately developing. If you like what you see and wish to support my efforts, you can do so through [GitHub Sponsors](https://github.com/sponsors/ryohey). Even the smallest contribution can make a significant difference and is deeply appreciated.

Your engagement, big or small, contributes greatly to the development of signal. Thank you for being a part of this journey, and I'm eager to see the impact of your contributions on this application.

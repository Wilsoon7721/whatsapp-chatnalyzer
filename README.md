# WhatsApp Chatnalyzer

WhatsApp Chatnalyzer is a tool designed to help users extract various statistics based on their WhatsApp chat exports. It provides insights into messaging patterns, participant contributions, and more in a user-friendly interface.

## Features

- Upload WhatsApp chat text files or ZIP files containing chat exports.
- Support for WhatsApp group chats and business accounts.
- View detailed individual and combined statistics:
  - **Individual Statistics**: Total messages, words, characters, emojis sent, along with word usage frequency.
  - **Combined Statistics**: Total messages exchanged, most used words, emojis, word usage frequency, and graphs showing messages over days, months, and years.
- All data is processed in the user's browser and not sent out to any remote servers.

## Application Demo

Check out the live version of the project [here](https://wilsoon7721.github.io/whatsapp-chatnalyzer/).

## Prefer to Host The Project Yourself?

### Prerequisites

To run the project locally, ensure that you have the following installed:

- Node.js (version >=18.0)
- npm (version >=8.0, packaged with Node.js)
- (Optional) git to clone the repository

### Installation 

To run the project for yourself, perform the following:

1. Clone the repository:
   ```bash
   git clone https://github.com/Wilsoon7721/whatsapp-chatnalyzer.git
   cd whatsapp-chatnalyzer
   ```
   If you do not wish to install `git`, you may also download the repository as a ZIP file and extract the contents into a folder before opening a command prompt in that folder.
   
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

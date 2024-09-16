# Video Platform Backend API

Welcome to the Video Platform Backend API! This API allows you to build and interact with a video platform application, providing functionalities like user registration, login, video uploading, streaming, comments, and more.

## Table of Contents

- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Video Endpoints](#video-endpoints)
  - [Feed Endpoints](#feed-endpoints)
  - [Analytics Endpoints](#analytics-endpoints)
  - [Moderation Endpoints](#moderation-endpoints)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [License](#license)

## Getting Started

To get started, clone the repository and install the dependencies:

\`\`\`bash
git clone https://github.com/rithymeth/video-planform-backend.git
cd video-platform-backend
npm install
\`\`\`

## API Endpoints

### User Endpoints

| Endpoint                     | Method | Description                          | Example Request                                                   |
| ---------------------------- | ------ | ------------------------------------ | ----------------------------------------------------------------- |
| \`/api/users/register\`        | POST   | Register a new user                  | \`{ "username": "john", "email": "john@example.com", "password": "password123" }\` |
| \`/api/users/login\`           | POST   | Log in a user                        | \`{ "email": "john@example.com", "password": "password123" }\`      |
| \`/api/users/logout\`          | POST   | Log out a user                       | Requires authentication header with token                        |
| \`/api/users/profile\`         | GET    | Get the logged-in user's profile     | Requires authentication header with token                        |
| \`/api/users/profile\`         | PUT    | Update the logged-in user's profile  | Requires authentication header and form data for update          |
| \`/api/users/change-password\` | POST   | Change the user's password           | \`{ "oldPassword": "oldpassword", "newPassword": "newpassword123" }\` |
| \`/api/users/forgot-password\` | POST   | Request a password reset             | \`{ "email": "john@example.com" }\`                                 |
| \`/api/users/reset-password/:token\` | POST   | Reset the password using token       | \`{ "newPassword": "newpassword123" }\`                             |
| \`/api/users/toggle-2fa\`      | POST   | Enable or disable two-factor auth    | Requires authentication header with token                        |
| \`/api/users/upload/profile-picture\` | POST   | Upload or update profile picture    | Requires authentication header with token and image file          |
| \`/api/users/search\`          | GET    | Search for users                     | \`?query=john\`                                                    |

### Video Endpoints

| Endpoint                       | Method | Description                          | Example Request                                                   |
| ------------------------------ | ------ | ------------------------------------ | ----------------------------------------------------------------- |
| \`/api/videos/upload\`           | POST   | Upload a new video                   | Requires authentication header with token and video file          |
| \`/api/videos/\`                 | GET    | Get all videos                       | Optional query params: \`?sortBy=createdAt&order=desc\`             |
| \`/api/videos/:id/like\`         | PUT    | Like a video                         | Requires authentication header with token                        |
| \`/api/videos/:id/comment\`      | POST   | Comment on a video                   | \`{ "text": "Nice video!" }\`                                       |
| \`/api/videos/:id/stream\`       | GET    | Stream a video                       | No request body                                                   |
| \`/api/videos/:id/analytics\`    | GET    | Get analytics for a video            | Requires authentication header with token                        |
| \`/api/videos/:id/embed\`        | GET    | Get embeddable link for a video      | No request body                                                   |
| \`/api/videos/:id\`              | DELETE | Delete a video                       | Requires authentication header with token and user authorization  |

### Feed Endpoints

| Endpoint              | Method | Description               | Example Request                                                   |
| --------------------- | ------ | ------------------------- | ----------------------------------------------------------------- |
| \`/api/feed/\`          | GET    | Get the media feed         | Requires authentication header with token                        |

### Analytics Endpoints

| Endpoint                     | Method | Description                          | Example Request                                                   |
| ---------------------------- | ------ | ------------------------------------ | ----------------------------------------------------------------- |
| \`/api/analytics/videos\`      | GET    | Get analytics for all videos         | Requires authentication header with token                        |
| \`/api/analytics/users\`       | GET    | Get analytics for all users          | Requires authentication header with token                        |

### Moderation Endpoints

| Endpoint                       | Method | Description                          | Example Request                                                   |
| ------------------------------ | ------ | ------------------------------------ | ----------------------------------------------------------------- |
| \`/api/moderation/reports\`      | GET    | Get all reports                      | Requires authentication header with admin or moderator role       |
| \`/api/moderation/reports/:id\`  | DELETE | Delete a report                      | Requires authentication header with admin or moderator role       |

## Installation

1. Clone the repository:

   \`\`\`bash
   git clone https://github.com/rithymeth/video-planform-backend.git
   \`\`\`

2. Install the dependencies:

   \`\`\`bash
   npm install
   \`\`\`

3. Set up the environment variables:

   Create a \`.env\` file in the root directory and provide the necessary environment variables.

   \`\`\`plaintext
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   MONGO_URI=your_mongodb_connection_string
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   \`\`\`

4. Start the development server:

   \`\`\`bash
   npm run dev
   \`\`\`

## Environment Variables

| Variable          | Description                                        |
| ----------------- | -------------------------------------------------- |
| \`PORT\`            | The port number the server will listen on.          |
| \`JWT_SECRET\`      | Secret key for JWT authentication.                  |
| \`MONGO_URI\`       | MongoDB connection string.                         |
| \`EMAIL_SERVICE\`   | Email service provider (e.g., \`gmail\`).            |
| \`EMAIL_USER\`      | Email address for sending emails.                  |
| \`EMAIL_PASS\`      | Password or app-specific password for the email.   |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
"""

# Social Media Automation Repository

This repository contains a social media automation application that allows posting to various platforms including Twitter and LinkedIn.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/automation-repository.git
cd automation-repository
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
JWT_SECRET="your-jwt-secret"
PORT=3000
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the application:
```bash
npm run start:dev
```

## Platform Credentials

### Twitter Credentials

To post to Twitter, you need to set up a Twitter Developer account and create an application. The following credentials are required:

- **Consumer Key (API Key)**: Your Twitter API key
- **Consumer Secret (API Secret)**: Your Twitter API secret
- **Access Token**: User-specific token for API access
- **Access Token Secret**: User-specific token secret for API access

These credentials should be stored in the database in the `PlatformCredential` table with `platform` set to `twitter`.

### LinkedIn Credentials

To post to LinkedIn, you need to set up a LinkedIn Developer account and create an application. The following credentials are required:

- **Access Token**: OAuth access token for LinkedIn API
- **User ID**: The LinkedIn user ID (the `sub` value from the ID token)

These credentials should be stored in the database in the `PlatformCredential` table with `platform` set to `linkedin`.

## Setting Up Platform Credentials

### Twitter Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new application
3. Generate consumer keys and access tokens
4. Store these credentials in your database

### LinkedIn Setup

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Create a new application
3. Configure OAuth 2.0 settings with the following scopes:
   - `w_member_social` (required for posting content)
4. Generate an access token
5. Extract the user ID (`sub` value) from the ID token
6. Store these credentials in your database

## API Usage

The application provides endpoints for posting to social media platforms:

```
POST /api/social/post
{
  "platform": "twitter" | "linkedin",
  "content": "Your post content",
  "mediaUrl": "https://example.com/image.jpg" (optional)
}
```

## Troubleshooting

- **LinkedIn API Errors**: Ensure you have the correct user ID (sub value) and that your access token has the `w_member_social` permission.
- **Twitter API Errors**: Verify that your consumer keys and access tokens are correct and have the necessary permissions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
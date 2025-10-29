# Share-Note

A secure note-taking application built with Next.js and React. Create, edit, and manage your notes and checklists with user authentication and personalized content.

## Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Personalized Notes**: Each user has their own private note collection
- **Create text notes and checklists**: Support for different note types
- **Edit notes with inline editing**: Quick and easy note editing
- **Tag and search functionality**: Organize and find notes efficiently
- **Responsive design with Tailwind CSS**: Works on all devices

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14 with App Router
- **Authentication**: JWT with bcrypt password hashing
- **Forms**: React Hook Form for validation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) / shadcn/ui
- **Icons**: [Lucide React](https://lucide.dev/)
- **TypeScript**: Full type safety
- **Testing**: Jest with comprehensive test coverage

## Project Structure

```
share-note/
├── src/
│   ├── app/                    # Next.js pages (App Router)
│   │   ├── api/                # API routes
│   │   │   └── auth/          # Authentication endpoints
│   │   ├── login/             # Login page
│   │   └── notes/             # Protected notes page
│   ├── components/            # React components
│   │   └── ui/               # Base UI components (shadcn/ui)
│   ├── services/             # Business logic services
│   ├── context/              # React context (AuthContext)
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── lib/                  # Utility functions
├── data/                      # Local JSON data storage
│   ├── notes.json            # Notes data
│   └── users.json            # User data
└── public/                    # Static assets
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

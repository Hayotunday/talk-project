# Talk – Video Conferencing App

Talk is a modern, full-stack video conferencing web application built with Next.js and React. It leverages the Stream Video SDK for real-time video/audio calls and Firebase for authentication, meeting management, and real-time data storage. The platform supports meeting scheduling, device setup, live transcription, and post-meeting summaries, providing a robust solution for remote collaboration.

---

## Features

- **User Authentication** (Firebase Auth)
- **Real-Time Video Meetings** (Stream Video SDK)
- **Meeting Scheduling and Management**
- **Automatic Transcription & AI Summarization**
- **Meeting History & Recordings**
- **Profile Management with Cloudinary Avatar Upload**
- **Responsive, Accessible UI (Tailwind CSS)**
- **Downloadable Meeting Summaries (PDF)**

---

## Project Structure

```bash
app
├── api
│   ├── auth
│   │   ├── [...nextauth]
│   │   └── route.ts
│   ├── meetings
│   │   ├── route.ts
│   │   └── [id]
│   │       ├── route.ts
│   │       └── participants
│   │           └── route.ts
│   └── users
│       └── route.ts
├── components
│   ├── Auth
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Common
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Spinner.tsx
│   ├── Layout
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── Meeting
│   │   ├── Controls.tsx
│   │   ├── Participants.tsx
│   │   └── VideoPlayer.tsx
│   └── User
│       └── Profile.tsx
├── lib
│   ├── firebase.ts
│   └── stream.ts
├── middleware.ts
├── page.tsx
└── styles
    ├── globals.css
    └── tailwind.css
```

- **`app/api`**: Contains all API routes for authentication, meetings, and user management.
- **`app/components`**: Reusable components like buttons, inputs, and spinners, as well as feature-specific components for authentication, meetings, and user profiles.
- **`app/lib`**: Initialization files for Firebase and Stream SDKs.
- **`app/middleware.ts`**: Custom middleware for handling authentication and authorization.
- **`app/page.tsx`**: The main entry point of the application.
- **`app/styles`**: Global and component-specific styles, including Tailwind CSS configuration.

---

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/talk-app.git
   cd talk-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root of the project and add your Firebase and Stream credentials:

   ```bash
   FIREBASE_PROJECT_ID=
   FIREBASE_CLIENT_EMAIL=
   FIREBASE_PRIVATE_KEY=
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   NEXT_PUBLIC_STREAM_APP_ID=your_stream_app_id
   STREAM_SECRET_KEY=
   STREAM_API_KEY=
   NEXT_PUBLIC_STREAM_API_KEY=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   GOOGLE_GENERATIVE_AI_API_KEY=
   NEXT_PUBLIC_LOCAL_URL_ORIGIN=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

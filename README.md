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

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/Hayotunday/talk-project.git
   cd talk-project
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
   FIREBASE_PROJECT_ID=your_firebase_admin_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_admin_private_key

   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   STREAM_SECRET_KEY=your_stream_secret_key
   STREAM_API_KEY=your_stream_api_key

   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

   GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key

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

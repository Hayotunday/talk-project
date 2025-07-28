interface User {
  uid: string;
  display_name?: string;
  email: string;
  photo_url?: string;
  createdAt: Date;
  deleted?: boolean;
}

interface Meeting {
  id: string;
  title: string;
  createdBy: string;
  participants: string[];
  createdAt: Date;
  transcription?: string;
  summary?: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  photo_url: string;
  password?: string;
}

interface SignInParams {
  email: string;
  idToken: string;
}

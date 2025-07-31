import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isAuthenticated } from "@/lib/actions/auth.action";

const AuthAlert = async () => {
  const isLoggedIn = await isAuthenticated();
  if (isLoggedIn) return null;
  return (
    <div className="w-full px-5 py-2">
      <Alert variant="destructive" className="w-auto m-4 rounded-md">
        <AlertTitle className="text-lg">Authentication Required</AlertTitle>
        <AlertDescription className="text-sm">
          You need to be logged in to access this feature. Please sign in or
          register.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AuthAlert;

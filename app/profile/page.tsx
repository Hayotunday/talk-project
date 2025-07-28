"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase/client";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Loader2, Trash2 } from "lucide-react";

interface UserProfile {
  uid: string;
  display_name: string;
  email: string;
  photo_url: string;
  createdAt: any;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState(""); // This will be the URL to display (either from firebase or preview)
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null); // The file to upload on save
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.uid) {
          setUser(null);
          setLoading(false);
          return;
        }
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUser({
            uid: currentUser.uid,
            display_name: data.display_name || "",
            email: data.email || "",
            photo_url: data.photo_url || "",
            createdAt: data.createdAt,
          });
          setEditName(data.display_name || "");
          setEditPhoto(data.photo_url || "");
        } else {
          setUser(null);
        }
      } catch (err) {
        setError("Failed to load user profile.");
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedPhotoFile(file);
    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    let photoUrl = user.photo_url;

    try {
      // If a new photo is selected, upload to Cloudinary
      if (selectedPhotoFile) {
        const formData = new FormData();
        formData.append("file", selectedPhotoFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || ""
        );
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          photoUrl = data.secure_url;
        } else {
          setError("Failed to upload image.");
          setSaving(false);
          return;
        }
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        display_name: editName,
        photo_url: photoUrl,
      });
      setUser({ ...user, display_name: editName, photo_url: photoUrl });
      setEditPhoto(photoUrl);
      setSelectedPhotoFile(null);
    } catch (err) {
      setError("Failed to update profile.");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    )
      return;
    setDeleting(true);
    setError(null);
    try {
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef);
      window.location.href = "/";
    } catch (err) {
      setError("Failed to delete account.");
    }
    setDeleting(false);
  };

  if (loading) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (!user) {
    return <p className="text-center">User not found or not logged in.</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 border rounded bg-white dark:bg-gray-900 shadow space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">My Profile</h1>
      {error && <p className="text-red-600 text-center">{error}</p>}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src={editPhoto || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <button
            type="button"
            className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 text-xs hover:bg-blue-700"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
            aria-label="Change profile picture"
          >
            Change
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handlePhotoChange}
            disabled={saving}
          />
        </div>
        <div className="w-full">
          <label className="block font-semibold mb-1">Display Name</label>
          <input
            type="text"
            value={editName}
            onChange={handleNameChange}
            className="w-full border rounded px-3 py-2"
            disabled={saving}
          />
        </div>
        <div className="w-full">
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="w-full">
          <label className="block font-semibold mb-1">Joined</label>
          <input
            type="text"
            value={
              user.createdAt?.toDate
                ? user.createdAt.toDate().toLocaleString()
                : new Date(user.createdAt).toLocaleString()
            }
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="flex w-full gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

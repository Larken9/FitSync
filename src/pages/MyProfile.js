import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function MyProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setProfileData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!profileData) {
    return <p>No profile data available.</p>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>My Profile</h1>
      <p>
        <strong>Membership Info:</strong> {profileData.membershipStatus || "N/A"}
      </p>
      <p>
        <strong>Username:</strong> {profileData.username || "N/A"}
      </p>
      <p>
        <strong>Email Address:</strong> {profileData.email || "N/A"}
      </p>
      <p>
        <strong>Cost of My Membership:</strong> {profileData.membershipCost || "N/A"}
      </p>
    </div>
  );
}

export default MyProfile;

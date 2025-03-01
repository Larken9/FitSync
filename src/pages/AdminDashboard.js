import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Check authentication and user role on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
          setLoading(false);
        } else {
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (role !== "admin") return <p>Access Denied: You are not an admin.</p>;

  // Handler for file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handler for form submission to create a new workout
  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      let fileURL = "";

      // If a file is selected, upload it to Firebase Storage
      if (file) {
        const fileRef = ref(storage, `workouts/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(snapshot.ref);
      }

      // Create a new workout document in Firestore
      await addDoc(collection(db, "workouts"), {
        name: workoutName,
        description: workoutDescription,
        imageURL: fileURL, // Include the URL of the uploaded file
        createdAt: new Date(), // or use serverTimestamp() if you prefer
      });
      console.log("Workout created successfully!");
      setSuccess("Workout created successfully!");
      // Clear the form fields and reset file input
      setWorkoutName("");
      setWorkoutDescription("");
      setFile(null);
    } catch (error) {
      console.error("Error creating workout:", error);
      setError("Failed to create workout. Check console for details.");
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-heading">Admin Dashboard</h1>
      <p className="admin-subheading">Manage your gym here.</p>

      <h2 className="admin-heading">Create a New Workout</h2>
      <div className="workout-form">
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <form onSubmit={handleCreateWorkout}>
          <div>
            <label>Workout Name:</label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Workout Description:</label>
            <textarea
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Upload Image/Video:</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*"
            />
          </div>
          <button type="submit">Create Workout</button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;

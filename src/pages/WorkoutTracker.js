import React, { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function WorkoutTracker() {
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Ensure the user is logged in
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to log a workout.");
      return;
    }
    
    try {
      // Create a new document in the "workoutsLog" collection
      await addDoc(collection(db, "workoutsLog"), {
        userId: user.uid,
        exercise: exercise,
        sets: sets,
        reps: reps,
        weight: weight,
        createdAt: serverTimestamp(),
      });
      setSuccess("Workout logged successfully!");
      // Clear form fields
      setExercise("");
      setSets("");
      setReps("");
      setWeight("");
    } catch (err) {
      console.error("Error logging workout:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1>Workout Tracker</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Exercise:</label>
          <input
            type="text"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sets:</label>
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Reps:</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Weight (lbs or kg):</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <button type="submit">Log Workout</button>
      </form>
    </div>
  );
}

export default WorkoutTracker;

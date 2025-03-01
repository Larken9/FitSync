import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function MealPlanAdmin() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Using the imported 'doc' and 'getDoc'
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await addDoc(collection(db, "mealPlans"), {
        planName,
        description,
        createdAt: serverTimestamp(),
      });
      setSuccess("Meal plan created successfully!");
      setPlanName("");
      setDescription("");
    } catch (err) {
      console.error("Error creating meal plan:", err);
      setError(err.message);
    }
  };
  
  return (
    <div style={{ margin: "20px" }}>
      <h1>Meal Plan Management (Admin)</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Meal Plan Name:</label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Meal Plan</button>
      </form>
    </div>
  );
}

export default MealPlanAdmin;

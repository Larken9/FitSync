import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Default role is "User"; now allow "PersonalTrainer" as an option.
  const [role, setRole] = useState("User");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // (Optional) Calculate additional fields such as membershipExpiration here
      // For this example, we'll keep it simple.

      // Create the user document in Firestore with the provided fields
      await setDoc(doc(db, "users", userId), {
        firstName: firstName.trim(),
        email: email.trim().toLowerCase(),
        role,                           // "User" or "PersonalTrainer"
        membershipStatus: "Inactive",   // Default status
        membershipCost: null,           // Null until a membership is purchased
        createdAt: serverTimestamp(),
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Sign-up failed. " + err.message);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Sign Up</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSignUp}>
        <div>
          <label>First Name*</label>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email*</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password*</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="User">User</option>
            <option value="PersonalTrainer">Personal Trainer</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./MultiStepSignUp.css"; // Import your CSS file

function MultiStepSignUp() {
  const navigate = useNavigate();

  // Track the current step: 1 (membership), 2 (personal info), 3 (confirmation)
  const [step, setStep] = useState(1);

  // Membership selection
  const [selectedMembership, setSelectedMembership] = useState(null);
  const membershipOptions = [
    { id: "classic", name: "Classic", cost: "$15/month" },
    { id: "premium", name: "Premium", cost: "$29.99/month" },
  ];

  // Personal info fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // For user feedback
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Move to the next step
  const handleNext = () => setStep((prev) => prev + 1);
  // Move to the previous step
  const handleBack = () => setStep((prev) => prev - 1);

  // Handle membership selection
  const handleMembershipSelect = (option) => {
    setSelectedMembership(option);
  };

  // ---------------------------
  // 1) Add a helper function to check if all required fields are filled
  // ---------------------------
  const isPersonalInfoValid = () => {
    // Return true if all required fields have non-empty values
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      phone.trim() &&
      dob.trim() &&
      addressLine1.trim() &&
      city.trim() &&
      province.trim() &&
      postalCode.trim()
    );
  };

  // Final sign-up submission
  const handleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        "TemporaryPassword123"
      );
      const userId = userCredential.user.uid;

      // 2. Build user data
      const membershipCost = selectedMembership ? selectedMembership.cost : null;
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        gender: gender,
        dateOfBirth: dob,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        role: "User", // Default role
        membershipStatus: "Inactive", // Default status
        membershipCost: membershipCost,
      };

      // 3. Store user data in Firestore
      await setDoc(doc(db, "users", userId), userData);

      setLoading(false);
      // 4. Navigate or show success message
      navigate("/login"); // e.g., direct the user to the login page
    } catch (err) {
      console.error(err);
      setError("Sign-up failed. " + err.message);
      setLoading(false);
    }
  };

  // Step 1: Membership selection UI
  const renderMembershipStep = () => {
    return (
      <div className="step-container">
        <h2>Select Membership</h2>
        <p>Please choose a membership type:</p>
        <div className="membership-options">
          {membershipOptions.map((option) => (
            <div
              key={option.id}
              className={
                "membership-card" +
                (selectedMembership?.id === option.id ? " selected" : "")
              }
              onClick={() => handleMembershipSelect(option)}
            >
              <h3>{option.name}</h3>
              <p>{option.cost}</p>
            </div>
          ))}
        </div>
        <div className="button-row">
          <button onClick={handleNext} disabled={!selectedMembership}>
            Next
          </button>
        </div>
      </div>
    );
  };

  // Step 2: Personal info UI
  const renderPersonalInfoStep = () => {
    return (
      <div className="step-container">
        <h2>Personal Information</h2>
        <div className="form-group">
          <label>First Name*</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name*</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email*</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number*</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <input
            type="text"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Date of Birth*</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Address Line 1*</label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Address Line 2</label>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>City*</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Province*</label>
          <input
            type="text"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Postal Code*</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </div>

        <div className="button-row">
          <button onClick={handleBack}>Back</button>
          {/* 
              2) Disable the "Next" button if !isPersonalInfoValid() 
          */}
          <button onClick={handleNext} disabled={!isPersonalInfoValid()}>
            Next
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Confirmation & Finalize
  const renderConfirmationStep = () => {
    return (
      <div className="step-container">
        <h2>Confirm Your Details</h2>
        <p>
          <strong>Membership:</strong>{" "}
          {selectedMembership?.name} ({selectedMembership?.cost})
        </p>
        <p>
          <strong>First Name:</strong> {firstName}
        </p>
        <p>
          <strong>Last Name:</strong> {lastName}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
        <p>
          <strong>Phone:</strong> {phone}
        </p>
        <p>
          <strong>Gender:</strong> {gender}
        </p>
        <p>
          <strong>Date of Birth:</strong> {dob}
        </p>
        <p>
          <strong>Address Line 1:</strong> {addressLine1}
        </p>
        <p>
          <strong>Address Line 2:</strong> {addressLine2}
        </p>
        <p>
          <strong>City:</strong> {city}
        </p>
        <p>
          <strong>Province:</strong> {province}
        </p>
        <p>
          <strong>Postal Code:</strong> {postalCode}
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="button-row">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleSignUp} disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="multi-step-container">
      {step === 1 && renderMembershipStep()}
      {step === 2 && renderPersonalInfoStep()}
      {step === 3 && renderConfirmationStep()}
    </div>
  );
}

export default MultiStepSignUp;

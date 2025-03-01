import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import "./Footer.css"; // Create and import Footer.css for styling

function Footer() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className="global-footer">
      {!currentUser && (
        <div className="signup-container">
          <span>Don't have an account? </span>
          <Link to="/signup" className="signup-link">
            Sign Up
          </Link>
        </div>
      )}
    </footer>
  );
}

export default Footer;

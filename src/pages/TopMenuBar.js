import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./TopMenuBar.css";

function TopMenuBar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user doc to determine role
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setDropdownOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="top-menu-bar">
      {/* LEFT SIDE NAV LINKS */}
      <nav className="nav-left">
        {role && role.toLowerCase() === "personaltrainer" ? (
          /* If role is "personaltrainer", show My Clients link */
          <Link to="/personal-trainer/my-clients" className="nav-link">
            My Clients
          </Link>
        ) : role && role.toLowerCase() === "admin" ? (
          /* If role is "admin", show Admin Portal link */
          <Link to="/admin" className="nav-link">
            Admin Portal
          </Link>
        ) : (
          /* Otherwise, default user links */
          <>
            <Link to="/user" className="nav-link">
              User
            </Link>
            <Link to="/memberships" className="nav-link">
              Membership
            </Link>
          </>
        )}
      </nav>

      {/* RIGHT SIDE USER INFO / SIGN-OUT */}
      <div className="nav-right">
        {currentUser ? (
          <div className="user-dropdown">
            <button
              className="user-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {currentUser.displayName
                ? currentUser.displayName.split(" ")[0]
                : currentUser.email.split("@")[0]}
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default TopMenuBar;

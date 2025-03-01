import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./UserDashboard.css";

function UserDashboard() {
  return (
    <div className="user-dashboard-container">
      <aside className="sidebar">
        <h2>User Dashboard</h2>
        <nav>
          <ul>
            <li>
              <Link to="profile">My Profile</Link>
            </li>
            <li>
              <Link to="workouts">My Workouts</Link>
            </li>
            <li>
              <Link to="meal-planner">My Meal Planner</Link>
            </li>
            <li>
              <Link to="check-in">My Check In</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default UserDashboard;

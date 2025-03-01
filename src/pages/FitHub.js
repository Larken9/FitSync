import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./FitHub.css";

function FitHub() {
  return (
    <div className="fithub-container">
      <aside className="fithub-sidebar">
        <h2 className="sidebar-logo">GYM MASTER</h2>
        <ul className="sidebar-menu">
          {/* The index route will be AdminHome */}
          <li>
            <Link to="/admin">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/membership">Membership</Link>
          </li>
          <li>
            <Link to="/admin/workouts">Workouts</Link>
          </li>
          <li>
            <Link to="/admin/schedule">Schedule</Link>
          </li>
          <li>
            <Link to="/admin/pt-staff">PT Staff</Link>
          </li>
          <li>
            <Link to="/admin/reports">Report &amp; Billing</Link>
          </li>
          <li>
            <Link to="/admin/portal">Member Portal</Link>
          </li>
        </ul>
      </aside>

      <div className="fithub-main">
        <div className="fithub-topbar">
          <input
            type="text"
            placeholder="Find Member..."
            className="fithub-search"
          />
        </div>
        <div className="fithub-content">
          {/* Child routes render here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default FitHub;

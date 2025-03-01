import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from "firebase/firestore";
import "./FitHub.css"; // Reuse your FitHub styles

function AdminHome() {
  // We remove the manual "selectedMonth" logic for membership changes, 
  // focusing on real-time data for active members, new signups, check-ins, etc.

  const [activeCount, setActiveCount] = useState(0);
  const [newSignups, setNewSignups] = useState(0);
  const [checkIns, setCheckIns] = useState(0);

  // For a quick loading indicator
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 1) Count Active Members
        const usersRef = collection(db, "users");
        const activeQuery = query(usersRef, where("membershipStatus", "==", "active"));
        const activeSnap = await getDocs(activeQuery);
        setActiveCount(activeSnap.size);

        // 2) Count New Signups in the Last 30 Days
        // We assume each user doc has a "createdAt" field (Firestore Timestamp)
        const thirtyDaysAgo = Timestamp.fromDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        const newSignupsQuery = query(
          usersRef,
          where("createdAt", ">=", thirtyDaysAgo)
        );
        const newSignupsSnap = await getDocs(newSignupsQuery);
        setNewSignups(newSignupsSnap.size);

        // 3) Count Check-Ins in the Last 30 Days
        // We assume there's a "checkIns" collection with a "timestamp" field
        const checkInsRef = collection(db, "checkIns");
        const checkInsQuery = query(
          checkInsRef,
          where("timestamp", ">=", thirtyDaysAgo),
          orderBy("timestamp", "asc")
        );
        const checkInsSnap = await getDocs(checkInsQuery);
        setCheckIns(checkInsSnap.size);

      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading admin stats...</p>;
  }

  return (
    <div>
      <div className="fithub-row">
        {/* Left side (placeholder for future graphs or membership changes) */}
        <div className="fithub-panel fithub-panel-graph">
          <div className="panel-header">
            <h3>Member Changes (Placeholder)</h3>
          </div>
          <div className="panel-graph">
            <p>Graphs or data about monthly changes could go here.</p>
          </div>
        </div>

        {/* Right side stats */}
        <div className="fithub-panel fithub-panel-stats">
          <div className="stat-box">
            <h4>{activeCount} Current Members</h4>
            <p>All users with membershipStatus = "active"</p>
          </div>
          <div className="stat-box">
            <h4>{newSignups} New Signups (Last 30 Days)</h4>
            <p>Users created in the last 30 days</p>
          </div>
          <div className="stat-box">
            <h4>{checkIns} Check-Ins (Last 30 Days)</h4>
            <p>Barcode scans in the "checkIns" collection</p>
          </div>
        </div>
      </div>

      {/* Bottom row for additional graphs or data */}
      <div className="fithub-row">
        <div className="fithub-panel fithub-panel-graph">
          <div className="panel-header">
            <h3>Member Graph at End of Month</h3>
          </div>
          <div className="panel-graph">
            <p>Placeholder for a real chart or table</p>
          </div>
        </div>
        <div className="fithub-panel fithub-panel-graph">
          <div className="panel-header">
            <h3>Visit History</h3>
          </div>
          <div className="panel-graph">
            <p>Another placeholder for chart or data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;

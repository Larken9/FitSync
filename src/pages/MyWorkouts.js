import React from "react";

function MyWorkouts() {
  return (
    <div>
      <h1>My Workouts</h1>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2025-02-20</td>
            <td>10:00 AM</td>
          </tr>
          <tr>
            <td>2025-02-19</td>
            <td>09:30 AM</td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </table>
    </div>
  );
}

export default MyWorkouts;

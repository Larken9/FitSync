import React, { useState, useEffect, useRef } from "react";
import "./StyledWorkoutTracker.css"; // Ensure this path is correct

function StyledWorkoutTracker() {
  // Set a fixed exercise value for the user's view
  const exercise = "Cable Crunch";

  // Table data (read-only intensity and restTime, editable weight and reps)
  const [tableRows, setTableRows] = useState([
    { set: 1, intensity: 7, weight: 0, reps: 0, restTime: 150 },
    { set: 2, intensity: 7, weight: 0, reps: 0, restTime: 150 },
    { set: 3, intensity: 7, weight: 0, reps: 0, restTime: 150 },
    { set: 4, intensity: 7, weight: 0, reps: 0, restTime: 150 },
    { set: 5, intensity: 7, weight: 0, reps: 0, restTime: 150 },
  ]);

  // Timer states
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [timeInSeconds, setTimeInSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Start workout handler
  const startWorkout = () => {
    setWorkoutStarted(true);
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeInSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Format time (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Handle changes to weight and reps
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...tableRows];
    updatedRows[index][field] = value;
    setTableRows(updatedRows);
  };

  return (
    <div className="workout-container">
      {/* Timer displayed at top center when workout is started */}
      {workoutStarted && (
        <div className="workout-timer">{formatTime(timeInSeconds)}</div>
      )}

      <h1 className="workout-heading">Workout Tracker</h1>

      {/* Display the set exercise */}
      <div className="exercise-display" style={{ marginBottom: "20px" }}>
        <strong>Exercise:</strong> {exercise}
      </div>

      {/* Table for sets, intensity, weight, reps, and rest time */}
      <table className="workout-table">
        <thead>
          <tr>
            <th>Set</th>
            <th>Intensity</th>
            <th>Weight</th>
            <th>Reps</th>
            <th>Rest Time (sec)</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, index) => (
            <tr key={index}>
              <td>{row.set}</td>
              <td>{row.intensity}</td>
              <td>
                <input
                  type="number"
                  className="weight-input"
                  value={row.weight}
                  onChange={(e) => handleInputChange(index, "weight", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="reps-input"
                  value={row.reps}
                  onChange={(e) => handleInputChange(index, "reps", e.target.value)}
                />
              </td>
              <td>{row.restTime}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* "Start" button */}
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        {!workoutStarted && (
          <button className="start-button" onClick={startWorkout}>
            Start
          </button>
        )}
      </div>
    </div>
  );
}

export default StyledWorkoutTracker;

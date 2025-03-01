import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function MealPlanViewer() {
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchMealPlans = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "mealPlans"));
          const plans = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMealPlans(plans);
        } catch (error) {
          console.error("Error fetching meal plans:", error);
        }
        setLoading(false);
      };
  
      fetchMealPlans();
    }, []);
  
    if (loading) return <p>Loading meal plans...</p>;
  
    return (
      <div style={{ margin: "20px" }}>
        <h1>Meal Plans</h1>
        {mealPlans.length === 0 ? (
          <p>No meal plans available.</p>
        ) : (
          <ul>
            {mealPlans.map(plan => (
              <li key={plan.id} style={{ marginBottom: "1rem" }}>
                <h3>{plan.planName}</h3>
                <p>{plan.description}</p>
                {/* You can add more details here */}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  
  export default MealPlanViewer;
  
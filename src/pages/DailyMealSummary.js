import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import "./DailyMealSummary.css";

function DailyMealSummary() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Daily target values (could be fetched from user settings)
  const target = {
    calories: 2664,
    protein: 126,
    carbs: 297,
    fat: 88,
  };

  // Totals for all meals today
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    const fetchMealsForToday = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setMeals([]);
          setLoading(false);
          return;
        }
        // Calculate today's start and end timestamps
        const now = new Date();
        const startOfDay = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
        const endOfDay = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

        // Query mealLog subcollection for today's meals
        const mealLogRef = collection(db, "users", user.uid, "mealLog");
        const q = query(mealLogRef, where("addedAt", ">=", startOfDay), where("addedAt", "<", endOfDay));
        const querySnapshot = await getDocs(q);
        const mealsData = [];
        querySnapshot.forEach((doc) => {
          mealsData.push({ id: doc.id, ...doc.data() });
        });
        setMeals(mealsData);

        // Sum up the macros (ensure numeric values)
        let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
        mealsData.forEach((meal) => {
          const nutr = meal.nutriments || {};
          totalCals += nutr.calories ? Number(nutr.calories) : 0;
          totalProtein += nutr.protein ? Number(nutr.protein) : 0;
          totalCarbs += nutr.carbs ? Number(nutr.carbs) : 0;
          totalFat += nutr.fat ? Number(nutr.fat) : 0;
        });
        setTotals({
          calories: totalCals,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        });
      } catch (err) {
        console.error("Error fetching meals:", err);
      }
      setLoading(false);
    };

    fetchMealsForToday();
  }, []);

  // Define the meal categories
  const categories = ["Breakfast", "Lunch", "Dinner", "Snacks", "Uncategorized"];
  // Group meals by category (if a meal doesn't have a category, assign it to "Uncategorized")
  const mealsByCategory = {};
  categories.forEach((cat) => (mealsByCategory[cat] = []));
  meals.forEach((meal) => {
    const cat = meal.mealCategory ? meal.mealCategory : "Uncategorized";
    if (mealsByCategory[cat]) {
      mealsByCategory[cat].push(meal);
    } else {
      mealsByCategory["Uncategorized"].push(meal);
    }
  });

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (loading) {
    return <p>Loading your meals for today...</p>;
  }

  // Calculate percentages for progress bars and ring charts
  const calPercent = (totals.calories / target.calories) * 100;
  const proteinPercent = (totals.protein / target.protein) * 100;
  const carbsPercent = (totals.carbs / target.carbs) * 100;
  const fatPercent = (totals.fat / target.fat) * 100;
  const calRemaining = target.calories - totals.calories > 0 ? target.calories - totals.calories : 0;

  return (
    <div className="daily-meal-summary">
      <h1>Today's Meals</h1>

      {/* Collapsible Meal Categories */}
      {categories.map((category) => {
        const items = mealsByCategory[category] || [];
        return (
          <div key={category} className="category-section">
            <div className="category-header" onClick={() => toggleCategory(category)}>
              <div className="category-title">{category}</div>
              <div className="category-items-count">{items.length} item{items.length !== 1 ? "s" : ""}</div>
              <div className="category-calories">
                {items.reduce((acc, meal) => acc + (meal.nutriments?.calories || 0), 0)} kcal
              </div>
              <div className={`category-arrow ${expandedCategories[category] ? "expanded" : ""}`} />
            </div>
            {expandedCategories[category] && items.length > 0 && (
              <div className="category-body">
                {items.map((meal) => (
                  <div key={meal.id} className="meal-item-row">
                    <div className="meal-item-icon">
                      {/* Replace with an appropriate icon image or component */}
                      <img src="/icons/food-icon.png" alt="food" />
                    </div>
                    <div className="meal-item-info">
                      <div className="meal-item-name">{meal.productName}</div>
                      <div className="meal-item-details">
                        {meal.nutriments?.calories || 0} kcal • {meal.nutriments?.protein || 0}g protein • {meal.nutriments?.carbs || 0}g carbs • {meal.nutriments?.fat || 0}g fat
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {meals.length === 0 && <p>No meals logged for today.</p>}

      {/* Energy & Macro Summary Section */}
      <div className="energy-summary">
        <h2>Energy Summary</h2>
        <div className="ring-charts">
          <div className="ring-chart">
            <div className="ring" style={{ "--percentage": calPercent }}></div>
            <div className="ring-label">
              <strong>{Math.round(totals.calories)}</strong> kcal
              <br />
              <span>Consumed</span>
            </div>
          </div>
          <div className="ring-chart">
            <div className="ring" style={{ "--percentage": (calRemaining / target.calories) * 100 }}></div>
            <div className="ring-label">
              <strong>{Math.round(calRemaining)}</strong> kcal
              <br />
              <span>Remaining</span>
            </div>
          </div>
        </div>

        <div className="targets-row">
          <h3>Targets</h3>
          <div className="target-item">
            <div className="target-label">Energy</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${calPercent}%` }}></div>
            </div>
            <div className="target-values">
              {Math.round(totals.calories)}/{target.calories} kcal
            </div>
          </div>
          <div className="target-item">
            <div className="target-label">Protein</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${proteinPercent}%` }}></div>
            </div>
            <div className="target-values">
              {Math.round(totals.protein)}/{target.protein} g
            </div>
          </div>
          <div className="target-item">
            <div className="target-label">Net Carbs</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${carbsPercent}%` }}></div>
            </div>
            <div className="target-values">
              {Math.round(totals.carbs)}/{target.carbs} g
            </div>
          </div>
          <div className="target-item">
            <div className="target-label">Fat</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${fatPercent}%` }}></div>
            </div>
            <div className="target-values">
              {Math.round(totals.fat)}/{target.fat} g
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyMealSummary;

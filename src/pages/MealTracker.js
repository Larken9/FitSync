import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

// USDA API key from your account
const usdaApiKey = "oXSW4IZFya2yU9fVuRlzxmrCa4MN3jTNdxm8mVyJ";

// Function to fetch data from USDA FoodData Central API by barcode
const fetchUSDADataByBarcode = async (code) => {
  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${code}?api_key=${usdaApiKey}`
    );
    const data = await response.json();
    // Check if USDA returned a valid product (data.description exists)
    if (data && data.description) {
      return {
        product_name: data.description,
        brands: data.brandOwner || "N/A",
        quantity: data.servingSize
          ? data.servingSize + " " + data.servingSizeUnit
          : "N/A",
        nutriments: {
          "energy-kcal_100g":
            data.foodNutrients.find((n) => n.nutrientName === "Energy")?.value ||
            "N/A",
          "fat_100g":
            data.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value ||
            "N/A",
          "proteins_100g":
            data.foodNutrients.find((n) => n.nutrientName === "Protein")?.value ||
            "N/A",
        },
      };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching USDA data:", err);
    return null;
  }
};

// Function to fetch data from Open Food Facts API by barcode
const fetchOFFData = async (code) => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`
    );
    const data = await response.json();
    if (data.status === 1) {
      return {
        product_name: data.product.product_name,
        brands: data.product.brands || "N/A",
        quantity: data.product.quantity || "N/A",
        nutriments: {
          "energy-kcal_100g":
            data.product.nutriments &&
            data.product.nutriments["energy-kcal_100g"]
              ? data.product.nutriments["energy-kcal_100g"]
              : "N/A",
          "fat_100g":
            data.product.nutriments &&
            data.product.nutriments["fat_100g"]
              ? data.product.nutriments["fat_100g"]
              : "N/A",
          "proteins_100g":
            data.product.nutriments &&
            data.product.nutriments["proteins_100g"]
              ? data.product.nutriments["proteins_100g"]
              : "N/A",
        },
      };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching Open Food Facts data:", err);
    return null;
  }
};

function MealTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [nutritionData, setNutritionData] = useState(null);
  const [servings, setServings] = useState("");
  const [error, setError] = useState("");

  // Combined function: try USDA first; if no data, fallback to OFF
  const fetchCombinedNutritionData = async (code) => {
    const usdaResult = await fetchUSDADataByBarcode(code);
    if (usdaResult) {
      setNutritionData(usdaResult);
      setError("");
    } else {
      // USDA didn't return data; fallback to Open Food Facts
      const offResult = await fetchOFFData(code);
      if (offResult) {
        setNutritionData(offResult);
        setError("");
      } else {
        setError("No product found for this barcode in both databases.");
        setNutritionData(null);
      }
    }
  };

  // When a barcode is scanned, use the combined function
  useEffect(() => {
    if (barcode) {
      fetchCombinedNutritionData(barcode);
      setScanning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode]);

  // Handle search input changes (for a simple food search suggestion feature)
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // For a full-featured search, you'd call an API endpoint here.
    // For now, we'll clear nutritionData if the user types.
    if (query.length > 2) {
      // Optionally, call fetchCombinedNutritionData using the query.
      // For simplicity, we clear nutritionData here.
      setNutritionData(null);
    }
  };

  // Handler when a suggestion is clicked (if you implement suggestion UI)
  const handleSuggestionClick = (food) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setSuggestions([]);
    setNutritionData({
      product_name: food.name,
      brands: food.brands,
      quantity: food.quantity,
      nutriments: {
        "energy-kcal_100g": food.calories,
        "fat_100g": food.fat,
        "proteins_100g": food.proteins,
      },
    });
  };

  // Handler to add the meal to Firestore under the user's account for today
  const handleAddMeal = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("User not logged in.");
      return;
    }
    if (!nutritionData) {
      setError("No nutrition data to add.");
      return;
    }
    if (!servings || isNaN(servings)) {
      setError("Please enter a valid number of servings.");
      return;
    }
    try {
      const mealLogRef = collection(db, "users", user.uid, "mealLog");
      const scale = Number(servings);
      const scaledNutriments = {
        calories:
          nutritionData.nutriments["energy-kcal_100g"] !== "N/A"
            ? nutritionData.nutriments["energy-kcal_100g"] * scale
            : "N/A",
        fat:
          nutritionData.nutriments["fat_100g"] !== "N/A"
            ? nutritionData.nutriments["fat_100g"] * scale
            : "N/A",
        proteins:
          nutritionData.nutriments["proteins_100g"] !== "N/A"
            ? nutritionData.nutriments["proteins_100g"] * scale
            : "N/A",
      };

      await addDoc(mealLogRef, {
        productName: nutritionData.product_name,
        brands: nutritionData.brands,
        quantity: nutritionData.quantity,
        servings: scale,
        nutriments: scaledNutriments,
        addedAt: serverTimestamp(),
      });
      setSearchQuery("");
      setNutritionData(null);
      setServings("");
      setError("");
      alert("Meal added successfully!");
    } catch (err) {
      console.error("Error adding meal:", err);
      setError("Failed to add meal. " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Meal Tracker</h1>
      
      {/* Top: Search bar and Scan Barcode Button */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search for a food item..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            padding: "10px",
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginRight: "10px",
          }}
        />
        <button
          onClick={() => {
            setScanning(true);
            setNutritionData(null);
            setBarcode("");
            setError("");
          }}
          style={{
            padding: "10px 16px",
            backgroundColor: "#ADD8E6",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Scan Barcode
        </button>
      </div>

      {/* (Optional) Display suggestions if implementing a suggestion list */}
      {/* ... */}

      {/* Barcode Scanner View */}
      {scanning && (
        <div style={{ width: "300px", margin: "0 auto 20px" }}>
          <BarcodeScannerComponent
            width={300}
            height={300}
            onUpdate={(err, result) => {
              if (result) {
                setBarcode(result.text);
              } else if (err) {
                console.error(err);
                setError(err.message);
              }
            }}
          />
        </div>
      )}

      {/* Display scanned barcode */}
      {barcode && <p><strong>Scanned Barcode:</strong> {barcode}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display Nutrition Data & Servings Input */}
      {nutritionData && (
        <div style={{ marginTop: "20px" }}>
          <h2>{nutritionData.product_name}</h2>
          <p>
            <strong>Brand:</strong> {nutritionData.brands || "N/A"}
          </p>
          <p>
            <strong>Quantity:</strong> {nutritionData.quantity || "N/A"}
          </p>
          <p>
            <strong>Calories (per 100g):</strong>{" "}
            {nutritionData.nutriments &&
            nutritionData.nutriments["energy-kcal_100g"] !== "N/A"
              ? nutritionData.nutriments["energy-kcal_100g"]
              : "N/A"}
          </p>
          <p>
            <strong>Fat (per 100g):</strong>{" "}
            {nutritionData.nutriments &&
            nutritionData.nutriments["fat_100g"] !== "N/A"
              ? nutritionData.nutriments["fat_100g"]
              : "N/A"}
          </p>
          <p>
            <strong>Proteins (per 100g):</strong>{" "}
            {nutritionData.nutriments &&
            nutritionData.nutriments["proteins_100g"] !== "N/A"
              ? nutritionData.nutriments["proteins_100g"]
              : "N/A"}
          </p>
          <div style={{ marginTop: "20px" }}>
            <label>
              Number of Servings:
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                style={{
                  padding: "8px",
                  marginLeft: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "60px",
                }}
              />
            </label>
          </div>
          {servings && !isNaN(servings) && (
            <div style={{ marginTop: "20px" }}>
              <h3>Nutrition Info for {servings} serving(s):</h3>
              <p>
                <strong>Calories:</strong>{" "}
                {nutritionData.nutriments["energy-kcal_100g"] !== "N/A"
                  ? nutritionData.nutriments["energy-kcal_100g"] * Number(servings)
                  : "N/A"}
              </p>
              <p>
                <strong>Fat:</strong>{" "}
                {nutritionData.nutriments["fat_100g"] !== "N/A"
                  ? nutritionData.nutriments["fat_100g"] * Number(servings)
                  : "N/A"}
              </p>
              <p>
                <strong>Proteins:</strong>{" "}
                {nutritionData.nutriments["proteins_100g"] !== "N/A"
                  ? nutritionData.nutriments["proteins_100g"] * Number(servings)
                  : "N/A"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Meal Button */}
      {nutritionData && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleAddMeal}
            style={{
              padding: "10px 16px",
              backgroundColor: "#ADD8E6",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Meal
          </button>
        </div>
      )}
    </div>
  );
}

export default MealTracker;

function getRecommendations(soilMoisture, soilPH, temperature, humidity) {
    const conditions = [];
    let diseases = [];
    const suggestions = [];

    // Soil Moisture Recommendations
    if (soilMoisture < 50) {
        conditions.push("Increase soil moisture to at least 50%");
    } else if (soilMoisture > 75) {
        conditions.push("Improve drainage to reduce soil moisture below 75%");
    }

    // Soil pH Recommendations
    if (soilPH < 5.8) {
        conditions.push("Increase soil pH to at least 5.8 using lime or wood ash");
    } else if (soilPH > 7.5) {
        conditions.push("Lower soil pH below 7.5 using sulfur or organic matter");
    }

    // Temperature Recommendations
    if (temperature < 5) {
        conditions.push("Increase temperature above 5°C using row covers or cloches");
    } else if (temperature > 25) {
        conditions.push("Provide shade or increase watering to keep temperature below 25°C");
    }

    // Humidity Recommendations
    if (humidity < 60 || humidity > 80) {
        conditions.push("Maintain humidity between 60% and 80% for optimal growth");
    }

    // Disease Prediction and Suggested Actions
    const diseaseSuggestions = {
        "Downy Mildew": {
            condition: ["Humidity exceeds 75%"],
            action: "Increase air circulation",
            fertilizer: "Organic nitrogen-based fertilizer",
            pesticide: "Fungicide for downy mildew"
        },
        "Black Rot": {
            condition: ["Temperature exceeds 22°C", "Humidity exceeds 70%"],
            action: "Improve drainage",
            fertilizer: "High-phosphorus fertilizer",
            pesticide: "Fungicide for black rot"
        },
        "Purple Blotch": {
            condition: ["Temperature less than 20°C", "Humidity less than 70%"],
            action: "Apply fungicide",
            fertilizer: "Balanced NPK fertilizer",
            pesticide: "Fungicide for purple blotch"
        },
        "Alternaria Leaf Blight": {
            condition: ["Temperature exceeds 20°C", "Humidity less than 70%"],
            action: "Rotate crops",
            fertilizer: "Balanced NPK fertilizer",
            pesticide: "Fungicide for alternaria"
        }
    };

    if (humidity > 75) {
        diseases.push("Downy Mildew");
    }
    if (temperature > 22 && humidity > 70) {
        diseases.push("Black Rot");
    }
    if (temperature < 20 && humidity < 70) {
        diseases.push("Purple Blotch");
    }
    if (temperature > 20 && humidity < 70) {
        diseases.push("Alternaria Leaf Blight");
    }
    if (diseases.length === 0) {
        diseases.push("No disease predicted under current conditions");
    }

    diseases.forEach(disease => {
        if (disease !== "No disease predicted under current conditions") {
            suggestions.push(`Condition: ${diseaseSuggestions[disease].condition.join(', ')}`);
            suggestions.push(`Action: ${diseaseSuggestions[disease].action}`);
            suggestions.push(`Fertilizer: ${diseaseSuggestions[disease].fertilizer}`);
            suggestions.push(`Pesticide: ${diseaseSuggestions[disease].pesticide}`);
        }
    });

    return {
        disease: diseases.join(', '),
        condition: conditions.join(', '),
        suggestions: suggestions.join(', ')
    };
}

// Export the recommendations module
module.exports = getRecommendations;

// // Example usage
// const soilMoisture = 55; // in percentage
// const soilPH = 2.5; // pH level
// const temperature = 20; // in Celsius
// const humidity = 70; // in percentage

// const recommendations = getRecommendations(soilMoisture, soilPH, temperature, humidity);
// console.log(recommendations);

const Tourist = require("../Models/touristModel");  // Import your Tourist model (or the model where points are stored)

const calculateLoyaltyPoints = (amountPaid, level) => {
    let points = 0;

    switch (level) {
        case 1:
            points = amountPaid * 0.5;
            break;
        case 2:
            points = amountPaid * 1;
            break;
        case 3:
            points = amountPaid * 1.5;
            break;
        default:
            throw new Error("Invalid level");
    }

    return points;
};

// Function to calculate level based on total loyalty points
const calculateLevel = (totalPoints) => {
    if (totalPoints <= 100000) {
        return 1; // Level 1
    } else if (totalPoints <= 500000) {
        return 2; // Level 2
    } else {
        return 3; // Level 3
    }
};

const getBadgeByLevel = (level) => {
    switch (level) {
        case 1:
            return "Bronze Badge"; // Badge for Level 1
        case 2:
            return "Silver Badge"; // Badge for Level 2
        case 3:
            return "Gold Badge"; // Badge for Level 3
        default:
            return "No Badge"; // In case of an invalid level
    }
};

const updateLoyaltyPoints = async (touristId, amountPaid) => {
    try {

        const tourist = await Tourist.findOne({ userID: touristId });
        if (!tourist) {
            throw new Error('Tourist not found');
        }

        // Calculate loyalty points based on the amount paid
        const pointsEarned = calculateLoyaltyPoints(amountPaid, tourist.level);
        
        // Update loyalty points
        tourist.loyaltyPoints += pointsEarned;

        // Calculate and update the tourist's level based on the total points
        tourist.level = calculateLevel(tourist.loyaltyPoints);

        // Get the badge for the new level
        tourist.badge = getBadgeByLevel(tourist.level);

        // Save the updated tourist data
        await tourist.save();

        // console.log('Loyalty points and level updated successfully!');
    } catch (error) {
        // console.error('Error updating loyalty points:', error);
        throw error;  // Rethrow error to be handled by the caller
    }
};

const decreaseLoyaltyPoints = async (touristId, amountRefunded) => {
    try {
        const tourist = await Tourist.findOne({ userID: touristId });
        if (!tourist) {
            throw new Error('Tourist not found');
        }

        // Calculate points to decrease based on refund amount
        const pointsToDecrease = calculateLoyaltyPoints(amountRefunded, tourist.level);
        
        // Decrease loyalty points (ensure it doesn't go below 0)
        tourist.loyaltyPoints = Math.max(0, tourist.loyaltyPoints - pointsToDecrease);

        // Recalculate level based on new points total
        tourist.level = calculateLevel(tourist.loyaltyPoints);

        // Update badge based on new level
        tourist.badge = getBadgeByLevel(tourist.level);

        // Save the updated tourist data
        await tourist.save();

        return {
            decreasedPoints: pointsToDecrease,
            newTotal: tourist.loyaltyPoints,
            newLevel: tourist.level,
            newBadge: tourist.badge
        };
    } catch (error) {
        throw error;
    }
};

// Export both functions
module.exports = { 
    updateLoyaltyPoints,
    decreaseLoyaltyPoints 
};

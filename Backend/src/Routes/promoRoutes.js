const express = require('express');
const router = express.Router();
const { checkBirthdays } = require('../services/birthdayPromoService');
const User = require('../Models/User');
const PromoCode = require('../Models/PromoCode');
const { sendPromoCodeEmail } = require('../services/emailService');

// New GET route to retrieve users with birthdays today
router.get('/birthdays-today', async (req, res) => {
    try {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0); // Set the time to midnight UTC
        const formattedDate = date.toISOString();
        console.log(formattedDate);
        
        const users = await User.find({
            dateOfBirth: formattedDate
        });

        // Send promo code email to each user with a birthday
        for (const user of users) {
            await sendPromoCodeEmail({
                to: user.email,
                subject: 'Your Birthday Promo Code',
                text: 'YOUR_PROMO_CODE' // Replace 'YOUR_PROMO_CODE' with the actual promo code
            });
        }

        // Move the response outside the loop
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users with birthdays today:', error);
        res.status(500).json({ message: 'Error retrieving users with birthdays today', error });
    }
});
// Create Promo Code
router.post('/promo-codes', async (req, res) => {
    const { code, discountPercentage, validFrom, validUntil, maxUses } = req.body;

    try {
        const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            return res.status(400).json({ message: 'Promo code already exists' });
        }

        const promoCode = new PromoCode({
            code: code.toUpperCase(),
            discountPercentage,
            validFrom: validFrom || Date.now(), // Default to now if not provided
            validUntil,
            maxUses
        });

        await promoCode.save();
        res.status(201).json({ message: 'Promo code created successfully', promoCode });
    } catch (error) {
        console.error('Error creating promo code:', error.message);
        res.status(500).json({ message: 'Error creating promo code', error });
    }
});

module.exports = router;
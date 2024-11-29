const { sendEmail } = require('./emailService');
const PromoCode = require('../Models/PromoCode');
const User = require('../Models/User');
const { generateBirthdayPromoCode } = require('./birthdayPromoService');

const checkBirthdays = async () => {
  try {
    const today = new Date();
    const usersWithBirthdays = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$dateOfBirth' }, today.getMonth() + 1] },
          { $eq: [{ $dayOfMonth: '$dateOfBirth' }, today.getDate()] }
        ]
      }
    });

    // Generate promo codes for each user with a birthday today
    for (const user of usersWithBirthdays) {
      await generateBirthdayPromoCode(user);
    }

    console.log(`Promo codes generated for ${usersWithBirthdays.length} users with birthdays today.`);
  } catch (error) {
    console.error('Error checking birthdays:', error.message);
    throw error;
  }
};

module.exports = { checkBirthdays, generateBirthdayPromoCode };

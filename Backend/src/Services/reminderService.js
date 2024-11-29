const cron = require('node-cron');
const Notification = require('../Models/notificationModel');
const Activity = require('../Models/Activity');
const Itinerary = require('../Models/Itinerary');
const TouristItinerary = require('../Models/Tourist-Itinerary');
const { sendEventReminderEmail } = require('./emailService');
const User = require('../Models/User');

const checkUpcomingEvents = async () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    console.log('Checking upcoming events...');

    // Check activities
    const upcomingActivities = await Activity.find({
      date: {
        $gte: now,
        $lte: tomorrow
      }
    });

    console.log('Found upcoming activities:', upcomingActivities.length);

    // Process activities
    for (const activity of upcomingActivities) {
      for (const touristId of activity.touristBookings) {
        try {
          const tourist = await User.findById(touristId);
          if (!tourist) {
            console.log(`Tourist not found for ID: ${touristId}`);
            continue;
          }

          const notification = new Notification({
            recipient: touristId,
            recipientModel: 'Tourist',
            message: `Reminder: You have an upcoming activity "${activity.name}" tomorrow!`,
            type: 'EVENT_REMINDER',
            eventType: 'ACTIVITY',
            eventId: activity._id
          });

          await notification.save();
          console.log(`Notification saved for activity ${activity.name}`);

          if (tourist.email) {
            await sendEventReminderEmail(tourist.email, 'Activity', activity.name, activity.date);
            console.log(`Email sent to ${tourist.email} for activity ${activity.name}`);
          }
        } catch (error) {
          console.error(`Error processing activity notification: ${error}`);
        }
      }
    }

    // Check itineraries
    const upcomingItineraries = await Itinerary.find({
      'touristBookings.bookedDate': {
        $gte: now,
        $lte: tomorrow
      }
    });

    console.log('Found upcoming itineraries:', upcomingItineraries.length);

    // Process itineraries
    for (const itinerary of upcomingItineraries) {
      for (const booking of itinerary.touristBookings) {
        try {
          const tourist = await User.findById(booking.tourist);
          if (!tourist) {
            console.log(`Tourist not found for ID: ${booking.tourist}`);
            continue;
          }

          const notification = new Notification({
            recipient: booking.tourist,
            recipientModel: 'Tourist',
            message: `Reminder: You have an upcoming itinerary "${itinerary.name}" tomorrow!`,
            type: 'EVENT_REMINDER',
            eventType: 'ITINERARY',
            eventId: itinerary._id
          });

          await notification.save();
          console.log(`Notification saved for itinerary ${itinerary.name}`);

          if (tourist.email) {
            await sendEventReminderEmail(tourist.email, 'Itinerary', itinerary.name, booking.bookedDate);
            console.log(`Email sent to ${tourist.email} for itinerary ${itinerary.name}`);
          }
        } catch (error) {
          console.error(`Error processing itinerary notification: ${error}`);
        }
      }
    }

    // Check tourist itineraries
    const upcomingTouristItineraries = await TouristItinerary.find({
      startDate: {
        $gte: now,
        $lte: tomorrow
      }
    });

    console.log('Found upcoming tourist itineraries:', upcomingTouristItineraries.length);

    // Process tourist itineraries
    for (const touristItinerary of upcomingTouristItineraries) {
      for (const touristId of touristItinerary.touristBookings) {
        try {
          const tourist = await User.findById(touristId);
          if (!tourist) {
            console.log(`Tourist not found for ID: ${touristId}`);
            continue;
          }

          const notification = new Notification({
            recipient: touristId,
            recipientModel: 'Tourist',
            message: `Reminder: Your custom itinerary "${touristItinerary.name}" starts tomorrow!`,
            type: 'EVENT_REMINDER',
            eventType: 'TOURIST_ITINERARY',
            eventId: touristItinerary._id
          });

          await notification.save();
          console.log(`Notification saved for tourist itinerary ${touristItinerary.name}`);

          if (tourist.email) {
            await sendEventReminderEmail(tourist.email, 'Tourist Itinerary', touristItinerary.name, touristItinerary.startDate);
            console.log(`Email sent to ${tourist.email} for tourist itinerary ${touristItinerary.name}`);
          }
        } catch (error) {
          console.error(`Error processing tourist itinerary notification: ${error}`);
        }
      }
    }

  } catch (error) {
    console.error('Error in checkUpcomingEvents:', error);
  }
};

// Run every hour
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled reminder check');
    await checkUpcomingEvents();
});

// Export for testing
module.exports = { checkUpcomingEvents };
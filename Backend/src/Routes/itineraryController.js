const express = require("express");
const Itinerary = require("../Models/Itinerary"); // Correct import here

const router = express.Router();

// POST route for creating a new itinerary
router.post("/", async (req, res) => {
  try {
    const newItinerary = new Itinerary(req.body); // Use Itinerary model to create new itinerary
    await newItinerary.save(); // Save the itinerary to the database
    res.status(201).json(newItinerary); // Respond with the created itinerary
  } catch (error) {
    res.status(400).json({ error: error.message }); // Send error if it fails
  }
});

// Read all itineraries
router.get('/', async (req, res) => {
  try {
    const itineraries = await Itinerary.find();
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific itinerary by ID
router.get('/:id', async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);
        if (!itinerary) return res.status(404).json({ error: "Itinerary not found" });
        res.status(200).json(itinerary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an itinerary
router.put('/:id', async (req, res) => {
  try {
    const updatedItinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItinerary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an itinerary
router.delete('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (itinerary.bookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete itinerary with existing bookings' });
    }
    await itinerary.remove();
    res.json({ message: 'Itinerary deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Router to fetch upcoming itineraries
router.get('/upcomingItineraries', async (req, res) => {
    try {
        const itineraries = await itineraryModel.find({
            date: { $gt: new Date() } // Only fetch future itineraries
        }).sort({ date: 1 }); // Sort by ascending date

        res.status(200).json(itineraries);

    } catch (error) {
        res.status(500).json({ message: "Error fetching upcoming itineraries", error });
    }
});

// Router to sort upcoming itineraries
router.get('/sortItineraries', async (req, res) => {
    try {
        const allowedSortFields = ['price', 'rating'];
        const { sortBy } = req.query;

        // Validate the sortBy field, use 'price' as the default if not provided or invalid
        if (!sortBy || !allowedSortFields.includes(sortBy)) {
            return res.status(400).json({ message: `Invalid sortBy value. Allowed values: ${allowedSortFields.join(', ')}` });
        }

        // Fetch upcoming itineraries sorted by the chosen field in ascending order
        const itineraries = await itineraryModel.find({
            date: { $gt: new Date() } // Only fetch future itineraries
        }).sort({ [sortBy]: 1 }); // Sort in ascending order

        // Return sorted itineraries
        res.status(200).json(itineraries);

    } catch (error) {
        // Handle any errors during fetching
        res.status(500).json({ message: "Error sorting itineraries", error });
    }
});

router.get('/filterItineraries', async (req, res) => {
    try {
        const { price, date, preferences, language } = req.query;

        // Build the query object dynamically based on provided filters
        const query = {
            date: { $gt: new Date() } // Only fetch future itineraries by default
        };

        // Apply price filter if provided
        if (price) {
            query.price = { $lte: Number(price) }; // Assuming 'price' is stored as a number
        }

        // Apply date filter if provided
        if (date) {
            query.date = { $eq: new Date(date) }; // Matches the specific date
        }

        // Apply preferences filter if provided
        if (preferences) {
            const preferenceOptions = preferences.split(','); // Split multiple preferences by comma
            query.preferences = { $in: preferenceOptions }; // Check if itinerary includes any of the preferences
        }

        // Apply language filter if provided
        if (language) {
            query.language = language; // Matches the language exactly
        }

        // Fetch the filtered itineraries
        const itineraries = await itineraryModel.find(query).sort({ date: 1 });

        // Return the filtered itineraries
        res.status(200).json(itineraries);

    } catch (error) {
        // Handle any errors during fetching
        res.status(500).json({ message: "Error fetching itineraries based on filters", error });
    }
});

// Router to search itineraries
router.get('/searchItineraries', async (req, res) => {
    try {
        const { keyword } = req.query; // The keyword to search for
        
        // Build a query to search in 'name', 'category', and 'tags' fields
        const query = {
            $or: [
                { name: { $regex: keyword, $options: 'i' } },      // Case-insensitive match in name
                { category: { $regex: keyword, $options: 'i' } },  // Case-insensitive match in category
                { tags: { $regex: keyword, $options: 'i' } }       // Case-insensitive match in tags
            ]
        };

        // Search in the itineraries collection
        const itineraries = await itineraryModel.find(query);
        res.status(200).json(itineraries);

    } catch (error) {
        res.status(500).json({ message: "Error performing itinerary search", error });
    }
});

module.exports = router;
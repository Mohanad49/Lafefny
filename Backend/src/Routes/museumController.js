const express = require('express');
const Museum = require('../Models/Museum'); // Ensure this path is correct
const router = express.Router();

// Create a new museum
router.post('/', async (req, res) => {
    const museum = new Museum(req.body); // This line should work now
    try {
        const savedMuseum = await museum.save();
        res.status(201).json(savedMuseum);
    } catch (error) {
        console.error("Error saving museum:", error);
        res.status(400).json({ error: error.message });
    }
});

// Get all museums
router.get('/', async (req, res) => {
    try {
        const museums = await Museum.find(); // Fetch all museums from the database
        res.status(200).json(museums); // Send the list of museums as a response
    } catch (error) {
        console.error("Error retrieving museums:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get a specific museum by ID
router.get('/:id', async (req, res) => {
    try {
        const museum = await Museum.findById(req.params.id);
        if (!museum) return res.status(404).json({ error: "Museum not found" });
        res.status(200).json(museum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a museum by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedMuseum = await Museum.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMuseum) return res.status(404).json({ error: "Museum not found" });
        res.status(200).json(updatedMuseum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a museum by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedMuseum = await Museum.findByIdAndDelete(req.params.id);
        if (!deletedMuseum) return res.status(404).json({ error: "Museum not found" });
        res.status(200).json({ message: "Museum deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Router to fetch upcoming museum events
router.get('/upcomingMuseumEvent', async (req, res) => {
    try {
        const museums = await museumModel.find({
            date: { $gt: new Date() } // Only fetch future museum events
        }).sort({ date: 1 }); // Sort by ascending date

        res.status(200).json(museums);

    } catch (error) {
        res.status(500).json({ message: "Error fetching upcoming museums", error });
    }
});

router.get('/filterMuseums', async (req, res) => {
    try {
        const { tag } = req.query;

        // Build the query object dynamically based on the provided tag
        const query = {};

        // Apply tag filter if provided
        if (tag) {
            query.tags = { $in: [tag] }; // Check if the tag exists in the tags array
        }

        // Fetch the filtered historical places and museums
        const places = await museumModel.find(query).sort({ name: 1 }); // Sort alphabetically by name

        // Return the filtered places
        res.status(200).json(places);

    } catch (error) {
        // Handle any errors during fetching
        res.status(500).json({ message: "Error fetching places by tag", error });
    }
});


router.get('/searchMuseums', async (req, res) => {
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

        // Search in the museums collection
        const museums = await museumModel.find(query);
        res.status(200).json(museums);

    } catch (error) {
        res.status(500).json({ message: "Error performing museum search", error });
    }
});

module.exports = router;
const Order = require('../Models/Order');
const Activity = require('../Models/Activity');
const TouristItinerary = require('../Models/Tourist-Itinerary');
const Seller = require('../Models/sellerModel');
const Advertiser = require('../Models/advertiserModel');
const TourGuide = require('../Models/tourGuideModel');
const mongoose = require('mongoose');

const userSalesReportService = {
  // For Sellers (Gift Shop)
  async getSellerSalesReport(userId, startDate, endDate, filters = {}) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const { productId, month, year } = filters;

      const seller = await Seller.findOne({ userID: userId });
      if (!seller) throw new Error('Seller not found');

      // Build match conditions
      let matchConditions = {
        orderDate: { $gte: start, $lte: end },
        orderStatus: { $ne: 'Cancelled' }
      };

      // Add month/year filters if provided
      if (month || year) {
        matchConditions.$expr = {};
        if (month) {
          matchConditions.$expr.$eq = [{ $month: '$orderDate' }, parseInt(month)];
        }
        if (year) {
          if (matchConditions.$expr.$eq) {
            matchConditions.$expr = {
              $and: [
                { $eq: [{ $month: '$orderDate' }, parseInt(month)] },
                { $eq: [{ $year: '$orderDate' }, parseInt(year)] }
              ]
            };
          } else {
            matchConditions.$expr.$eq = [{ $year: '$orderDate' }, parseInt(year)];
          }
        }
      }

      // Add product filter if provided
      if (productId) {
        matchConditions['products.productId'] = new mongoose.Types.ObjectId(productId);
      }

      const sales = await Order.aggregate([
        {
          $match: matchConditions
        },
        {
          $unwind: '$products'
        },
        {
          $lookup: {
            from: 'products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        {
          $match: {
            'productDetails.ownerID': seller._id
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$orderDate' },
              year: { $year: '$orderDate' },
              product: '$products.productId'
            },
            revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
            quantitySold: { $sum: '$products.quantity' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id.product',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]);

      return {
        period: { start, end },
        filters: {
          productId,
          month,
          year
        },
        sellerInfo: {
          name: seller.name,
          description: seller.description
        },
        salesData: sales,
        summary: {
          totalRevenue: sales.reduce((acc, curr) => acc + curr.revenue, 0),
          totalOrders: sales.reduce((acc, curr) => acc + curr.orderCount, 0),
          totalQuantitySold: sales.reduce((acc, curr) => acc + curr.quantitySold, 0)
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // For Advertisers (Activities)
  // Updated Advertiser Sales Report with Filters
  async getAdvertiserSalesReport(userId, startDate, endDate, filters = {}) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const { activityId, month, year } = filters;

      const advertiser = await Advertiser.findOne({ userID: userId });
      if (!advertiser) throw new Error('Advertiser not found');

      // Build match conditions
      const matchConditions = {
        advertiser: userId,
        date: { $gte: start, $lte: end }
      };

      // Add specific activity filter if provided
      if (activityId) {
        matchConditions._id = new mongoose.Types.ObjectId(activityId);
      }

      // Add month/year filters if provided
      if (month || year) {
        matchConditions.$expr = {};
        if (month) {
          matchConditions.$expr.$eq = [{ $month: '$date' }, parseInt(month)];
        }
        if (year) {
          if (matchConditions.$expr.$eq) {
            matchConditions.$expr = {
              $and: [
                { $eq: [{ $month: '$date' }, parseInt(month)] },
                { $eq: [{ $year: '$date' }, parseInt(year)] }
              ]
            };
          } else {
            matchConditions.$expr.$eq = [{ $year: '$date' }, parseInt(year)];
          }
        }
      }

      const activities = await Activity.aggregate([
        {
          $match: matchConditions
        },
        {
          $addFields: {
            // Combine both touristBookings and paidBy arrays for total bookings
            allBookings: {
              $setUnion: [
                { $ifNull: ['$touristBookings', []] },
                { $ifNull: ['$paidBy', []] }
              ]
            }
          }
        },
        {
          $project: {
            name: 1,
            date: 1,
            price: 1,
            allBookings: 1,
            'ratings.averageRating': 1,
            bookingsCount: { $size: '$allBookings' }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              year: { $year: '$date' },
              activity: '$name'
            },
            revenue: { $sum: { $multiply: ['$price', '$bookingsCount'] } },
            bookings: { $sum: '$bookingsCount' },
            averageRating: { $first: '$ratings.averageRating' }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]);

      console.log('Sales Report Data:', {
        activities,
        matchConditions,
        advertiserId: userId
      });

      return {
        period: { start, end },
        filters: {
          activityId,
          month,
          year
        },
        advertiserInfo: {
          company: advertiser.company,
          website: advertiser.website
        },
        activitySales: activities,
        summary: {
          totalRevenue: activities.reduce((acc, curr) => acc + curr.revenue, 0),
          totalBookings: activities.reduce((acc, curr) => acc + curr.bookings, 0),
          totalActivities: activities.length,
          averageRating: activities.length > 0 
            ? activities.reduce((acc, curr) => acc + (curr.averageRating || 0), 0) / activities.length 
            : 0
        }
      };
    } catch (error) {
      console.error('Error in getAdvertiserSalesReport:', error);
      throw error;
    }
  },


  // For Tour Guides (Itineraries)
  // Updated Tour Guide Sales Report with Filters
  async getTourGuideSalesReport(userId, startDate, endDate, filters = {}) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const { itineraryId, month, year } = filters;

      const tourGuide = await TourGuide.findOne({ userID: userId });
      if (!tourGuide) throw new Error('Tour Guide not found');

      // Build match conditions based on filters
      const matchConditions = {
        tourGuideName: tourGuide._id.toString(),
        startDate: { $gte: start, $lte: end },
        paidBy: { $exists: true, $not: { $size: 0 } }
      };

      // Add specific itinerary filter if provided
      if (itineraryId) {
        matchConditions._id = new mongoose.Types.ObjectId(itineraryId);
      }

      // Add month/year filters if provided
      if (month) {
        matchConditions.$expr = {
          $eq: [{ $month: '$startDate' }, parseInt(month)]
        };
      }
      if (year) {
        if (matchConditions.$expr) {
          matchConditions.$expr = {
            $and: [
              matchConditions.$expr,
              { $eq: [{ $year: '$startDate' }, parseInt(year)] }
            ]
          };
        } else {
          matchConditions.$expr = { 
            $eq: [{ $year: '$startDate' }, parseInt(year)] 
          };
        }
      }

      const itineraries = await TouristItinerary.aggregate([
        {
          $match: matchConditions
        },
        {
          $group: {
            _id: {
              month: { $month: '$startDate' },
              year: { $year: '$startDate' },
              itinerary: '$name'
            },
            revenue: { $sum: { $multiply: ['$price', { $size: '$paidBy' }] } },
            bookings: { $sum: { $size: '$paidBy' } },
            itineraryCount: { $sum: 1 },
            averageRating: { $avg: '$ratings.averageRating' }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]);

      return {
        period: { start, end },
        filters: {
          itineraryId,
          month,
          year
        },
        tourGuideInfo: {
          experience: tourGuide.yearsOfExperience,
          averageRating: tourGuide.ratings.averageRating
        },
        monthlySales: itineraries,
        summary: {
          totalRevenue: itineraries.reduce((acc, curr) => acc + curr.revenue, 0),
          totalBookings: itineraries.reduce((acc, curr) => acc + curr.bookings, 0),
          totalItineraries: itineraries.reduce((acc, curr) => acc + curr.itineraryCount, 0),
          overallAverageRating: itineraries.reduce((acc, curr) => acc + (curr.averageRating || 0), 0) / 
                               (itineraries.filter(i => i.averageRating).length || 1)
        }
      };
    } catch (error) {
      throw error;
    }
  }
};
module.exports = userSalesReportService;
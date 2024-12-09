const Order = require('../Models/Order');
const TouristItinerary = require('../Models/Tourist-itinerary');
const Activity = require('../Models/Activity');

const APP_RATE_PERCENTAGE = 0.10; // 10% app rate

const salesReportService = {
  async generateSalesReport(startDate, endDate, filters = {}) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const { productId, month, year, type } = filters;

      // Build base match conditions
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

      // Product-specific filter for gift shop sales
      let giftShopMatch = { ...matchConditions };
      if (productId) {
        giftShopMatch['products.productId'] = new mongoose.Types.ObjectId(productId);
      }

      // Determine which sales to fetch based on type
      let giftShopSales = [], itinerarySales = [], activitySales = [];

      // Gift Shop Sales
      if (!type || type === 'products') {
        giftShopSales = await Order.aggregate([
          {
            $match: giftShopMatch
          },
          {
            $unwind: '$products'
          },
          {
            $group: {
              _id: {
                month: { $month: '$orderDate' },
                year: { $year: '$orderDate' },
                product: '$products.productId'
              },
              totalSales: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
              orderCount: { $sum: 1 },
              quantitySold: { $sum: '$products.quantity' }
            }
          }
        ]);
      }

      // Itinerary Sales
      if (!type || type === 'itineraries') {
        itinerarySales = await TouristItinerary.aggregate([
          {
            $match: {
              startDate: { $gte: start, $lte: end },
              paidBy: { $exists: true, $not: { $size: 0 } },
              ...(month && { $expr: { $eq: [{ $month: '$startDate' }, parseInt(month)] } }),
              ...(year && { $expr: { $eq: [{ $year: '$startDate' }, parseInt(year)] } })
            }
          },
          {
            $group: {
              _id: {
                month: { $month: '$startDate' },
                year: { $year: '$startDate' }
              },
              totalSales: { $sum: '$price' },
              bookingCount: { $sum: { $size: '$paidBy' } }
            }
          }
        ]);
      }

      // Activity Sales
      if (!type || type === 'events') {
        activitySales = await Activity.aggregate([
          {
            $match: {
              date: { $gte: start, $lte: end },
              paidBy: { $exists: true, $not: { $size: 0 } },
              ...(month && { $expr: { $eq: [{ $month: '$date' }, parseInt(month)] } }),
              ...(year && { $expr: { $eq: [{ $year: '$date' }, parseInt(year)] } })
            }
          },
          {
            $group: {
              _id: {
                month: { $month: '$date' },
                year: { $year: '$date' }
              },
              totalSales: { $sum: '$price' },
              bookingCount: { $sum: { $size: '$paidBy' } }
            }
          }
        ]);
      }

      // Calculate totals
      const totalGiftShopSales = giftShopSales.reduce((acc, curr) => acc + curr.totalSales, 0);
      const totalItinerarySales = itinerarySales.reduce((acc, curr) => acc + curr.totalSales, 0);
      const totalActivitySales = activitySales.reduce((acc, curr) => acc + curr.totalSales, 0);

      // Calculate app revenue
      const itineraryAppRevenue = totalItinerarySales * APP_RATE_PERCENTAGE;
      const activityAppRevenue = totalActivitySales * APP_RATE_PERCENTAGE;

      return {
        period: { start, end },
        filters: {
          productId,
          month,
          year,
          type
        },
        giftShop: {
          sales: giftShopSales,
          totalSales: totalGiftShopSales
        },
        itineraries: {
          sales: itinerarySales,
          totalSales: totalItinerarySales,
          appRevenue: itineraryAppRevenue
        },
        activities: {
          sales: activitySales,
          totalSales: totalActivitySales,
          appRevenue: activityAppRevenue
        },
        summary: {
          totalGrossSales: totalGiftShopSales + totalItinerarySales + totalActivitySales,
          totalAppRevenue: itineraryAppRevenue + activityAppRevenue
        }
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = salesReportService;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { IsActive } from "../users/user.interface";
import { User } from "../users/user.model";

const date = new Date();
const SevenDaysBefore = new Date(date).setDate(date.getDate() - 7);
const ThirtyDaysBefore = new Date(date).setDate(date.getDate() - 30);

const getUserStats = async () => {

    const totalUsersPromise = User.countDocuments();
    const totalActiveUsersPromise = User.countDocuments({ isActive: IsActive.ACTIVE });
    const totalInActiveUsersPromise = User.countDocuments({ isActive: IsActive.INACTIVE });
    const totalBlockedUsersPromise = User.countDocuments({ isActive: IsActive.BLOCKED });
    const newUsersInLast7DaysPromise = User.countDocuments({
        createdAt: { $gte: SevenDaysBefore }
    });
    const newUsersInLast30DaysPromise = User.countDocuments({
        createdAt: { $gte: ThirtyDaysBefore }
    });
    const usersByRolePromise = User.aggregate([
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ])

    const [
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole
    ] = await Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7DaysPromise,
        newUsersInLast30DaysPromise,
        usersByRolePromise
    ])

    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole
    }
}

const getTourStats = async () => {

    const totalToursPromise = Tour.countDocuments();
    const totalToursByTourTypePromise = Tour.aggregate([
        {
            $lookup: {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "typeDetails"
            }
        },
        {
            $unwind: "$typeDetails",

        },
        {
            $group: {
                _id: "$typeDetails.name",
                count: { $sum: 1 }
            }
        }
    ]);
    const avgTourCostPromise = Tour.aggregate([
        //Stage-1 : group the cost from, do sum, and average the sum
        {
            $group: {
                _id: null,
                avgCostFrom: { $avg: "$costFrom" }
            }
        }
    ])

    const totalTourByDivisionPromise = Tour.aggregate([
        // stage-1 : connect Division model - lookup stage
        {
            $lookup: {
                from: "divisions",
                localField: "division",
                foreignField: "_id",
                as: "division"
            }
        },
        //stage - 2 : unwind the array to object

        {
            $unwind: "$division"
        },

        //stage - 3 : grouping tour type
        {
            $group: {
                _id: "$division.name",
                count: { $sum: 1 }
            }
        }
    ])

    const totalHighestBookedTourPromise = Booking.aggregate([
        // stage-1 : Group the tour
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },

        //stage-2 : sort the tour

        {
            $sort: { bookingCount: -1 }
        },

        //stage-3 : sort
        {
            $limit: 5
        },

        //stage-4 lookup stage
        {
            $lookup: {
                from: "tours",
                let: { tourId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$tourId"] }
                        }
                    }
                ],
                as: "tour"
            }
        },
        //stage-5 unwind stage
        { $unwind: "$tour" },

        //stage-6 Project stage
        {
            $project: {
                bookingCount: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ])

    const [
        totalTours,
        totalToursByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestBookedTour
    ] = await Promise.all([
        totalToursPromise,
        totalToursByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise
    ])

    return {
        totalTours,
        totalToursByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestBookedTour
    };
}

const getBookingStats = async () => {
    const totalBookingPromise = Booking.countDocuments();
    const totalBookingByStatusPromise = Booking.aggregate([
        //stage-1 group stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ])

    const bookingsPerTourPromise = Booking.aggregate([
        //stage1 group stage

        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },

        //stage-2 sort stage
        {
            $sort: { bookingCount: -1 }
        },

        //stage-3 limit stage
        {
            $limit: 10
        },

        //stage-4 lookup stage
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour"
            }
        },

        // stage5 - unwind stage
        {
            $unwind: "$tour"
        },

        // stage6 project stage

        {
            $project: {
                bookingCount: 1,
                _id: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ])

    const avgGuestCountPerBookingPromise = Booking.aggregate([
        // stage 1  - group stage
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: "$guestCount" }
            }
        }
    ])

    const bookingsLast7DaysPromise = Booking.countDocuments({
        createdAt: { $gte: SevenDaysBefore }
    })
    const bookingsLast30DaysPromise = Booking.countDocuments({
        createdAt: { $gte: ThirtyDaysBefore }
    })

    const totalBookingByUniqueUsersPromise = Booking.distinct("user").then((user: any) => user.length)

    const [
        totalBooking,
        totalBookingByStatus,
        bookingsPerTour,
        avgGuestCountPerBooking,
        bookingsLast7Days,
        bookingsLast30Days,
        totalBookingByUniqueUsers
    ] = await Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingsPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingsLast7DaysPromise,
        bookingsLast30DaysPromise,
        totalBookingByStatusPromise,
        totalBookingByUniqueUsersPromise
    ])

    return {
        totalBooking,
        totalBookingByStatus,
        bookingsPerTour,
        avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount,
        bookingsLast7Days,
        bookingsLast30Days,
        totalBookingByUniqueUsers
    };
};

const getPaymentStats = async () => {

    const totalPaymentPromise = Payment.countDocuments();

    const totalPaymentByStatusPromise = Payment.aggregate([
        //stage 1 group
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ])

    const totalRevenuePromise = Payment.aggregate([
        //stage1 match stage
        {
            $match: { status: PAYMENT_STATUS.PAID }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" }
            }
        }
    ])

    const avgPaymentAmountPromise = Payment.aggregate([
        //stage 1 group stage
        {
            $group: {
                _id: null,
                avgPaymentAMount: { $avg: "$amount" }
            }
        }
    ])

    const paymentGatewayDataPromise = Payment.aggregate([
        //stage 1 group stage
        {
            $group: {
                _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
                count: { $sum: 1 }
            }
        }
    ])



    const [totalPayment, totalPaymentByStatus, totalRevenue, avgPaymentAmount, paymentGatewayData] = await Promise.all([
        totalPaymentPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise

    ])
    return { totalPayment, totalPaymentByStatus, totalRevenue, avgPaymentAmount, paymentGatewayData }
}

export const StatsService = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getTourStats,
}
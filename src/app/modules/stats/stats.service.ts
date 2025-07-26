import { Booking } from "../booking/booking.model";
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


    return {};
};

const getPaymentStats = async () => {

    return {};
}

export const StatsService = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getTourStats,
}
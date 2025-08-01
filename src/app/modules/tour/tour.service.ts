
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

const createTour = async (payload: ITour) => {
    const existingTour = await Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }

    const tour = await Tour.create(payload)

    return tour;
};

const getAllTours = async (query: Record<string, string>) => {


    const queryBuilder = new QueryBuilder(Tour.find(), query)

    const tours = await queryBuilder
        .search(tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    // const meta = await queryBuilder.getMeta();
    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};


const updateTour = async (id: string, payload: Partial<ITour>) => {

    const existingTour = await Tour.findById(id);

    if (!existingTour) {
        throw new Error("Tour not found.");
    }

    if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images]
    }
    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {

        const restDBImages = existingTour.images.filter(imageUrl => !payload.deleteImages?.includes(imageUrl))

        const updatedPayloadImages = (payload.images || [])
            .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
            .filter(imageUrl => !restDBImages.includes(imageUrl))

        payload.images = [...restDBImages, ...updatedPayloadImages]
    }
    const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        await Promise.all(payload.deleteImages.map(url => deleteImageFromCloudinary(url)));
    }

    return updatedTour;
};

const getSingleTour = async (slug: string) => {
    const tour = await Tour.findOne({ slug });
    return {
        data: tour,
    }
};

const deleteTour = async (id: string) => {
    return await Tour.findByIdAndDelete(id);
};

const createTourType = async (payload: ITourType) => {
    const existingTourType = await TourType.findOne({ name: payload });

    if (existingTourType) {
        throw new Error("Tour type already exists.");
    }
    const name = payload;

    return await TourType.create({ name });
};
const getAllTourTypes = async () => {
    return await TourType.find();
};
const updateTourType = async (id: string, payload: ITourType) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }
    const name = payload;
    const updatedTourType = await TourType.findByIdAndUpdate(id, { name }, { new: true });
    return updatedTourType;
};

const getSingleTourType = async (id: string) => {
    const tourType = await TourType.findById(id);
    return {
        data: tourType
    };
};

const deleteTourType = async (id: string) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }
    return await TourType.findByIdAndDelete(id);
};

export const TourService = {
    createTourType,
    deleteTourType,
    updateTourType,
    getAllTourTypes,
    getSingleTourType,
    createTour,
    getAllTours,
    updateTour,
    getSingleTour,
    deleteTour,
};
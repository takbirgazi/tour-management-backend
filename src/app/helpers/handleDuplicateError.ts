import { TGenericErrorResponse } from "../interfaces/error.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleDuplicateError = (err: any): TGenericErrorResponse => {

    const duplicateVal = err.message.match(/"([^"]*)"/);

    return {
        statusCode: 400,
        message: `${duplicateVal[1]} Already Exist!`
    }
}
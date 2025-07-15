"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handelValidationError = void 0;
const handelValidationError = (err) => {
    const errorSources = [];
    const errors = Object.values(err.errors);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors.forEach((errorObj) => errorSources.push({
        path: errorObj.path,
        message: errorObj.message
    }));
    return {
        statusCode: 400,
        message: `Validation Error!`,
        errorSources
    };
};
exports.handelValidationError = handelValidationError;

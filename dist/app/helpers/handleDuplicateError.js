"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDuplicateError = (err) => {
    const duplicateVal = err.message.match(/"([^"]*)"/);
    return {
        statusCode: 400,
        message: `${duplicateVal[1]} Already Exist!`
    };
};
exports.handleDuplicateError = handleDuplicateError;

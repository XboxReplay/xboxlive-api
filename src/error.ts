import * as HTTPStatusCodes from 'http-status-codes';
import { ExtraErrorProperties } from '..';

class XboxLiveAPIError extends Error {
    XBLAuthError: boolean = true;
    extra: ExtraErrorProperties;

    constructor(message: string = '', extra: ExtraErrorProperties = {}) {
        super(message);
        Error.captureStackTrace(this, XboxLiveAPIError);
        this.name = 'XboxLiveAuthError';
        this.extra = extra;
    }
}

const errors = {
    internal: (
        message = 'Something went wrong...',
        statusCode = HTTPStatusCodes.INTERNAL_SERVER_ERROR
    ) =>
        new XboxLiveAPIError(message, {
            statusCode,
            reason: 'INTERNAL_ERROR'
        }),
    forbidden: (
        message = 'Forbidden',
        statusCode = HTTPStatusCodes.FORBIDDEN
    ) =>
        new XboxLiveAPIError(message, {
            statusCode,
            reason: 'FORBIDDEN'
        }),
    unauthorized: (
        message = 'Unauthorized',
        statusCode = HTTPStatusCodes.UNAUTHORIZED
    ) =>
        new XboxLiveAPIError(message, {
            statusCode,
            reason: 'UNAUTHORIZED'
        }),
    badRequest: (
        message = 'Bad request',
        statusCode = HTTPStatusCodes.BAD_REQUEST
    ) =>
        new XboxLiveAPIError(message, {
            statusCode,
            reason: 'BAD_REQUEST'
        }),
    requestError: (
        message = 'Request error',
        statusCode = HTTPStatusCodes.BAD_REQUEST
    ) =>
        new XboxLiveAPIError(message, {
            statusCode,
            reason: 'REQUEST_ERROR'
        })
};

export = errors;

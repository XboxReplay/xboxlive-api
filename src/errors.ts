import { XboxReplayError } from '@xboxreplay/errors';
import * as HTTPStatusCodes from './http-status-codes';

const errors = {
    internal: (
        message = 'Something went wrong...',
        statusCode = HTTPStatusCodes.INTERNAL_SERVER_ERROR
    ) =>
        new XboxReplayError(message, {
            statusCode,
            reason: 'INTERNAL_ERROR'
        }),
    forbidden: (
        message = 'Forbidden',
        statusCode = HTTPStatusCodes.FORBIDDEN
    ) =>
        new XboxReplayError(message, {
            statusCode,
            reason: 'FORBIDDEN'
        }),
    unauthorized: (
        message = 'Unauthorized',
        statusCode = HTTPStatusCodes.UNAUTHORIZED
    ) =>
        new XboxReplayError(message, {
            statusCode,
            reason: 'UNAUTHORIZED'
        }),
    badRequest: (
        message = 'Bad request',
        statusCode = HTTPStatusCodes.BAD_REQUEST
    ) =>
        new XboxReplayError(message, {
            statusCode,
            reason: 'BAD_REQUEST'
        }),
    requestError: (
        message = 'Request error',
        statusCode = HTTPStatusCodes.BAD_REQUEST
    ) =>
        new XboxReplayError(message, {
            statusCode,
            reason: 'REQUEST_ERROR'
        })
};

export = errors;

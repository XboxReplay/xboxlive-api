import * as request from 'request';
import * as HTTPStatusCodes from './http-status-codes';
import * as XboxLiveAPIError from './error';
import { join } from 'path';

import {
    RequestHeaders,
    RequestOptions,
    RequestHTTPMethod,
    XBLAuthorization,
    PlayerScreenshotsResponse,
    PlayerGameclipsResponse,
    Setting,
    PlayerSettingsResponse,
    GetUGCQueryString
} from '../';

// ***** DEFINITIONS ***** //

const USER_AGENT: string = [
    'Mozilla/5.0 (XboxReplay; XboxLiveAPI/1.0)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/71.0.3578.98 Safari/537.36'
].join(' ');

const BASE_HEADERS: RequestHeaders = {
    Accept: 'application/json; charset=utf-8',
    'Accept-Language': 'en-US',
    'User-Agent': USER_AGENT
};

const XBOX_LIVE_DOMAINS = {
    screenshots: 'https://screenshotsmetadata.xboxlive.com/',
    gameclips: 'https://gameclipsmetadata.xboxlive.com/',
    profile: 'https://profile.xboxlive.com/'
};

// ***** PRIVATE METHODS ***** //

const _isCallStatusCodeValid = (statusCode: number): boolean =>
    [
        HTTPStatusCodes.OK,
        HTTPStatusCodes.ACCEPTED,
        HTTPStatusCodes.NO_CONTENT,
        HTTPStatusCodes.CREATED
    ].indexOf(statusCode) !== -1;

const _isXUID = (entry: any) => {
    const n = Number(entry);
    return !isNaN(n) && String(n).length > 15;
};

// ***** PUBLIC METHODS ***** //

export const call = (
    uri: string,
    authorization: XBLAuthorization,
    options: RequestOptions = {}
): Promise<any> => {
    const { userHash, XSTSToken } = authorization;
    const method: RequestHTTPMethod = options.method || 'GET';
    const headers = options.headers || {};
    const qs = options.qs ? options.qs : void 0;
    const payload = options.payload || void 0;

    return new Promise((resolve, reject) => {
        request(
            {
                uri,
                qs,
                json: payload === void 0 ? true : payload,
                followRedirect: true,
                gzip: true,
                headers: {
                    ...BASE_HEADERS,
                    'x-xbl-contract-version': 2,
                    Authorization: `XBL3.0 x=${userHash};${XSTSToken}`,
                    ...headers
                },
                method
            },
            (err: any, response: request.Response, body: any) => {
                if (err) return reject(XboxLiveAPIError.internal(err.message));
                const statusCode = response.statusCode;

                if (statusCode === HTTPStatusCodes.FORBIDDEN) {
                    return reject(XboxLiveAPIError.forbidden());
                } else if (statusCode === HTTPStatusCodes.UNAUTHORIZED) {
                    return reject(XboxLiveAPIError.unauthorized());
                }

                if (_isCallStatusCodeValid(response.statusCode) === false)
                    return reject(
                        XboxLiveAPIError.requestError(
                            `Got a request error for "${uri}"`,
                            response.statusCode
                        )
                    );
                else resolve(body);
            }
        );
    });
};

export const getPlayerXUID = async (
    gamertag: string,
    authorization: XBLAuthorization
): Promise<string> => {
    if (_isXUID(gamertag)) {
        return gamertag;
    }

    const response = await call(
        XBOX_LIVE_DOMAINS.profile +
            join('users', `gt(${encodeURIComponent(gamertag)})`, 'settings'),
        authorization
    );

    if (response.profileUsers[0] === void 0) {
        throw XboxLiveAPIError.internal();
    } else return response.profileUsers[0].id;
};

export const getPlayerSettings = async (
    gamertag: string,
    authorization: XBLAuthorization,
    settings: Setting[] = []
): Promise<PlayerSettingsResponse> => {
    const response = await call(
        XBOX_LIVE_DOMAINS.profile +
            join('users', `gt(${encodeURIComponent(gamertag)})`, 'settings'),
        authorization,
        { qs: { settings: settings.join(',') } }
    );

    if (response.profileUsers[0] === void 0) {
        throw XboxLiveAPIError.internal();
    }

    return response.profileUsers[0].settings;
};

export const getPlayerScreenshots = async (
    gamertag: string,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString | number = {}
): Promise<PlayerScreenshotsResponse> => {
    const playerXUID = await getPlayerXUID(gamertag, authorization);

    // Prevent breaking change with 1.0.0 version
    if (typeof qs === 'number') {
        qs = { maxItems: qs };
    }

    return call(
        XBOX_LIVE_DOMAINS.screenshots +
            join('users', `xuid(${playerXUID})`, 'screenshots'),
        authorization,
        {
            qs: {
                maxItems: qs.maxItems || 25,
                continuationToken: qs.continuationToken
            }
        }
    );
};

export const getPlayerGameclips = async (
    gamertag: string,
    authorization: XBLAuthorization,
    qs: GetUGCQueryString | number = {}
): Promise<PlayerGameclipsResponse> => {
    const playerXUID = await getPlayerXUID(gamertag, authorization);

    // Prevent breaking change with 1.0.0 version
    if (typeof qs === 'number') {
        qs = { maxItems: qs };
    }

    return call(
        XBOX_LIVE_DOMAINS.gameclips +
            join('users', `xuid(${playerXUID})`, 'clips'),
        authorization,
        {
            qs: {
                maxItems: qs.maxItems || 25,
                continuationToken: qs.continuationToken
            }
        }
    );
};

import * as request from 'request';
import * as XboxLiveAPIError from './errors';
import * as HTTPStatusCodes from 'http-status-codes';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
	IRequestHeaders,
	ICallProperties,
	HTTPMethod,
	IAuthorization,
	PlayerGamertag,
	XboxLiveDomains,
	PlayerSettings,
	IPlayerScreenshotsResponse,
	IPlayerGameclipsResponse,
	PlayerXUIDResponse,
	PlayerSettingsResponse
} from './__typings__';

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));
const USER_AGENT: string = `Mozilla/5.0 (XboxReplay; XboxLiveAPI ${version}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36`;
const BASE_HEADERS: IRequestHeaders = {
	Accept: 'application/json; charset=utf-8',
	'Accept-Language': 'en-US',
	'User-Agent': USER_AGENT
};

// ***** PRIVATE METHODS ***** //

const _isCallStatusCodeValid = (statusCode: number): boolean =>
	[
		HTTPStatusCodes.OK,
		HTTPStatusCodes.ACCEPTED,
		HTTPStatusCodes.NO_CONTENT,
		HTTPStatusCodes.CREATED
	].indexOf(statusCode) !== -1;

// ***** PUBLIC METHODS ***** //

export const call = (
	endpoint: string,
	authorization: IAuthorization,
	properties: ICallProperties = {}
): Promise<any> => {
	const { userHash, XSTSToken } = authorization;
	const method: HTTPMethod = properties.method || 'GET';
	const qs = properties.qs ? properties.qs : void 0;
	const payload = properties.payload || void 0;

	return new Promise((resolve, reject) => {
		request(
			{
				uri: endpoint,
				qs,
				json: payload === void 0 ? true : payload,
				followRedirect: true,
				headers: {
					...BASE_HEADERS,
					'x-xbl-contract-version': 2,
					Authorization: `XBL3.0 x=${userHash};${XSTSToken}`
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
							`Got a request error for "${endpoint}"`,
							response.statusCode
						)
					);
				else resolve(body);
			}
		);
	});
};

export const getPlayerXUID = async (
	gamertag: PlayerGamertag,
	authorization: IAuthorization
): Promise<PlayerXUIDResponse> => {
	if (!isNaN(Number(gamertag)) && String(gamertag).length === 16) {
		const xuid: PlayerXUIDResponse = gamertag;
		return xuid;
	}

	const response = await call(
		XboxLiveDomains.Profile +
			join('users', `gt(${encodeURIComponent(gamertag)})`, 'settings'),
		authorization
	);

	if (response.profileUsers[0] === void 0) {
		throw XboxLiveAPIError.internal();
	}

	return response.profileUsers[0].id;
};

export const getPlayerSettings = async (
	gamertag: PlayerGamertag,
	authorization: IAuthorization,
	settings: PlayerSettings = []
): Promise<PlayerSettingsResponse> => {
	const response = await call(
		XboxLiveDomains.Profile +
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
	gamertag: PlayerGamertag,
	authorization: IAuthorization,
	maxItems: number = 25
): Promise<IPlayerScreenshotsResponse> => {
	const playerXUID = await getPlayerXUID(gamertag, authorization);
	return call(
		XboxLiveDomains.Screenshots +
			join('users', `xuid(${playerXUID})`, 'screenshots'),
		authorization,
		{ qs: { maxItems } }
	);
};

export const getPlayerGameclips = async (
	gamertag: PlayerGamertag,
	authorization: IAuthorization,
	maxItems: number = 25
): Promise<IPlayerGameclipsResponse> => {
	const playerXUID = await getPlayerXUID(gamertag, authorization);
	return call(
		XboxLiveDomains.Gameclips +
			join('users', `xuid(${playerXUID})`, 'clips'),
		authorization,
		{ qs: { maxItems } }
	);
};

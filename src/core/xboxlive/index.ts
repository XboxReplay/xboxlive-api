import errors from '@xboxreplay/errors';
import axios, { AxiosRequestConfig } from 'axios';
import xboxLiveConfig from './config';
import commonConfig from '../../config';
import { join } from 'path';

import {
	Setting,
	XBLAuthorization,
	ProfileResponse,
	SettingsNode,
	GetUGCQueryString,
	PlayerScreenshotsResponse,
	PlayerGameClipsResponse,
	GetActivityQueryString,
	ActivityHistoryResponse,
	PlayerScreenshotsFromActivityHistoryResponse,
	PlayerGameClipsFromActivityHistoryResponse,
	MediaHubScreenshotResponseNode,
	MediaHubGameClipResponseNode,
	MediaHubResponse,
	GetMediaHubItemsPayload
} from '../..';

//#region private methods

const _isXUID = (entry: string | number) =>
	/^([0-9]+)$/g.test(entry.toString());

const _is2XX = (statusCode: number) => {
	const s = String(statusCode);
	// It ain't stupid if it works
	return s.length === 3 && s[0] === '2';
};

const _getPlayerUGC = async <T>(
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	qs: GetUGCQueryString = {},
	type: 'screenshots' | 'gameclips'
) => {
	const target =
		_isXUID(gamertagOrXUID) === true
			? `xuid(${gamertagOrXUID})`
			: `xuid(${await getPlayerXUID(
					gamertagOrXUID as string,
					authorization
			  )})`;

	return call<T>(
		{
			url: `${xboxLiveConfig.uris[type]}/${join(
				'users',
				target,
				type === 'screenshots' ? 'screenshots' : 'clips'
			)}`,
			params: {
				maxItems: qs.maxItems || 25,
				continuationToken: qs.continuationToken
			}
		},
		authorization
	);
};

const _getFromMediaHub = async <
	T = MediaHubScreenshotResponseNode | MediaHubGameClipResponseNode
>(
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	payload: GetMediaHubItemsPayload = {},
	target: 'screenshots' | 'gameclips'
): Promise<MediaHubResponse<T>> => {
	const xuid =
		_isXUID(gamertagOrXUID) === true
			? gamertagOrXUID
			: await getPlayerXUID(gamertagOrXUID as string, authorization);

	return call<MediaHubResponse<T>>(
		{
			url: `https://mediahub.xboxlive.com/${target}/search`,
			method: 'POST',
			data: {
				query: [`OwnerXuid eq ${xuid.toString()}`, payload.query]
					.filter(q => !!q)
					.join(' and '),
				max: Math.min(payload.max || 100, 100),
				skip: Math.max(payload.skip || 0, 0),
				continuationToken: payload?.continuationToken
			}
		},
		authorization
	);
};

//#endregion
//#region public methods

export const call = <T = any>(
	config: AxiosRequestConfig = {},
	{ userHash, XSTSToken }: XBLAuthorization,
	XBLContractVersion = 2
): Promise<T> => {
	const XBLContractVersionHeader = {
		'x-xbl-contract-version': XBLContractVersion
	};

	config.responseType = config.responseType || 'json';

	config.headers = {
		...XBLContractVersionHeader,
		...commonConfig.request.baseHeaders,
		Authorization: `XBL3.0 x=${userHash};${XSTSToken}`,
		...(config.headers || {})
	};

	return axios(config)
		.then(response => {
			if (_is2XX(response.status) === false) {
				throw errors.internal(
					`Invalid response status code for "${config.url}", got "${response.status}".`
				);
			} else return response.data as T;
		})
		.catch(err => {
			if (!!err.__XboxReplay__) throw err;
			else if (err.response?.status === 400) throw errors.badRequest();
			else if (err.response?.status === 401) throw errors.unauthorized();
			else if (err.response?.status === 403) throw errors.forbidden();
			else if (err.response?.status === 429)
				throw errors.build('Too many requests.', {
					statusCode: 429,
					reason: 'TOO_MANY_REQUESTS'
				});
			else if (err.response?.status === 404)
				throw errors.build('Not found.', {
					statusCode: 404,
					reason: 'NOT_FOUND'
				});
			else throw errors.internal(err.message);
		});
};

export const getPlayerXUID = async (
	gamertag: string,
	authorization: XBLAuthorization
): Promise<string> => {
	if (_isXUID(gamertag)) {
		return String(gamertag);
	}

	const response = await call<ProfileResponse>(
		{
			url: `${xboxLiveConfig.uris.profile}/${join(
				'users',
				`gt(${encodeURIComponent(gamertag)})`,
				'settings'
			)}`
		},
		authorization
	);

	if (response?.profileUsers?.[0]?.id === void 0) {
		throw errors.internal("Could not resolve player's XUID.");
	} else return response.profileUsers[0].id.toString();
};

export const getPlayerSettings = async (
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	settings: Setting[] = []
): Promise<SettingsNode> => {
	const target =
		_isXUID(gamertagOrXUID) === true
			? `xuid(${gamertagOrXUID})`
			: `gt(${encodeURIComponent(gamertagOrXUID as string)})`;

	const response = await call<ProfileResponse>(
		{
			url: `${xboxLiveConfig.uris.profile}/${join(
				'users',
				target,
				'settings'
			)}`,
			params: { settings: settings.join(',') }
		},
		authorization
	);

	if (response.profileUsers[0] === void 0) {
		throw errors.internal("Could not resolve player's settings.");
	} else return response.profileUsers[0].settings || [];
};

export const getPlayerActivityHistory = async (
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	qs: GetActivityQueryString = {}
): Promise<ActivityHistoryResponse> => {
	const target =
		_isXUID(gamertagOrXUID) === true
			? `xuid(${gamertagOrXUID})`
			: `xuid(${await getPlayerXUID(
					gamertagOrXUID as string,
					authorization
			  )})`;

	return call<ActivityHistoryResponse>(
		{
			url: `${xboxLiveConfig.uris.avty}/${join(
				'users',
				target,
				'activity/History'
			)}`,
			params: qs
		},
		authorization
	);
};

export const getPlayerScreenshots = async (
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	qs: GetUGCQueryString = {}
): Promise<PlayerScreenshotsResponse> =>
	_getPlayerUGC<PlayerScreenshotsResponse>(
		gamertagOrXUID,
		authorization,
		qs,
		'screenshots'
	);

export const getPlayerScreenshotsFromMediaHub = (
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	payload: GetMediaHubItemsPayload = {}
) =>
	_getFromMediaHub<MediaHubScreenshotResponseNode>(
		gamertagOrXUID,
		authorization,
		payload,
		'screenshots'
	);

export const getPlayerScreenshotsFromActivityHistory = async (
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	qs: Omit<
		GetActivityQueryString,
		'contentTypes' | 'activityTypes' | 'excludeTypes' | 'includeSelf'
	> = {}
): Promise<PlayerScreenshotsFromActivityHistoryResponse> =>
	getPlayerActivityHistory(gamertagOrXUID, authorization, {
		...qs,
		contentTypes: 'Game',
		activityTypes: 'Screenshot',
		excludeTypes: 'GameDVR'
	});

export const getPlayerGameClips = (
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	qs: GetUGCQueryString = {}
): Promise<PlayerGameClipsResponse> =>
	_getPlayerUGC<PlayerGameClipsResponse>(
		gamertagOrXUID,
		authorization,
		qs,
		'gameclips'
	);

export const getPlayerGameClipsFromMediaHub = (
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	payload: GetMediaHubItemsPayload = {}
) =>
	_getFromMediaHub<MediaHubGameClipResponseNode>(
		gamertagOrXUID,
		authorization,
		payload,
		'gameclips'
	);

export const getPlayerGameClipsFromActivityHistory = async (
	gamertagOrXUID: string | number,
	authorization: XBLAuthorization,
	qs: Omit<
		GetActivityQueryString,
		'contentTypes' | 'activityTypes' | 'excludeTypes' | 'includeSelf'
	> = {}
): Promise<PlayerGameClipsFromActivityHistoryResponse> =>
	getPlayerActivityHistory(gamertagOrXUID, authorization, {
		...qs,
		contentTypes: 'Game',
		activityTypes: 'GameDVR',
		excludeTypes: 'Screenshot'
	});

//#endregion

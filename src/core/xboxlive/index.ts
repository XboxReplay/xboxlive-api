import errors from '@xboxreplay/errors';
import axios, { AxiosRequestConfig } from 'axios';
import xboxLiveConfig from './config';
import commonConfig from '../../config';
import { join } from 'path';

import {
	XBLAuthorization,
	Setting,
	SettingsNode,
	GetUGCQueryString,
	PlayerScreenshotsResponse,
	PlayerGameClipsResponse,
	GetActivityQueryString,
	ActivityHistoryResponse,
	PlayerScreenshotsFromActivityHistoryResponse,
	PlayerGameClipsFromActivityHistoryResponse
} from '../..';

//#region typings

type ProfileResponse = {
	profileUsers: [
		{
			id: string;
			hostId: string;
			settings: SettingsNode;
			isSponsoredUser: false;
		}
	];
};

//#endregion
//#region private methods

const _isXUID = (entry: any) => {
	const n = Number(entry);
	return !isNaN(n) && String(n).length > 15;
};

const _is2XX = (statusCode: number) => {
	const s = String(statusCode);
	// It ain't stupid if it works
	return s.length === 3 && s[0] === '2';
};

const _getPlayerUGC = async <T>(
	gamertag: string,
	authorization: XBLAuthorization,
	qs: GetUGCQueryString = {},
	type: 'screenshots' | 'clips'
) =>
	call<T>(
		{
			url: `${xboxLiveConfig.uris.screenshots}/${join(
				'users',
				`xuid(${await getPlayerXUID(gamertag, authorization)})`,
				type
			)}`,
			params: {
				maxItems: qs.maxItems || 25,
				continuationToken: qs.continuationToken
			}
		},
		authorization
	);

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
			}

			const body = response.data as T;
			return body;
		})
		.catch(err => {
			if (!!err.__XboxReplay__) throw err;
			else if (err.response?.status === 400) throw errors.badRequest();
			else if (err.response?.status === 404)
				throw errors.build('Not found.', { statusCode: 404 });
			else throw errors.internal(err.message);
		});
};

export const getPlayerXUID = async (
	gamertag: string,
	authorization: XBLAuthorization
): Promise<string | null> => {
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

	if (response.profileUsers[0] === void 0) {
		throw errors.internal("Could not resolve player's XUID.");
	} else return response.profileUsers[0].id || null;
};

export const getPlayerSettings = async (
	gamertag: string,
	authorization: XBLAuthorization,
	settings: Setting[] = []
): Promise<SettingsNode> => {
	const response = await call<ProfileResponse>(
		{
			url: `${xboxLiveConfig.uris.profile}/${join(
				'users',
				`gt(${encodeURIComponent(gamertag)})`,
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
	gamertag: string,
	authorization: XBLAuthorization,
	qs: GetActivityQueryString = {}
): Promise<ActivityHistoryResponse> =>
	call<ActivityHistoryResponse>(
		{
			url: `${xboxLiveConfig.uris.avty}/${join(
				'users',
				`xuid(${await getPlayerXUID(gamertag, authorization)})`,
				'activity/History'
			)}`,
			params: qs
		},
		authorization
	);

export const getPlayerScreenshots = async (
	gamertag: string,
	authorization: XBLAuthorization,
	qs: GetUGCQueryString = {}
): Promise<PlayerScreenshotsResponse> =>
	_getPlayerUGC<PlayerScreenshotsResponse>(
		gamertag,
		authorization,
		qs,
		'screenshots'
	);

export const getPlayerScreenshotsFromActivityHistory = async (
	gamertag: string,
	authorization: XBLAuthorization,
	qs: Omit<
		GetActivityQueryString,
		'contentTypes' | 'activityTypes' | 'excludeTypes'
	> = {}
): Promise<PlayerScreenshotsFromActivityHistoryResponse> =>
	getPlayerActivityHistory(gamertag, authorization, {
		...qs,
		contentTypes: 'Game',
		activityTypes: 'Screenshot',
		excludeTypes: 'GameDVR'
	});

export const getPlayerGameClips = (
	gamertag: string,
	authorization: XBLAuthorization,
	qs: GetUGCQueryString = {}
): Promise<PlayerGameClipsResponse> =>
	_getPlayerUGC<PlayerGameClipsResponse>(
		gamertag,
		authorization,
		qs,
		'clips'
	);

export const getPlayerGameClipsFromActivityHistory = async (
	gamertag: string,
	authorization: XBLAuthorization,
	qs: Omit<
		GetActivityQueryString,
		'contentTypes' | 'activityTypes' | 'excludeTypes'
	> = {}
): Promise<PlayerGameClipsFromActivityHistoryResponse> =>
	getPlayerActivityHistory(gamertag, authorization, {
		...qs,
		contentTypes: 'Game',
		activityTypes: 'GameDVR',
		excludeTypes: 'Screenshot'
	});

//#endregion

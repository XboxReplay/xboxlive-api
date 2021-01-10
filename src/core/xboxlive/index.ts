import { v4 } from 'uuid';
import { URL } from 'url';
import { isXBLHostname, matchPlayerIdentifier } from '../../utils';
import axios, { Method } from 'axios';
import commonConfig from '../../config';
import XBLConfig from './config';

//#region typings

type GetPlayerMediaOptions = {
	continuationToken?: string;
	query?: string;
};

//#endregion
//#region private methods

const getPlayerMedia = async (
	player: string,
	category: 'screenshots' | 'clips',
	XBLAuthorization: string,
	options: GetPlayerMediaOptions,
	headers: Record<string, string>
) => {
	const identifier = matchPlayerIdentifier(player);
	const target =
		identifier.type === 'xuid'
			? identifier.value
			: await getPlayerXUID(identifier.value, XBLAuthorization);

	const fetchUrl = `${XBLConfig.baseUrls.mediahub}/${category}/search`;
	const data = {
		query: [`OwnerdXuid eq ${target}`, options.query]
			.filter(p => !!p)
			.join(' AND ')
	};

	const response = await call(
		'POST',
		fetchUrl,
		5,
		XBLAuthorization,
		headers,
		void 0,
		data
	);

	return response;
};

//#endregion
//#region public methods

/**
 * Concat userHash and XSTSToken
 * @param {string} userHash - Current user hash
 * @param {string} XSTSToken - Current XSTS token
 * @returns {string} XBL3.0 authorization
 */
export const concatXBLAuthorization = (userHash: string, XSTSToken: string) =>
	`XBL3.0 x=${userHash};${XSTSToken}`;

/**
 * Default headers used for XSAPI requests
 * @param {number} XBLContractVersion - Service version
 * @param {object=} additionalHeaders - Additional headers, could be used to override default ones
 * @returns {object}
 */
export const getBaseHeaders = (
	XBLContractVersion: number = 0,
	additionalHeaders: Record<string, string> = {}
) => ({
	Pragma: 'no-cache',
	Accept: 'application/json',
	'User-Agent': commonConfig.request.defaultUserAgent,
	'X-Xbl-Contract-Version': String(XBLContractVersion),
	'X-XblCorrelationId': v4(),
	'Cache-Control': 'no-store, must-revalidate, no-cache',
	'Accept-Encoding': 'gzip, deflate, compress',
	'Accept-Language': `${commonConfig.request.defaultLanguage}, ${
		commonConfig.request.defaultLanguage.split('-')[0]
	};q=0.9`,
	...additionalHeaders
});

/**
 * Generic method to request any XSAPI URL
 *
 * Please refer to https://docs.microsoft.com/en-us/gaming/xbox-live/api-ref/xbox-live-rest/uri/atoc-xboxlivews-reference-uris for further information
 * @param {string} method - HTTP method
 * @param {string} url - URL
 * @param {string|number} XBLContractVersion - Service version
 * @param {string=} XBLAuthorization - XBL3.0 authorization
 * @param {object=} headers - Additional headers, could be used to override default ones
 * @param {object=} params - Query parameters
 * @param {object=} data - Payload
 * @returns {Promise<any>}
 */
export const call = async (
	method: Method,
	url: string,
	XBLContractVersion: number,
	XBLAuthorization?: string,
	headers?: Record<string, string>,
	params?: Record<string, any>,
	data?: any
): Promise<any> => {
	const urlInstance = new URL(url);
	const isValidHostname = isXBLHostname(urlInstance.hostname || '');

	if (isValidHostname === false) {
		throw new Error('Specified "url" is invalid');
	}

	const response = await axios({
		url,
		params,
		data,
		method,
		headers: {
			Authorization: XBLAuthorization,
			...getBaseHeaders(XBLContractVersion, headers)
		}
	})
		.then(res => res.data)
		.catch(err => {
			throw err;
		});

	return response;
};

/**
 * Return XUID for a targeted gamertag
 * @param {string} gamertag - Targeted gamertag
 * @param {string} XBLAuthorization - Current XBL3.0 authorization
 * @param {object=} headers - Additional headers, could be used to override default ones
 * @returns {Promise<string>} XUID
 */
export const getPlayerXUID = async (
	gamertag: string,
	XBLAuthorization: string,
	headers: Record<string, string> = {}
): Promise<string> => {
	const identifier = matchPlayerIdentifier(gamertag);

	if (identifier.type === 'xuid') {
		return identifier.value;
	}

	const fetchUrl = `${XBLConfig.baseUrls.profile}/users/gt(${identifier.value})/profile/settings`;
	const response = await call('GET', fetchUrl, 2, XBLAuthorization, headers);

	return response.profileUsers[0].id.toString();
};

/**
 * Return desired settings for a targeted player
 * @param {string} player - Targeted player
 * @param {string[]} settings - Desired settings
 * @param {string} XBLAuthorization - Current XBL3.0 authorization
 * @param {object=} headers - Additional headers, could be used to override default ones
 * @returns {Promise<object>} Requested settings
 */
export const getPlayerSettings = async (
	player: string,
	settings: string[],
	XBLAuthorization: string,
	headers: Record<string, string> = {}
): Promise<string> => {
	const identifier = matchPlayerIdentifier(player);
	const target =
		identifier.type === 'xuid'
			? `xuid(${identifier.value})`
			: `gt(${identifier.value})`;

	const fetchUrl = `${XBLConfig.baseUrls.profile}/users/${target}/profile/settings`;
	const response = await call('GET', fetchUrl, 2, XBLAuthorization, headers, {
		settings: settings.join(',')
	});

	return response.profileUsers[0].settings;
};

/**
 * Return recent "screenshots" for a targeted player
 *
 * Please not that some of media for recent games won't be returned, please refer to the XboxReplay API instead
 * @param {string} player - Targeted player
 * @param {string} XBLAuthorization - Current XBL3.0 authorization
 * @param {object=} options - Additional options such as "continuationToken" or additional "query"
 * @param {object=} headers - Additional headers, could be used to override default ones
 * @returns {Promise<object>} Screenshots
 */
export const getPlayerScreenshots = (
	player: string,
	XBLAuthorization: string,
	options: GetPlayerMediaOptions = {},
	headers: Record<string, string> = {}
) => getPlayerMedia(player, 'screenshots', XBLAuthorization, options, headers);

/**
 * Return recent "clips" for a targeted player
 *
 * Please not that some of media for recent games won't be returned, please refer to the XboxReplay API instead
 * @param {string} player - Targeted player
 * @param {string} XBLAuthorization - Current XBL3.0 authorization
 * @param {object=} options - Additional options such as "continuationToken" or additional "query"
 * @param {object=} headers - Additional headers, could be used to override default ones
 * @returns {Promise<object>} Clips
 */
export const getPlayerGameClips = (
	player: string,
	XBLAuthorization: string,
	options: GetPlayerMediaOptions = {},
	headers: Record<string, string> = {}
) => getPlayerMedia(player, 'clips', XBLAuthorization, options, headers);

//#endregion

import { v4 } from 'uuid';
import { matchPlayerIdentifier } from '../../utils';
import axios from 'axios';
import commonConfig from '../../config';
import XBLConfig from './config';

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
 * @returns {object}
 */
export const getBaseHeaders = (XBLContractVersion: number = 0) => ({
	Pragma: 'no-cache',
	Accept: 'application/json',
	'User-Agent': commonConfig.request.defaultUserAgent,
	'X-Xbl-Contract-Version': String(XBLContractVersion),
	'X-XblCorrelationId': v4(),
	'Cache-Control': 'no-store, must-revalidate, no-cache',
	'Accept-Encoding': 'gzip, deflate, compress',
	'Accept-Language': `${commonConfig.request.defaultLanguage}, ${
		commonConfig.request.defaultLanguage.split('-')[0]
	};q=0.9`
});

/**
 * Return XUID for a targeted gamertag
 * @param {string} gamertag - Targeted gamertag
 * @param {string} XBLAuthorization - Current XBL3.0 authorization
 * @param {object=} headers - Additional headers, could be used to override default ones
 * @returns {string} XUID
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
	const response = await axios({
		url: fetchUrl,
		method: 'GET',
		headers: {
			...getBaseHeaders(2),
			Authorization: XBLAuthorization,
			...headers
		}
	})
		.then(res => res.data)
		.catch(err => {
			throw err;
		});

	return response.profileUsers[0].id.toString();
};

/**
 * Return desired settings for a targeted player
 * @param {string} player - Targeted player
 * @param {string[]} settings - Desired settings
 * @param {string} XBLAuthorization - Current XBL3.0 authorization
 * @param {object=} headers - Additional headers, could be used to override default ones
 * @returns {object} Requested settings
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
	const response = await axios({
		url: fetchUrl,
		params: { settings: settings.join(',') },
		method: 'GET',
		headers: {
			...getBaseHeaders(2),
			Authorization: XBLAuthorization,
			...headers
		}
	})
		.then(res => res.data)
		.catch(err => {
			throw err;
		});

	return response.profileUsers[0].settings;
};

//#endregion

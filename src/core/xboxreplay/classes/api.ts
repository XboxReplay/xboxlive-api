import axios, { Method } from 'axios';
import commonConfig from '../../../config';
import { v4 } from 'uuid';

import {
	removeUndefinedFromObject,
	matchPlayerIdentifier
} from '../../../utils';

//#region typings

type Culture = 'en-US' | 'fr-FR';
type QueryParameters = Record<string, string | number | undefined>;
type XRPlayerMediaCategory = 'screenshots' | 'clips';
type XRGetPlayerMediaOptions = {
	limit?: number;
	offset?: number;
	title_ids?: number | string | (number | string)[];
	culture?: Culture;
};

//#endregion
//#region public methods

class XboxReplayAPI {
	/**
	 * Exposed for internal use only, please do not use nor edit
	 */
	public __XRHost__ = 'www.xboxreplay.net';

	/**
	 * Client token
	 */
	private readonly clientToken: string;

	/**
	 * Targeted API version
	 */
	private readonly apiVersion: string;

	/**
	 * XboxReplay targeted URL
	 */
	private readonly baseUrl: string;

	/**
	 * Telemetry unique indentifier
	 */
	private telemetryId: string;

	//#region public methods

	public constructor(clientToken: string, apiVersion = '2.0') {
		this.clientToken = clientToken || '';
		this.apiVersion = apiVersion;
		this.baseUrl = `https://${this.__XRHost__}/api/v${this.apiVersion}`;
		this.telemetryId = `${v4().replace(/-/g, '')}/1`;
	}

	/**
	 * Return recent "screenshots" for a targeted player
	 * @param {string} player - Targeted player
	 * @param {object=} options - Request options
	 * @returns {Promise<any>} Screenshots
	 */
	public getPlayerScreenshots(
		player: string,
		options: XRGetPlayerMediaOptions = {}
	): Promise<any> {
		return this.getPlayerMediaList(player, 'screenshots', options);
	}

	/**
	 * Return recent "clips" for a targeted player
	 * @param {string} player - Targeted player
	 * @param {object=} options - Request options
	 * @returns {Promise<any>} Clips
	 */
	public getPlayerGameClips(
		player: string,
		options: XRGetPlayerMediaOptions = {}
	): Promise<any> {
		return this.getPlayerMediaList(player, 'clips', options);
	}

	/**
	 * Return information about a targeted title
	 * @param {string|number} titleId - Targeted title id
	 * @param options - Request options
	 * @returns {Promise<any>} Game
	 */
	public getGameByTitleId(
		titleId: string | number,
		options: { culture: Culture }
	): Promise<any> {
		return this.call('GET', `/games/${String(titleId)}`, {
			culture: options.culture
		});
	}

	//#endregion
	//#region private methods

	/**
	 * Return recent media for a targeted player
	 * @param {string} player - Targeted player
	 * @param {string} category - Targeted category
	 * @param {object=} options - Request options
	 * @returns {Promise<any>} Media
	 */
	private getPlayerMediaList(
		player: string,
		category: XRPlayerMediaCategory,
		options: XRGetPlayerMediaOptions = {}
	): Promise<any> {
		const identifier = matchPlayerIdentifier(player);
		const params: QueryParameters = {
			limit: options.limit,
			offset: options.offset,
			culture: options.culture
		};

		if (options.title_ids !== void 0) {
			if (Array.isArray(options.title_ids) === true) {
				params.title_ids = String(
					(options.title_ids as (string | number)[]).join(',')
				);
			} else params.title_ids = String(options.title_ids);
		}

		const target =
			identifier.type === 'gamertag'
				? identifier.value.toLowerCase().replace(/ /g, '-')
				: `xuid(${identifier.value})`;

		return this.call('GET', `/players/${target}/${category}`, params);
	}

	/**
	 *
	 * @param {string} path - Targeted path
	 * @returns {string} Path
	 */
	private computeAPIUrl(path: string): string {
		path = path.startsWith('/') === true ? path : `/${path}`;
		return `${this.baseUrl}${path}`;
	}

	/**
	 * Generic method to request any XboxReplay URL
	 * @param {string} method - HTTP method
	 * @param {string} path - Targeted path
	 * @param {QueryParameters=} params - Query parameters
	 * @param {any} data - Payload
	 * @returns {Promise<any>} Response
	 */
	private async call(
		method: Method,
		path: string,
		params?: QueryParameters | null,
		data?: any
	): Promise<any> {
		if (this.clientToken.length === 0) {
			throw new Error('Missing "clientToken"');
		}

		const response = await axios(this.computeAPIUrl(path), {
			method,
			params: (!!params && removeUndefinedFromObject(params)) || void 0,
			headers: {
				Accept: 'application/json',
				'Accept-Encoding': 'gzip, deflate, compress',
				'User-Agent': commonConfig.request.defaultUserAgent,
				'XR-Client-Token': this.clientToken,
				'XR-Telemetry-Id': this.telemetryId
			},
			data
		}).then(res => {
			if (res.headers['xr-telemetry-id'] !== void 0)
				this.telemetryId = res.headers['xr-telemetry-id'];
			return res.data;
		});

		return response;
	}

	//#endregion
}

export default XboxReplayAPI;

//#endregion

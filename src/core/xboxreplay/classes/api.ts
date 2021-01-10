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
	 * @returns {Promise<object>} Screenshots
	 */
	public getPlayerScreenshots(
		player: string,
		options: XRGetPlayerMediaOptions = {}
	) {
		return this.getPlayerMediaList(player, 'screenshots', options);
	}

	/**
	 * Return recent "clips" for a targeted player
	 * @param {string} player - Targeted player
	 * @param {object=} options - Request options
	 * @returns {Promise<object>} Clips
	 */
	public getPlayerGameClips(
		player: string,
		options: XRGetPlayerMediaOptions = {}
	) {
		return this.getPlayerMediaList(player, 'clips', options);
	}

	/**
	 * Return information about a targeted title
	 * @param {string|number} titleId - Targeted title id
	 * @param options - Request options
	 * @returns {Promise<object>} Game
	 */
	public getGameByTitleId(
		titleId: string | number,
		options: { culture: Culture }
	) {
		return this.call('GET', `/games/${String(titleId)}`, {
			culture: options.culture
		});
	}

	//#endregion
	//#region private methods

	private getPlayerMediaList(
		player: string,
		category: XRPlayerMediaCategory,
		options: XRGetPlayerMediaOptions = {}
	) {
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

	private computeAPIUrl(path: string) {
		path = path.startsWith('/') === true ? path : `/${path}`;
		return `${this.baseUrl}${path}`;
	}

	private async call(
		method: Method,
		path: string,
		params?: QueryParameters | null,
		data?: any
	) {
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

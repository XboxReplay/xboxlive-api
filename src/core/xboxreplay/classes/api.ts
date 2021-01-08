import axios, { Method } from 'axios';

import {
	removeUndefinedFromObject,
	matchPlayerIdentifier
} from '../../../utils';

//#region typings

type QueryParameters = Record<string, string | number | undefined>;
type XRPlayerMediaCategory = 'screenshots' | 'clips';
type XRGetPlayerMediaOptions = {
	limit?: number;
	offset?: number;
	title_ids?: number | string | (number | string)[];
	culture?: 'en_US' | 'fr_FR';
};

//#endregion
//#region public methods

class XboxReplayAPI {
	private readonly clientToken: string;
	private readonly apiVersion: string;
	private readonly baseUrl: string;

	//#region public methods

	public constructor(clientToken: string, apiVersion = '2.0') {
		this.clientToken = clientToken || '';
		this.apiVersion = apiVersion;
		this.baseUrl = `https://www.xboxreplay.net/api/v${this.apiVersion}`;
	}

	/**
	 * Return recent "screenshots" for a targeted player
	 * @param {string} target - Targeted player
	 * @param {object=} options - Request options
	 * @returns {object} any
	 */
	public getPlayerScreenshots(
		target: string,
		options: XRGetPlayerMediaOptions = {}
	) {
		return this.getPlayerMediaList(target, 'screenshots', options);
	}

	/**
	 * Return recent "clips" for a targeted player
	 * @param {string} target - Targeted player
	 * @param {object=} options - Request options
	 * @returns {object} any
	 */
	public getPlayerGameClips(
		target: string,
		options: XRGetPlayerMediaOptions = {}
	) {
		return this.getPlayerMediaList(target, 'clips', options);
	}

	/**
	 * Create a valid Xbox Live signature header for XSAPI requests
	 * @param {string} method - HTTP method
	 * @param {string} url - Targeted URL with query parameters
	 * @param {string=} XBLAuthorization [null] - Used XBL3.0 authorization
	 * @param {object=} payload [null] - Used request payload
	 */
	public getXBLRequestSignature(
		method: Method,
		url: string,
		XBLAuthorization: string | null = null,
		payload: Record<string, any> | null = null
	) {
		return this.call(
			'POST',
			this.computeAPIUrl('/utils/partner/xbl-sign-request'),
			null,
			removeUndefinedFromObject({
				method: method.toUpperCase(),
				url,
				payload: payload || void 0,
				xbl_authorization: XBLAuthorization || void 0
			})
		);
	}

	//#endregion
	//#region private methods

	private getPlayerMediaList(
		target: string,
		category: XRPlayerMediaCategory,
		options: XRGetPlayerMediaOptions = {}
	) {
		const matchedTarget = matchPlayerIdentifier(target);
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

		return this.call(
			'GET',
			`/players/${matchedTarget.value}/${category}`,
			params
		);
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

		return axios(this.computeAPIUrl(path), {
			method,
			params: (!!params && removeUndefinedFromObject(params)) || void 0,
			headers: {
				'XR-Client-Token': this.clientToken,
				'User-Agent': 'xboxreplay/xboxlive-api'
			},
			data
		});
	}

	//#endregion
}

export default XboxReplayAPI;

//#endregion

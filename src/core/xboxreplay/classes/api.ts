import axios from 'axios';

//#region typings

type QueryParameters = Record<string, string | number | undefined>;
type XRGamePlayerMediaCategory = 'screenshots' | 'clips';
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

	public getPlayerScreenshots(
		target: string,
		options: XRGetPlayerMediaOptions = {}
	) {
		return this.getPlayerMediaList(target, 'screenshots', options);
	}

	public getPlayerGameClips(
		target: string,
		options: XRGetPlayerMediaOptions = {}
	) {
		return this.getPlayerMediaList(target, 'clips', options);
	}

	//#endregion
	//#region private methods

	private getPlayerMediaList(
		target: string,
		category: XRGamePlayerMediaCategory,
		options: XRGetPlayerMediaOptions = {}
	) {
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

		return this.call(`/players/${target}/${category}`, params);
	}

	private computeAPIUrl(path: string) {
		path = path.startsWith('/') === true ? path : `/${path}`;
		return `${this.baseUrl}${path}`;
	}

	private async call(path: string, params: QueryParameters = {}) {
		if (this.clientToken.length === 0) {
			throw new Error('Missing "clientToken"');
		}

		return axios(this.computeAPIUrl(path), {
			method: 'GET',
			params: JSON.parse(JSON.stringify(params)),
			headers: {
				'XR-Client-Token': this.clientToken,
				'User-Agent': 'xboxreplay/xboxlive-api'
			}
		});
	}

	//#endregion
}

export default XboxReplayAPI;

//#endregion

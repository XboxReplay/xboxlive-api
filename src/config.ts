export const USER_AGENT = [
	'Mozilla/5.0 (XboxReplay; XboxLiveAPI/3.0)',
	'AppleWebKit/537.36 (KHTML, like Gecko)',
	'Chrome/71.0.3578.98 Safari/537.36'
].join(' ');

export default {
	request: {
		baseHeaders: {
			Accept: 'application/json',
			'Accept-encoding': 'gzip',
			'Accept-Language': 'en-US',
			'User-Agent': USER_AGENT
		}
	}
};

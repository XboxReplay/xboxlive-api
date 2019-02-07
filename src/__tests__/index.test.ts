import * as XboxLiveAPI from '../';

beforeEach(() => {
	jest.clearAllMocks();
	jest.restoreAllMocks();
});

it("should retrieve specified player's XUID", async () => {
	const authorization: XboxLiveAPI.IAuthorization = {
		userHash: '1234567890123456',
		XSTSToken:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WyJBcmUgeW91IGxvb2tpbmcgZm9yIHNvbWV0aGluZz8iXQ.OfRjqsoMbmeksokqRHXE7BgjblODCZ-m0c5PQ3PIFWc'
	};

	const xuid = '2535465515082324';
	const mock = jest.spyOn(XboxLiveAPI, 'getPlayerXUID');
	mock.mockReturnValueOnce(
		new Promise(resolve => resolve('2535465515082324'))
	);

	const response = await XboxLiveAPI.getPlayerXUID('Zeny IC', authorization);
	expect(response).toEqual(xuid);
});

it("should retrieve specified player's settings", async () => {
	const authorization: XboxLiveAPI.IAuthorization = {
		userHash: '1234567890123456',
		XSTSToken:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WyJBcmUgeW91IGxvb2tpbmcgZm9yIHNvbWV0aGluZz8iXQ.OfRjqsoMbmeksokqRHXE7BgjblODCZ-m0c5PQ3PIFWc'
	};

	const settings = [{ id: 'Gamertag', value: 'Zeny IC' }];
	const mock = jest.spyOn(XboxLiveAPI, 'getPlayerSettings');
	mock.mockReturnValueOnce(new Promise(resolve => resolve(settings)));

	const response = await XboxLiveAPI.getPlayerSettings(
		'Zeny IC',
		authorization,
		['Gamertag']
	);

	expect(response).toEqual(settings);
});

it("should retrieve specified player's screenshots", async () => {
	const authorization: XboxLiveAPI.IAuthorization = {
		userHash: '1234567890123456',
		XSTSToken:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WyJBcmUgeW91IGxvb2tpbmcgZm9yIHNvbWV0aGluZz8iXQ.OfRjqsoMbmeksokqRHXE7BgjblODCZ-m0c5PQ3PIFWc'
	};

	const screenshots = {
		screenshots: [],
		pagingInfo: { continuationToken: 'xxx' }
	};

	const mock = jest.spyOn(XboxLiveAPI, 'getPlayerScreenshots');
	mock.mockReturnValueOnce(new Promise(resolve => resolve(screenshots)));

	const response = await XboxLiveAPI.getPlayerScreenshots(
		'Zeny IC',
		authorization
	);

	expect(response).toEqual(screenshots);
});

it("should retrieve specified player's gameclips", async () => {
	const authorization: XboxLiveAPI.IAuthorization = {
		userHash: '1234567890123456',
		XSTSToken:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WyJBcmUgeW91IGxvb2tpbmcgZm9yIHNvbWV0aGluZz8iXQ.OfRjqsoMbmeksokqRHXE7BgjblODCZ-m0c5PQ3PIFWc'
	};

	const gameclips = {
		gameClips: [],
		pagingInfo: { continuationToken: 'xxx' }
	};

	const mock = jest.spyOn(XboxLiveAPI, 'getPlayerGameclips');
	mock.mockReturnValueOnce(new Promise(resolve => resolve(gameclips)));

	const response = await XboxLiveAPI.getPlayerGameclips(
		'Zeny IC',
		authorization
	);

	expect(response).toEqual(gameclips);
});

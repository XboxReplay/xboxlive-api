const XSTSToken = process.env.XBL_XSTS_TOKEN || '';
const userHash = process.env.XBL_USER_HASH || '';

const {
	getPlayerXUID,
	getPlayerSettings,
	getPlayerActivityHistory,
	getPlayerGameClips,
	getPlayerGameClipsFromMediaHub,
	getPlayerGameClipsFromActivityHistory,
	getPlayerScreenshots,
	getPlayerScreenshotsFromMediaHub,
	getPlayerScreenshotsFromActivityHistory
} = require('../src');

const successCase_getPlayerXUID = () => {
	const onResponses = responses =>
		new Promise((resolve, reject) => {
			for (const response of responses) {
				const match = '2584878536129841';

				if (match !== response) {
					return reject(
						new Error('successCase_getPlayerXUID - FAILED')
					);
				} else return resolve();
			}
		});

	return Promise.all([
		getPlayerXUID('Major Nelson', { XSTSToken, userHash }),
		getPlayerXUID('2584878536129841', { XSTSToken, userHash })
	])
		.then(onResponses)
		.catch(err => {
			console.error(err);
			process.exit(1);
		});
};

const successCase_getPlayerSettings = () => {
	const onResponses = responses =>
		new Promise((resolve, reject) => {
			for (const response of responses) {
				const compare = obj => {
					const a = obj.id.toLowerCase();
					const b = obj.id.toLowerCase();

					if (a > b) return 1;
					else if (a < b) return -1;
					else return 0;
				};

				const match = [
					{ id: 'Gamertag', value: 'Major Nelson' },
					{ id: 'ModernGamertag', value: 'Major Nelson' },
					{ id: 'UniqueModernGamertag', value: 'Major Nelson' },
					{ id: 'ModernGamertagSuffix', value: '' }
				];

				const isEqual =
					JSON.stringify(match.sort(compare)) ===
					JSON.stringify(response.sort(compare));

				if (isEqual === false) {
					return reject(
						new Error('successCase_getPlayerSettings - FAILED')
					);
				} else return resolve();
			}
		});

	return Promise.all([
		getPlayerSettings('Major Nelson', { XSTSToken, userHash }, [
			'Gamertag',
			'ModernGamertag',
			'UniqueModernGamertag',
			'ModernGamertagSuffix'
		]),
		getPlayerSettings('2584878536129841', { XSTSToken, userHash }, [
			'Gamertag',
			'ModernGamertag',
			'UniqueModernGamertag',
			'ModernGamertagSuffix'
		])
	])
		.then(onResponses)
		.catch(err => {
			console.error(err);
			process.exit(1);
		});
};

const successCase_getPlayerActivityHistory = () => {
	const onResponses = responses =>
		new Promise((resolve, reject) => {
			for (const response of responses) {
				const match = {
					numItems: 0,
					activityItems: [],
					pollingToken: '0',
					pollingIntervalSeconds: null,
					contToken: '0'
				};

				if (JSON.stringify(match) !== JSON.stringify(response)) {
					return reject(
						new Error(
							'successCase_getPlayerActivityHistory - FAILED'
						)
					);
				} else return resolve();
			}
		});

	return Promise.all([
		getPlayerActivityHistory(
			'Major Nelson',
			{ XSTSToken, userHash },
			{ numItems: 0 }
		),
		getPlayerActivityHistory(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ numItems: 0 }
		)
	])
		.then(onResponses)
		.catch(err => {
			console.error(err);
			process.exit(1);
		});
};

const successCase_getPlayerScreenshots = () =>
	Promise.all([
		getPlayerScreenshots(
			'Major Nelson',
			{ XSTSToken, userHash },
			{ maxItems: 0 }
		),
		getPlayerScreenshots(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ maxItems: 0 }
		)
	]).catch(err => {
		console.error(err);
		process.exit(1);
	});

const successCase_getPlayerGameClips = () =>
	Promise.all([
		getPlayerGameClips(
			'Major Nelson',
			{ XSTSToken, userHash },
			{ maxItems: 0 }
		),
		getPlayerGameClips(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ maxItems: 0 }
		)
	]).catch(err => {
		console.error(err);
		process.exit(1);
	});

const successCase_getPlayerScreenshotsFromActivityHistory = () =>
	Promise.all([
		getPlayerScreenshotsFromActivityHistory(
			'Major Nelson',
			{ XSTSToken, userHash },
			{ numItems: 0 }
		),
		getPlayerScreenshotsFromActivityHistory(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ numItems: 0 }
		)
	]).catch(err => {
		console.error(err);
		process.exit(1);
	});

const successCase_getPlayerGameClipsFromActivityHistory = () =>
	Promise.all([
		getPlayerGameClipsFromActivityHistory(
			'Major Nelson',
			{ XSTSToken, userHash },
			{ numItems: 1 }
		),
		getPlayerGameClipsFromActivityHistory(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ numItems: 1 }
		)
	]).catch(err => {
		console.error(err);
		process.exit(1);
	});

const successCase_getPlayerScreenshotsFromMediaHub = () =>
	Promise.all([
		getPlayerScreenshotsFromMediaHub('Major Nelson', {
			XSTSToken,
			userHash
		}),
		getPlayerScreenshotsFromMediaHub('2584878536129841', {
			XSTSToken,
			userHash
		})
	]).catch(err => {
		console.error(err);
		process.exit(1);
	});

const successCase_getPlayerGameClipsFromMediaHub = () =>
	Promise.all([
		getPlayerGameClipsFromMediaHub(
			'Major Nelson',
			{ XSTSToken, userHash },
			{ numItems: 1 }
		),
		getPlayerGameClipsFromMediaHub(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ numItems: 1 }
		)
	]).catch(err => {
		console.error(err);
		process.exit(1);
	});

Promise.all([
	successCase_getPlayerXUID(),
	successCase_getPlayerSettings(),
	successCase_getPlayerActivityHistory(),
	successCase_getPlayerScreenshots(),
	successCase_getPlayerGameClips(),
	successCase_getPlayerScreenshotsFromActivityHistory(),
	successCase_getPlayerGameClipsFromActivityHistory(),
	successCase_getPlayerScreenshotsFromMediaHub(),
	successCase_getPlayerGameClipsFromMediaHub()
]).then(() => {
	process.exit(0);
});

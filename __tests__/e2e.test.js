const XSTSToken = process.env.XBL_XSTS_TOKEN || '';
const userHash = process.env.XBL_USER_HASH || '';

const {
	getPlayerXUID,
	getPlayerSettings,
	getPlayerActivityHistory,
	getPlayerGameClips,
	getPlayerGameClipsFromActivityHistory,
	getPlayerScreenshots,
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
			{ maxItems: 1 }
		),
		getPlayerScreenshots(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ maxItems: 1 }
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
			{ maxItems: 1 }
		),
		getPlayerGameClips(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ maxItems: 1 }
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
			{ numItems: 1 }
		),
		getPlayerScreenshotsFromActivityHistory(
			'2584878536129841',
			{ XSTSToken, userHash },
			{ numItems: 1 }
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

Promise.all([
	successCase_getPlayerXUID(),
	successCase_getPlayerSettings(),
	successCase_getPlayerActivityHistory(),
	successCase_getPlayerScreenshots(),
	successCase_getPlayerGameClips(),
	successCase_getPlayerScreenshotsFromActivityHistory(),
	successCase_getPlayerGameClipsFromActivityHistory()
]).then(() => {
	process.exit(0);
});

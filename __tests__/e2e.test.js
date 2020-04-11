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

const successCase_getPlayerXUID = () =>
	getPlayerXUID('Major Nelson', { XSTSToken, userHash })
		.then(response => {
			const match = '2584878536129841';

			if (match !== response) {
				throw new Error('successCase_getPlayerXUID - FAILED');
			}
		})
		.catch(err => {
			console.error(err);
			process.exit(1);
		});

const successCase_getPlayerSettings = () =>
	getPlayerSettings('Major Nelson', { XSTSToken, userHash }, [
		'Gamertag',
		'ModernGamertag',
		'UniqueModernGamertag',
		'ModernGamertagSuffix'
	])
		.then(response => {
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
				throw new Error('successCase_getPlayerSettings - FAILED');
			}
		})
		.catch(err => {
			console.error(err);
			process.exit(1);
		});

const successCase_getPlayerActivityHistory = () =>
	getPlayerActivityHistory(
		'Major Nelson',
		{ XSTSToken, userHash },
		{ numItems: 0 }
	)
		.then(response => {
			const match = {
				numItems: 0,
				activityItems: [],
				pollingToken: '0',
				pollingIntervalSeconds: null,
				contToken: '0'
			};

			if (JSON.stringify(match) !== JSON.stringify(response)) {
				throw new Error(
					'successCase_getPlayerActivityHistory - FAILED'
				);
			}
		})
		.catch(err => {
			console.error(err);
			process.exit(1);
		});

const successCase_getPlayerScreenshots = () =>
	getPlayerScreenshots(
		'Major Nelson',
		{ XSTSToken, userHash },
		{ maxItems: 1 }
	).catch(err => {
		console.error(err);
		process.exit(1);
	});

const successCase_getPlayerGameClips = () =>
	getPlayerGameClips(
		'Major Nelson',
		{ XSTSToken, userHash },
		{ maxItems: 1 }
	).catch(err => {
		console.error(err);
		process.exit(1);
	});

const successCase_getPlayerScreenshotsFromActivityHistory = () =>
	getPlayerScreenshotsFromActivityHistory(
		'Major Nelson',
		{ XSTSToken, userHash },
		{ numItems: 1 }
	).catch(err => {
		console.error(err);
		process.exit(1);
	});

const successCase_getPlayerGameClipsFromActivityHistory = () =>
	getPlayerGameClipsFromActivityHistory(
		'Major Nelson',
		{ XSTSToken, userHash },
		{ numItems: 1 }
	).catch(err => {
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

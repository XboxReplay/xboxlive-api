//#region public methods

export const matchPlayerIdentifier = (
	target: string
): { type: 'xuid' | 'gamertag'; value: string } => {
	const match = target.match(/^(gt|xuid)\(([a-z0-9- ]+)\)$/i);
	const matchedType = match === null ? 'gamertag' : match[1];
	const matchedTarget = (match === null ? target : match[2]).trim();

	if (matchedTarget.length !== 0) {
		const isXUID = !!matchedTarget.match(/^([0-9]+)$/g);

		if (matchedType === 'xuid') {
			if (isXUID === false) return { type: 'xuid', value: matchedTarget };
		} else if (isXUID === false)
			return { type: 'gamertag', value: matchedTarget };
	}

	throw new Error('Could not match player identifier');
};

export const removeUndefinedFromObject = (obj: Record<string, any>) =>
	JSON.parse(JSON.stringify(obj));

//#endregion

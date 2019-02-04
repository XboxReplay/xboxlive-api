import {
	PlayerGamertag as PlayerGamertagType,
	IAuthorization as Authorization,
	PlayerXUIDResponse as PlayerXUIDResponseType,
	PlayerSettings as PlayerSettingsType,
	PlayerSettingsResponse as PlayerSettingsResponseType,
	IPlayerScreenshotsResponse as PlayerScreenshotsResponse,
	IPlayerGameclipsResponse as PlayerGameclipsResponse,
	ICallProperties as CallProperties
} from './__typings__';

export namespace XboxLiveAPI {
	export { PlayerGamertagType as PlayerGamertag };
	export { Authorization as IAuthorization };
	export { PlayerXUIDResponseType as PlayerXUIDResponse };
	export { PlayerSettingsType as PlayerSettings };
	export { PlayerSettingsResponseType as PlayerSettingsResponse };
	export { PlayerScreenshotsResponse as IPlayerScreenshotsResponse };
	export { PlayerGameclipsResponse as IPlayerGameclipsResponse };
	export { CallProperties as ICallProperties };

	export function getPlayerXUID(
		gamertag: PlayerGamertag,
		authorization: IAuthorization
	): Promise<PlayerXUIDResponse>;

	export function getPlayerSettings(
		gamertag: PlayerGamertag,
		authorization: IAuthorization,
		settings?: PlayerSettings
	): Promise<PlayerSettingsResponse>;

	export function getPlayerScreenshots(
		gamertag: PlayerGamertag,
		authorization: IAuthorization,
		maxItems?: number
	): Promise<IPlayerScreenshotsResponse>;

	export function getPlayerGameclips(
		gamertag: PlayerGamertag,
		authorization: IAuthorization,
		maxItems?: number
	): Promise<IPlayerGameclipsResponse>;

	export function call(
		endpoint: string,
		authorization: IAuthorization,
		properties?: ICallProperties
	): Promise<any>;
}

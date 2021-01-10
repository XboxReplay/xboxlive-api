# @xboxreplay/xboxlive-api

XSAPI (Xbox Services API) wrapper

### Installation

```shell
$ npm install @xboxreplay/xboxlive-api
```

### Usage example

```javascript
import { XSAPI } from '@xboxreplay/xboxlive-api';

XSAPI.getPlayerSettings(
	'Zeny IC',
	XboxLiveAPI.concatXBLAuthorization(
		'YOUR_OWN_USER_HASH',
		'YOUR_OWN_XSTS_TOKEN'
	),
	['UniqueModernGamertag', 'GameDisplayPicRaw', 'Gamerscore', 'Location']
)
	.then(console.info)
	.catch(console.error);
```

## XboxReplay - Simple API

As the Xbox Services API may require additional information (such a signature header, device / title XSTS authorization, etc.), returned media by `XSAPI.getPlayerScreenshots` and `XSAPI.getPlayerGameClips` methods could be incomplete. To overcome this issue this library also expose a simple **XboxReplay** API wrapper which is able to return all desired content.

### Usage example

```javascript
import { XboxReplaySimpleAPI } from '@xboxreplay/xboxlive-api';

const XRAPIInstance = new XboxReplaySimpleAPI('YOUR_CLIENT_TOKEN');

XRAPIInstance.getPlayerScreenshots('Zeny IC', { limit: 1, culture: 'en-US' })
	.then(console.info)
	.catch(console.error);
```

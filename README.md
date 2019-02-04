# Xbox Live - API

Simple Xbox Live API wrapper.

### Installation
```
$ npm install @xboxreplay/xboxlive-api
```

### Clone
```
$ git clone git@github.com:XboxReplay/xboxlive-api.git
```

### Build
```
$ npm run build
```

### Example usage

```
import XboxLiveAPI from '@xboxreplay/xboxlive-api';

XboxLiveAPI.getPlayerSettings('Zeny IC', {
    userHash: '1890318589445465111',
    XSTSToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoiYiJ9.iMrN7XT_jCcRXWKwUo_JPWeRO75dBOGTzerAO'
}, ['GameDisplayPicRaw', 'Gamerscore', 'Location'])
    .then(console.info)
    .catch(console.error);
```

### Sample response

```
[
    {
        "id": "GameDisplayPicRaw",
        "value": "http://images-eds.xboxlive.com/image?url=wHwbXKif8cus8csoZ03RWwcxuUQ9WVT6xh5XaeeZD02wEfGZeuD.XMoGFVYkwHDq4Ch7pcu9E3UwDqy.fzrTaviUvY1c8gvrWRzLTqFKUVap_Nvh0.Em2IsAWtHcMFeVpY2boMYiy03w887.tSGAT62Na2z3k33eMWnP12mY2x0-&format=png"
    }
    {
        "id": "Gamerscore",
        "value": "5610"
    },
    {
        "id": "Location",
        "value": "Paris, France"
    }
]
```

### How to generate a valid authorization?
The fastest way to generate a valid authorization is to use our [XboxLive-Auth](https://github.com/XboxReplay/xboxlive-auth) module which returns a **userHash** and a **XSTSToken** for a specified account.

### Available methods
* **getPlayerXUID** - Returns specified player's XUID
    * gamertag {string}
    * authorization {Object}
        * userHash {string}
        * XSTSToken {string}

* **getPlayerSettings** - Returns specified player's settings
    * gamertag {string}
    * authorization {Object}
        * userHash {string}
        * XSTSToken {string}
    * settings {string[]?} - Supported values specified below
        * GameDisplayPicRaw
	    * Gamerscore
	    * Gamertag
	    * AccountTier
	    * XboxOneRep
	    * PreferredColor
	    * RealName
	    * Bio
	    * Location

* **getPlayerScreenshots** - Returns specified player's screenshots
    * gamertag {string}
    * authorization {Object}
        * userHash {string}
        * XSTSToken {string}
    * maxItem {number?} - Default: 25

* **getPlayerGameclips** - Returns specified player's gameclips
    * gamertag {string}
    * authorization {Object}
        * userHash {string}
        * XSTSToken {string}
    * maxItem {number?} - Default: 25

* **call** - A generic method to call the API with a custom endpoint
    * endpoint {string}
    * authorization {Object}
        * userHash {string}
        * XSTSToken {string}
    * properties {Object?}
        * method {string?}
        * payload {any?} - Used for PATCH | POST | PUT requests
        * qs {any?} - Query string

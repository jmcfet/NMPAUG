var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

/**
 * Represents a media item type.
 *
 * @enum $U.core.mediaitem.MediaItemType
 */
$U.core.mediaitem.MediaItemType = {
	VOD : {
		name : "VOD"
	},
	BTVEVENT : {
		name : "BTVEVENT"
	},
	BTVCHANNEL : {
		name : "BTVCHANNEL"
	},
	GWCHANNEL : {
		name : "GWCHANNEL"
	},
	PVR_RECORDING : {
		name : "PVR_RECORDING"
	},
	PVR_SCHEDULED : {
		name : "PVR_SCHEDULED"
	},
	ONNOW : {
		name : "ONNOW"
	},
	CATCHUP : {
		name : "CATCHUP"
	},
	NPVR : {
		name : "NPVR"
	},
	SERIES_CONTAINER : {
		name : "SERIES_CONTAINER"
	},
	SUGGESTION : {
		name : "SUGGESTION"
	},
	TRAILER : {
		name : "TRAILER"
	}
};

/**
 * @class $U.epg.widgets.CatchupMiniMediaCard
 * Class that represents the CatchupMiniMediaCard in the EPG
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this channel bar
 * @param {Object} owner Owner object (most likely its caller)
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.CatchupMiniMediaCard = ( function() {
	var UNSUBSCRIBED_TXT_KEY = "txtUnsubscribed";

	var CatchupMiniMediaCard = function(container, owner) {
		superClass.call(this, container, owner);
	};

	var superClass = $U.epg.widgets.MiniMediaCard;
	$N.apps.util.Util.extend(CatchupMiniMediaCard, superClass);

	/**
	 * Populate the CatchupMiniMediaCard
	 * @param {Object} catchupEvent asset used to populate
	 */
	CatchupMiniMediaCard.prototype.populate = function(catchupEvent) {
		var timeNow = new Date().getTime();
		if (this._mediaItem !== catchupEvent || (this._playable !== catchupEvent.isAssetPlayable)) {
			this._mediaItem = catchupEvent;
			this._playable = this._mediaItem.isAssetPlayable;
			this.deactivate();
			this.reload();
		} else {
			this._createUpdateListener();
		}
	};

	/**
	 * Reloads the CatchupMiniMediaCard with the current vod asset
	 */
	CatchupMiniMediaCard.prototype.reload = function() {
		var that = this;

		this.sizeMediaCard();

		// Hide the promo image
		$U.core.util.HtmlHelper.setVisibilityHidden(this._miniCardImage);

		this._mediaItem.enrich(function() {
			that.setImage(that._mediaItem.promoImageURL);
		});

		// create the buttons
		this._buttonOverlay.activate(that._mediaItem);

		this._miniCardTitle.innerHTML = this._mediaItem.title;
		this._miniCardTime.innerHTML = $U.core.util.Formatter.formatTime(new Date(this._mediaItem.startTime)) + " - " + $U.core.util.Formatter.formatTime(new Date(this._mediaItem.endTime));
		this._miniCardDuration.innerHTML = $U.core.util.Formatter.formatSecondsToHours(this._mediaItem.durationInSeconds);

		$U.core.util.HtmlHelper.setDisplayBlock(this._miniCardCatchupIndicator);

		// Unsubscribed channels do not get a synopsis
		if (this._mediaItem.subscribed) {
			this._miniCardDesc.innerHTML = this._mediaItem.synopsis;
		} else {
			this._miniCardDesc.innerHTML = $U.core.util.StringHelper.getString(UNSUBSCRIBED_TXT_KEY);
		}

		this._createUpdateListener();

		this.setActionBar();
	};

	/**
	 * function used when the user clicks on the favourites button
	 */
	CatchupMiniMediaCard.prototype.favouriteListener = function() {
		$U.core.category.favourites.Favourites.toggleFav(this._mediaItem._channel, this.setActionBar);
	};

	return CatchupMiniMediaCard;

}());

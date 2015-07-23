/**
 * PhoneInfoCard is a specialisation of $U.mediaCard.InfoCard
 *
 * @class $U.mediacard.PhoneInfoCard
 *
 * @constructor
 * Create a new PhoneInfoCard
 * @param {HTMLElement} - the html element which contains the info card
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.PhoneInfoCard = ( function() {

	var GUTTERS = 20;

	var superClass = $U.mediaCard.InfoCard;
	var proto;

	function PhoneInfoCard(parent) {
		superClass.call(this, parent);
	}


	$N.apps.util.Util.extend(PhoneInfoCard, superClass);

	proto = PhoneInfoCard.prototype;

	/**
	 * Sets the layout after a purchase has taken place and calls layout. Also calls its super class because
	 * we need to set the expiration date on tablet and on phone.
	 */
	proto.setAvailableLayout = function() {
		superClass.prototype.setAvailableLayout.call(this);
		// We already have all the logic to determine which buttons should be shown so call reactivatePlayer
		$U.mediaCard.MediaCardController.reactivatePlayer();
	};

	/**
	 * Sets the layout of the phone info card
	 */
	proto._setLayout = function() {
		var height;
		var width;
		var img;
		var aspectR;

		this.setImgAspectRatio($U.mediaCard.InfoCard.LANDSCAPE);

		img = this.getCardImgEl();
		aspectR = this._imgAspectRatio;

		//This is the height we will assign to the mediaContainer (video player) need to have i as the video aspect ratio
		height = (this._parentEl.clientWidth / aspectR) - GUTTERS;
		//need to take into account the gutters
		this._setHeight(this._blurImageContainer, height);
		this._setHeight(this._imgContainer, height);
		this._setHeight($U.mediaCard.MediaCardController.getPlayerContainerEl(), height);
		$U.core.Player.player.height = height;

		//Calculation to get aspect ratio
		width = Math.round(this._imgContainer.clientHeight * aspectR) - GUTTERS;
		//Keep the aspect ratio for the video container
		this._setWidth(this._blurImageContainer, width);
		this._setWidth(this._imgContainer, width);
		this._setWidth($U.mediaCard.MediaCardController.getPlayerContainerEl(), width);
		$U.mediaCard.MediaCardController.resizeVideoControls(parseInt(height, 10) + parseInt(GUTTERS/2, 10), width);
	};

	return PhoneInfoCard;

}());

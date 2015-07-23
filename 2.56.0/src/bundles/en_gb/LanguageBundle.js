/** Locale file - en_gb.  Base bundle for Ref UI */
function CommonLanguageBundle() {

	/* Locale-specific formats */
	/* NOT to be translated but adjusted to formats required for locale as implemented in $N.apps.util.Util.formatDate()/formatTime() */
	this.timeFormat = "H:MM AM";
	// e.g. 9:45 am, HH:MM == 13:45
	this.meridianFormat = "am,pm";
	this.GBP = "£";
	this.EUR = "€";
	this.dateFormat = "DY DD MON";
	// e.g. Tue 01 Mar, DD.MM.YYYY == 25.01.1974

	/* Welcome signon dialog */
	this.txtWelcome = "Welcome";
	this.txtPleaseEnterDetails = "Please enter your details";
	this.txtSignIn = "Sign In";
	this.txtPassword = "password";
	this.txtUsername = "username";
	this.txtDevice = "device";
	this.txtSignOnConnectionError = "Unable to connect to server";
	this.txtErrorSignOn = "Error Sign On";
	this.txtERROR = "Unable to Sign In";
	this.txtSignOnPasswordError = "Your username and password has not been recognized.";
	this.txtSignOnAccountSuspended = "Your account is suspended.";
	this.txtSignOnMaxDevicesError = "You have reached the maximum number of allowable devices. \nPlease contact customer services to remove a device to resolve this.";
	this.txtSignOnInvalidDeviceError = "You have entered an invalid DeviceID.";
	this.txtSignOnDeviceNameError = "Device name could not be set";
	this.txtSignOnPlayerUpgradeIOS = "The application is out of date. Please visit the App Store to upgrade it.";
	this.txtSignOnPlayerUpgradeAndroid = "The application is out of date. Please visit the Play Store to upgrade it.";
	this.txtSignOnPlayerUpgradePlugin = "The plugin is out of date, you need version %VERSION%.<p>Please <u><a href='%URL%'>click here</a></u> to find out how to upgrade it.</p>";
	this.txtUpgradeRecommended = "Upgrade Recommended";
	this.txtUpgradeRecommendedMessagePC = "There is a recommended upgrade to the player available. <p>Please <u><a href='%URL%'>click here</a></u> to find out how to upgrade it.</p>";
	this.txtUpgradeRecommendedMessagePCNoDownload = "There is a recommended upgrade to the player available.";
	this.txtUpgradeRecommendedMessageIOS = "There is a recommended upgrade to the player available, press the 'upgrade' button below to launch the App Store to download it.";
	this.txtUpgradeRecommendedMessageAndroid = "There is a recommended upgrade to the player available, press the 'upgrade' button below to launch the Play Store to download it.";
	this.txtSignOnMaxDeviceClassLimitError = "Device class limit reached";
	this.txtSignOnMaxDeviceActivationLimitError = "Device activation limit reached"
	this.txtSignOnMaxDeviceLimitError = "Device limit reached";

	/* Browse Screen */
	this.btnBrowse = "Browse";
	this.btnChannels = "Channels";
	this.txtFeatured = "Featured";
	this.menuOnNow = "On Now";
	this.menuCustom = "Custom";
	this.menuFeatured = "Featured";
	this.menuRecorded = "Recorded";
	this.txtRecorded = "Recorded";
	this.menuScheduled = "Scheduled";
	this.txtScheduled = "Scheduled";
	this.menuFavourites = "Favourites";
	this.menuRecentlyViewed = "Recently Viewed";
	this.menuRecommendedForMe = "Recommended for me";
	this.menuNPVRScheduled = "Scheduled";
	this.menuNPVRCompleted = "Recorded";
	this.txtNPVRScheduledHeader = "Scheduled <span class='browse-small-title'> (Locker %PERCENT% full - %HOURS% remain) </span>";
	this.txtNPVRCompletedHeader = "Recorded <span class='browse-small-title'> (Locker %PERCENT% full - %HOURS% remain) </span>";
	this.txtBrowse = "BROWSE";
	this.txtChannels = "CHANNELS";
	this.txtCategories = "CATEGORIES";
	this.txtSearch = "SEARCH";
	this.txtSearchResults = "SEARCH RESULTS FOR: %SEARCHTERM%";
	this.txtParentalControls = "PARENTAL CONTROLS";
	this.txtSettings = "SETTINGS";
	this.txtOptions = "OPTIONS";
	this.txtClose = "Close";
	this.txtSeeAll = "see all";
	this.txtAllCategories = "all categories";
	this.txtFree = "FREE";
	this.txtPrice = "Price";

	/* Search Screen */
	this.txtSearchTitle = "Search";

	/* EPG Screen */
	this.txtToday = "Today";
	this.txtTomorrow = "Tomorrow";
	this.txtNoProgrammes = "No programme information available";

	/* Please use the following comma (,) as the delimiter for these translations.  Any other character may break date formatting. */
	this.months = "January,February,March,April,May,June,July,August,September,October,November,December";
	this.monthsShort = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec";
	this.days = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday";
	this.daysShort = "Sun,Mon,Tue,Wed,Thu,Fri,Sat";

	this.txtPlay = "Play";
	this.txtHour = "hour";
	this.txtHours = "hours";
	this.txtMin = "min";
	this.txtMins = "mins";
	this.txtLessThanMin = "less than a minute";
	this.txtNow = "Now";
	this.txtNext = "Next";
	this.txtTitleBlocked = "Blocked";
	this.txtDescBlocked = "This event has been blocked because its rating is higher than the current parental rating.";

	/* Leave strings like %DURATIONSTRING% untranslated (but move them around within the string according to translation
	 * requirements). They are placeholders for values that will be added at run time.
	 */
	this.txtTimeRemaining = "%DURATIONSTRING% remaining";
	this.txtUnsubscribed = "You are not subscribed to this channel";
	this.txtUnsubscribedStrap = "Channel not subscribed";
	this.txtCatchup = "Catchup";
	this.txtStartOver = "Start Over";
	this.txtUnsubscribedVOD = "You are not subscribed to this content";
	this.txtUnsubscribedStrapVOD = "You are not subscribed to this content";

	/* Media Card Screen */
	this.txtPLAY = "PLAY";
	this.txtBUY = "BUY";
	this.txtREPLAY = "REPLAY";
	this.txtRESUME = "RESUME";
	this.txtPlayNext = "PLAY NEXT";
	this.txtPleaseWait = "Please Wait";
	this.txtMoreLikeThis = "More Like This";
	this.txtBtvMoreLikeThis = "More On This Channel";
	this.txtMoreInThisSeries = "More In This Series";
	this.txtMoreRecommendations = "Recommendations";
	this.txtMoreInThisCategory = "More In This Category";
	this.txtMoreSearchResults = "More Search Results";
	this.txtNoMoreLikeThisResults = "There are no results available";
	this.txtPurchase = "Purchase";
	this.txtPasswordIncorrect = "Password Incorrect";
	this.txtServerError = "Server Error";
	this.txtPurchaseMessage = "To purchase this video title please enter your password";
	this.txtPasswordErrorMessage = "Your password has not been recognized please try again";
	this.txtServerErrorMessage = "Unfortunately we've been unable to process your payment";
	this.txtPlayback = "Playback";
	this.txtFailedToThrow = "Failed to throw to device";
	this.txtFailedToFindDevices = "Failed to find any devices to throw to";
	this.txtExpires = "Expires in";

	this.txtActors = "Starring";
	this.txtDirector = "Director";
	this.txtDirectors = "Directors";
	this.txtGenre = "Genre";
	this.txtGenres = "Genres";
	this.txtYear = "Year";
	this.txtEpisode = "Episode";
	this.txtLanguage = "Language";
	this.txtFrom = "From";
	this.txtFree = "Free";

	this.txtMultipleOptions = "You have multiple versions of this movie. Please select one from the list below";
	this.txtPlaybackError = "Playback Error";
	this.txtPlaybackErrorInvalidLicense = "The license for this content is invalid";
	this.txtPlaybackErrorLicenseExpired = "The license for this content has expired";
	this.txtPlaybackErrorGeneric = "There has been an error while attempting to playback";
	this.txtPlaybackSessionLimitReached = "A session/streaming request has been made that would exceed the provisioned limit";
	this.txtPlaybackSessionSPLimitReached = "A session/streaming request has been made that exceeds the provisioned limit of maximum number of allowed sessions per service provider";

	/* Action bar */
	this.btnRecord = "Record";
	this.btnDownload = "Download";
	this.btnAddCollection = "Add To Collection";
	this.btnSetReminder = "Set Reminder";
	this.btnAddFavourites = "Add To Favourites";
	this.btnRemoveFavourites = "Remove From Favourites";
	this.btnAddChannelFavourites = "Add Channel To Favourites";
	this.btnRemoveChannelFavourites = "Remove Channel From Favourites";
	this.btnBuy = "Buy";
	this.btnChooseScreen = "Choose Screen";
	this.btnDeleteProgramme = "Delete Programme";
	this.btnMoreInfo = "More Info";
	this.btnPLAY = "PLAY";
	this.btnPLAYTRAILER = "PLAY TRAILER";
	this.btnSTOPTRAILER = "STOP TRAILER";
	this.btnNPVRRecord = "Record (%PERCENT%% full)";
	this.btnNPVRDelete = "Delete Recording";
	this.btnNPVRCancel = "Cancel Recording Task";
	this.btnNPVRProtect = "Protect";
	this.btnNPVRUnprotect = "Unprotect";

	/* Search */
	this.txtNoResultsInSearch = "Your search returned no results";
	this.txtNoResultsInCategory = "No results in category";
	this.txtNoResultsParentalInCategory = "Results blocked by parental controls";
	this.txtNoResultsInFavourites = "You currently have no favourites selected";
	this.btnSearch = "Search";

	/* Parental Controls */
	this.txtParentalControlsHeading = "Parental Controls";
	this.txtParentalListPrompt = "Choose what level of content you would like displayed";
	this.txtPasswordRequired = "Password required";
	this.txtParentalTurnOffPrompt = "To turn off parental controls";
	this.txtParentalChangePrompt = "To change parental controls to ";
	this.txtParentalPasswordPrompt = " please enter your password";
	this.txtParentalComplete = "Rating changed, please press OK to reload application";
	this.txtRating1 = "Suitable for all";
	this.txtRating2 = "Parental Guidance";
	this.txtRating3 = "Suitable for 12 years and above";
	this.txtRating4 = "Suitable for 15 years and above";
	this.txtRating5 = "Show all content";
	this.txtParentalFailureTitle = "Rating Failed";
	this.txtParentalFailure = "Sorry, the parental rating could not be set";

	/* Settings */
	this.txtSettingsHeading = "Application Settings";
	this.txtSettingsChangeLanguage = "Change Language";
	this.txtSettingsAbout = "About";
	this.txtSettingsDeviceName = "Change Device Name";
	this.txtLanguageChangeMessage = "Choose a language from below.  Press OK to refresh in that language.";
	this.txtDeviceNameChangeMessage = "Change your device name here.  It is used to identify your device in a multi-screen environment.";
	this.txtRefreshApplicationTitle = "Refresh Application";
	this.txtRefreshApplicationMessage = "Application needs to be refreshed.  Continue?";
	this.txtReloadApplicationTitle = "Reload Application";
	this.txtReloadApplicationMessage = "Application data is out of date and needs to be reloaded.  Continue?";
	this.txtDevicenameSettingFailureTitle = "Setting Failed";
	this.txtDeviceNameSettingFailureMessage = "Device name was not set";

	/*Exit dialogs*/
	this.txtReloadAppMessage = "Would you like to reload the application?";
	this.txtExitAppTitle = "Exit Application";
	this.txtExitAppMessage = "Are you sure you want to exit the application?";

	/* Misc */
	this.txtLoadingPleaseWait = "Please Wait";
	this.txtBack = "Back";
	this.txtRetry = "Retry";
	this.txtCancel = "Cancel";
	this.txtSubmit = "Submit";
	this.txtInformation = "Information";
	this.txtOK = "OK";
	this.txtAppUpdateTitle = "Application update available";
	this.txtAppUpdateMessage = "There is a new version of the application, by pressing OK the application will reload and update";
	this.txtRemove = "Remove from favourites";
	this.btnChangeLanguage = "Change";

	/* \n Is a line break.  Leave it in */
	this.txtRemoveMessage = "Would you like to remove \n %TITLE% \n from your favourites category?";

	/* Purchasing */
	this.txtPurchaseOptionLabel = "Rent %DEFINITION% for %DURATION% %CURRENCY% %PRICE%";
	this.txtPurchaseOptionsMessage = "Please choose which option you would like to purchase";
	this.txtPurchasePasswordMessage = "To purchase %TITLE% in %DEFINITION% for %CURRENCY% %PRICE% enter your password below. \n This product will expire in %DURATION%";
	this.txtAlreadyPurchasedTitle = "Content Available";
	this.txtAlreadyPurchased = "It appears that this content is already available for you to play";

	/* Plugin checks */
	this.txtPluginMissing = "Missing Plugin";
	this.txtPluginMissingMessage = "To use this application you need to have the NMP Plugin install, click Download to download and install it.";
	this.txtDownload = "Download";
	this.txtReload = "Reload";
	this.txtContinue = "Continue";
	this.txtUpgrade = "Upgrade";
	this.txtPluginUpgrade = "Upgrade Plugin";
	this.txtPluginForceUpgradeMessage = "You need to upgrade the NMP Plugin, click Upgrade to download and install the newer version.";
	this.txtPluginUpgradeMessage = "There is an upgrade to the NMP Plugin, click Upgrade to download and install the newer version, or Continue to load the application with the older version of the plugin.";
	this.txtPluginDownloading = "Downloading...";
	this.txtPluginInstallMessage = "To use this application you need to have the NMP Plugin installed.\n The latest plugin is currently downloading, once installed please close all browser instances and then reload the application in a new browser window.";
	this.txtPluginUpgradeMessage = "Browser plugin upgrade required. To use this application you need to upgrade to the latest NMP Plugin.\n The latest plugin is currently downloading, once installed please close all browser instances and then reload the application in a new browser window.";

	/* Used in the about dialog */
	this.txtAboutUserName = "User";
	this.txtAboutUIVersion = "UI Version";
	this.txtAboutJSFWVersion = "JSFW Version";
	this.txtAboutNMPVersion = "NMP Version";
	this.txtAboutSDPVersion = "SDP Version";
	this.txtAboutLocation = "Location";
	this.txtAboutUserAgent = "User Agent";
	this.txtAboutNetwork = "Network Type";

	/*Network Recording*/
	this.txtNetworkDevice = "Network PVR";
	this.txtDeleteNetworkRecording = "Delete Recording";
	this.txtDeleteNetworkScheduled = "Cancel Recording Task";
	this.txtDeleteNetworkRecordingMessage = "Would you like to delete \n %PROGRAMME_TITLE% \n from %DEVICE_NAME%?";
	this.txtDeleteNetworkScheduledMessage = "Would you like to cancel the recording of \n %PROGRAMME_TITLE% \n on %DEVICE_NAME%?";
	this.txtDeleteNetworkSeriesRecordingMessage = "Would you like to delete the series \n %PROGRAMME_TITLE% \n from %DEVICE_NAME%?";
	this.txtDeleteNetworkSeriesScheduledMessage = "Would you like to cancel the series recording of \n %PROGRAMME_TITLE% \n on %DEVICE_NAME%?";
	this.txtSetNetworkRecordingTitle = "Set Recording";
	this.txtSetNetworkRecordingMessage = "Record %PROGRAMME_TITLE% on %DEVICE_NAME%?";
	this.txtSetNetworkRecordingSeriesMessage = "Set to record the series";
	this.txtDeleteNetworkRecordingSeriesMessage = "Remove the recorded items in the series";
	this.txtDeleteNetworkRecordingSeriesAllMessage = "Remove the recorded items and cancel the recording of the series";
	this.txtDeleteNetworkRecordingSuccess = "%PROGRAMME_TITLE% successfully removed from %DEVICE_NAME%";
	this.txtSetNetworkRecordingSuccess = "%PROGRAMME_TITLE% successfully scheduled to record on %DEVICE_NAME%";
	this.txtNetworkRemoveError = "Error Removing";
	this.txtProtectNetworkRecordingTitle = "Protect Recording";
	this.txtProtectNetworkRecordingSuccess = "%PROGRAMME_TITLE% successfully protected on %DEVICE_NAME%";
	this.txtUnprotectNetworkRecordingTitle = "Unprotect Recording";
	this.txtUnprotectNetworkRecordingMessage = "To unprotect %PROGRAMME_TITLE% please enter your password";
	this.txtUnprotectNetworkRecordingSuccess = "%PROGRAMME_TITLE% successfully unprotected on %DEVICE_NAME%";
	this.txtProtectedTitle = "Protected Recordings";
	this.txtDeleteTileProtectedMessage = "The recording you are trying delete is protected, please unprotect before trying to delete it.";
	this.txtDeleteTileSeriesProtectedMessage = "Some of the items in the series are protected, are you sure you want to delete/cancel them all?";
	this.txtConfirm = "Confirm";

	/* Favourites */
	this.favouritesError = "Favourites Error";
	this.favouritesServerCreateErr = "Unable to save favourite. Please delete some and try again";
	this.favouritesServerDeleteErr = "Unable to remove favourite";
	this.favouritesMaxReachedErr = "Maximum number of favourites reached. Please delete some and try again";
	this.favouritesDefault = "Error storing favourite";
	this.favouritesStaleUpdate = "There has been an error updating your favourites. Please try again in few seconds";

	/* Subtitles */
	this.txtSubtitles = "Subtitles";
	this.txtEnableDisableSubtitles = "ON/OFF";
	this.txtSubtitlesON = "Turn Subtitles on";
	this.txtSubtitlesOFF = "Turn Subtitles off";

	/* Mobile Video Playback */
	this.txtMobileNetworkPlayback = "3g/4g Playback Settings";
	this.txtMobileVideo = "Enable 3g/4g Video";
	this.txtEnableDisableMobileVideo = "Enabled/Disabled";

	/* Mobile Network Warning Dialog */
	this.txtMobileNetworkDetected = "Cellular Network Detected";
	this.txtMobileNetworkProceed = "Continue";
	this.txtMobileNetworkRetry = "Retry";
	this.txtMobileNetworkClose = "Close";
	this.txtMobileNetworkMessage = "Please note that streaming video on a cellular network may incur additional data charges from your service provider.";

	this.txtMobileNetworkExit = "Exit";
	this.txtMobileNetorkAppLoadMessage = "Continuing may incur additional charges from your service provider.";

	/* Mobile Network Warning Dialog */
	this.txtNetworkChanged = "Cellular Network Detected";
	this.txtNetworkChangedInformation = "Video playback has stopped due to the detection of a cellular network connection. Network type";

	/* Application error */
	this.txtApplicationErrorTitle = "Application Error";
	this.txtApplicationErrorMessage = "The application has encountered an error and must be refreshed.";
	this.txtApplicationErrorButton = "Refresh";

	/* Connection error */
	this.txtConnectionErrorTitle = "Network Error";
	this.txtConnectionErrorMessage = "Unable to connect to the server.<br><br>Please check your internet connection then refresh the application.";
	this.txtConnectionErrorButton = "Refresh";

	/* Connection error */
	this.txtConnectionWarningTitle = "Network Error";
	this.txtConnectionWarningMessage = "Unable to connect to the server.<br><br>Please check your internet connection then try again.";
	this.txtConnectionWarningButton = "Continue";

	/* Asset Search Result Overlay */

	this.txtSearchMatches = "Matches";
	this.txtSearchMoreLikeThis = "More search results";
	this.txtSearchMatchActors = "Actor";
	this.txtSearchMatchTitle = "Title";
	this.txtSearchMatchDirectors = "Director";
	this.txtSearchMatchDescription = "Description";
	this.txtSearchMatchSynopsis = "Synopsis";

	/* Trailer Errors */
	this.txtTrailerErrorTitle = "Trailer Error";
	this.txtTrailerErrorMessage = "Unable to to find the trailer for this content.";

	/* Rating Dialog */
	this.txtRate = "Rate";
	this.txtRateThis = "Rate This!";
	this.txtRateContent = "How do you rate %CONTENT_NAME%?";
	this.txtRatingNotChosen = "No rating chosen";
	this.txtNoThanks = "No Thanks";

	/* No plugin */
	this.txtNoPluginMsg = "Please download and install the plugin before trying again";
	this.txtNoPluginTitle = "No Plugin Installed";

	/*Text that is only in Gateway Branch*/
	this.menuChannels = "Gateway Channels";
	this.menuNowPlaying = "Now Playing";
	this.txtFETCH = "FETCH";
	this.txtFetching = "Fetching";
	this.txtJoinLiveTV = "Joining Live TV";
	this.txtThrowSuccess = "Successfully threw to %DEVICENAME%";
	this.txtThrowTo = "Choose device to throw to";
	this.txtNowPlayingOn = "Now Playing on %DEVICENAME%";
	this.btnPlaybackOnDevice = "Playback on %DEVICENAME%";
	this.txtRemoveRecording = "Remove Recording";
	this.txtRemoveScheduled = "Remove Scheduled Recording";
	this.txtRemoveSeriesRecording = "Remove Series Recording";
	this.txtRemoveRecordingMessage = "Would you like to remove \n %TITLE% \n from your recordings?";
	this.txtRemoveScheduledMessage = "Would you like to remove \n %TITLE% \n from your scheduled recordings?";
	this.txtSetRecordingTitle = "Set recording";
	this.txtSetRecordingMessage = "Record %PROGRAMME_TITLE% on %DEVICE_NAME%";
	this.txtSetRecordingSeriesMessage = "Set to record the series";
	this.txtSetRecordingSuccess = "%PROGRAMME_TITLE% successfully scheduled to record on %DEVICE_NAME%";
	this.txtSetRecordingConflictMessage = "There has been a conflict with another recording task, please check the current tasks and remove the ones you don't want.";
	this.txtSetRecordingGatewayNotFound = "The gateway box cannot be found or is off, please check it.";
	this.txtRemoveError = "Error Removing";
	this.txtRemoveErrorMessage = "The item cannot be removed from the Gateway";
	this.txtGatewayNotFound = "Gateway not found - refreshing...";
	this.txtGatewayFound = "Found gateway";
	this.txtRecordingUnavailable = "The PVR item has been removed from the Gateway, press ok to update the data.";
	this.txtMissingError = "Item Not Found";
	this.txtGatewayLost = "Lost connection to Gateway";
	this.txtGatewayLostMessage = "Please check the connection settings before continuing.";
	this.txtThrowError = "Throw Error";
	this.txtPlaybackErrorMaxDevices = "You have reached the maximum allowable devices to playback on";
	this.txtVODPlayback = "Cannot play VOD";
	this.txtVODPlaybackMessage = "VOD playback is happening on the Gateway, you need to stop this playback before you can play on this device.";
	this.txtCatchUpNodeName = "Catch Up TV";
	this.txtSeriesRecording = "SERIES RECORDING";
	this.txtEpisodes = "Episodes";
	this.txtStarRating = "Rate";
}
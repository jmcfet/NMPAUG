/** Locale file - es_pa */
function CommonLanguageBundle() {

	/* Locale-specific formats */
	/* NOT to be translated but adjusted to formats required for locale as implemented in $N.apps.util.Util.formatDate()/formatTime() */
	this.timeFormat = "HH:MM";
	// e.g. 9:45 am, HH:MM == 13:45
	this.meridianFormat = "am,pm";
	this.GBP = "£";
	this.EUR = "€";
	this.dateFormat = "DY DD MON";
	// e.g. Tue 01 Mar, DD.MM.YYYY == 25.01.1974

	/* Welcome signon dialog */
	this.txtWelcome = "Bienvenido";
	this.txtPleaseEnterDetails = "Por favor, introduzca sus datos";
	this.txtSignIn = "Iniciar sesión";
	this.txtPassword = "contraseña";
	this.txtUsername = "usuario";
	this.txtDevice = "dispositivo";
	//this.txtSignOnConnectionError = "Unable to connect to server";
	this.txtErrorSignOn = "Error al acceder";
	this.txtERROR = "No es posible acceder";
	this.txtSignOnPasswordError = "Su nombre de usuario y/o contraseña son incorrectos";
	//this.txtSignOnAccountSuspended = "Your account is suspended.";
	this.txtSignOnMaxDevicesError = "Ha alcanzado el numero máximo de dispositivos permitidos.\nPor favor, contacte con atención al cliente.";
	this.txtSignOnInvalidDeviceError = "Ha introducido un nombre de dispositivo incorrecto.";
	// this.txtSignOnDeviceNameError = "Device name could not be set";
	// this.txtSignOnPlayerUpgradeIOS = "The application is out of date, please visit the App Store to upgrade it.";
	// this.txtSignOnPlayerUpgradeAndroid = "The application is out of date, please visit the Play Store to upgrade it.";
	// this.txtSignOnPlayerUpgradePlugin = "The plugin is out of date, please contact your provider to find out how to upgrade it.";
	// this.txtUpgradeRecommended = "Upgrade Recommended";
	// this.txtUpgradeRecommendedMessagePC = "There is a recommended upgrade to the player available, press the 'upgrade' button below to download it.";
	// this.txtUpgradeRecommendedMessagePCNoDownload = "There is a recommended upgrade to the player available.";
	// this.txtUpgradeRecommendedMessageIOS = "There is a recommended upgrade to the player available, press the 'upgrade' button below to launch the App Store to download it.";
	// this.txtUpgradeRecommendedMessageAndroid = "There is a recommended upgrade to the player available, press the 'upgrade' button below to launch the Play Store to download it.";
	// this.txtSignOnMaxDeviceClassLimitError = "Device class limit reached";
	// this.txtSignOnMaxDeviceActivationLimitError = "Device activation limit reached";
	// this.txtSignOnMaxDeviceLimitError = "Device limit reached";

	/* Browse Screen */
	this.btnBrowse = "Catálogo";
	this.btnChannels = "Canales";
	this.txtFeatured = "Featured";
	this.menuOnNow = "Ahora";
	this.menuCustom = "Custom";
	this.menuFeatured = "Featured";
	this.menuRecorded = "Grabaciones";
	this.txtRecorded = "Grabaciones";
	this.menuScheduled = "Programado";
	this.txtScheduled = "Programado";
	this.menuFavourites = "Favoritos";
	this.menuRecentlyViewed = "Visto recientemente";
	// this.menuRecommendedForMe = "Recommended for me";
	// this.menuNPVRScheduled = "Scheduled";
	// this.menuNPVRCompleted = "Recorded";
	// this.txtNPVRScheduledHeader = "Scheduled <span class='browse-small-title'> (Locker %PERCENT% full - %HOURS% remain) </span>";
	// this.txtNPVRCompletedHeader = "Recorded <span class='browse-small-title'> (Locker %PERCENT% full - %HOURS% remain) </span>";
	this.txtBrowse = "CATÁLOGO";
	this.txtChannels = "CANALES";
	this.txtCategories = "CATEGORIAS";
	this.txtSearch = "BÚSQUEDA";
	this.txtSearchResults = "Resultados de la búsqueda: %SEARCHTERM%";
	this.txtParentalControls = "Control Parental";
	this.txtSettings = "Ajustes";
	this.txtOptions = "Opciones";
	this.txtClose = "Cerrar";
	this.txtSeeAll = "Ver todo";
	this.txtAllCategories = "Todas las categorías";
	//this.txtFree = "FREE";
	//this.txtPrice = "Price";
	/* Search Screen */
	this.txtSearchTitle = "Búsqueda";

	/* EPG Screen */
	this.txtToday = "Hoy";
	this.txtTomorrow = "Mañana";
	this.txtNoProgrammes = "No hay información disponible";

	/* Please use the following comma (,) as the delimiter for these translations.  Any other character may break date formatting. */
	this.months = "Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre";
	this.monthsShort = "Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic";
	this.days = "Domingo,Lunes,Martes,Miércoles,Jueves,Viernes,Sábado";
	this.daysShort = "Dom,Lun,Mar,Mie,Jue,Vie,Sab";

	this.txtPlay = "Play";
	this.txtHour = "hora";
	this.txtHours = "horas";
	this.txtMin = "min";
	this.txtMins = "mins";
	//this.txtLessThanMin = "less than a minute";
	this.txtNow = "Ahora";
	this.txtNext = "Siguiente";
	this.txtTitleBlocked = "Bloqueado";
	this.txtDescBlocked = "Este evento ha sido bloqueado por control parental.";

	/* Leave strings like %DURATIONSTRING% untranslated (but move them around within the string according to translation
	 * requirements). They are placeholders for values that will be added at run time.
	 */
	this.txtTimeRemaining = "Queda %DURATIONSTRING%";
	this.txtUnsubscribed = "No está subscrito a este canal";
	this.txtUnsubscribedStrap = "Canal no subscrito";
	//this.txtCatchup = "Catchup";
	// this.txtStartOver = "Start Over";
	this.txtUnsubscribedVOD = "You are not subscribed to this content";
	this.txtUnsubscribedStrapVOD = "You are not subscribed to this content";

	/* Media Card Screen */
	this.txtPLAY = "PLAY";
	this.txtBUY = "Comprar";
	this.txtREPLAY = "REPLAY";
	this.txtRESUME = "Reanudar";
	// this.txtPlayNext = "PLAY NEXT";
	this.txtPleaseWait = "Espere, por favor";
	this.txtMoreLikeThis = "Sugerencias";
	// this.txtBtvMoreLikeThis = "More On This Channel";
	// this.txtMoreInThisSeries = "More In This Series";
	// this.txtMoreRecommendations = "Recommendations";
	// this.txtMoreInThisCategory = "More In This Category";
	// this.txtMoreSearchResults = "More Search Results";
	// this.txtNoMoreLikeThisResults = "There are no results available";
	this.txtPurchase = "Comprar";
	this.txtPasswordIncorrect = "Contraseña incorrecta";
	this.txtServerError = "Error de servidor";
	this.txtPurchaseMessage = "Introduzca su contraseña para comprar este video";
	this.txtPasswordErrorMessage = "Su contraseña es incorrecta, por favor, inténtelo de nuevo";
	this.txtServerErrorMessage = "Lo sentimos pero su compra no ha sido realizada";
	this.txtPlayback = "Playback";
	this.txtFailedToThrow = "Error al lanzar al dispositivo";
	this.txtFailedToFindDevices = "Error al encontrar un dispositivo para lanzar el contenido";
	this.txtExpires = "Expira en";

	/*
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
	*/

	this.txtMultipleOptions = "Existen multiples versiones de este contenido. Seleccione uno de la lista";
	// this.txtPlaybackError = "Playback Error";
	// this.txtPlaybackErrorInvalidLicense = "The license for this content is invalid";
	// this.txtPlaybackErrorLicenseExpired = "The license for this content has expired";
	// this.txtPlaybackErrorGeneric = "There has been an error while attempting to playback";
	// this.txtPlaybackSessionLimitReached = "A session/streaming request has been made that would exceed the provisioned limit";
	// this.txtPlaybackSessionSPLimitReached = "A session/streaming request has been made that exceeds the provisioned limit of maximum number of allowed sessions per service provider";

	/* Action bar */
	this.btnRecord = "Grabar";
	this.btnDownload = "Descargar";
	this.btnAddCollection = "Añadir a Colección";
	this.btnSetReminder = "Fijar recordatorio";
	this.btnAddFavourites = "Añadir a favoritos";
	this.btnRemoveFavourites = "Borrar de favoritos";
	this.btnAddChannelFavourites = "Añadir canal a favoritos";
	this.btnRemoveChannelFavourites = "Borrar canal de favoritos";
	this.btnBuy = "Comprar";
	this.btnChooseScreen = "Elegir pantalla";
	this.btnDeleteProgramme = "Borrar programa";
	this.btnMoreInfo = "Más info";
	this.btnPLAY = "PLAY";
	this.btnPLAYTRAILER = "PLAY TRAILER";
	this.btnSTOPTRAILER = "STOP TRAILER";
	// this.btnNPVRRecord = "Record (%PERCENT%% full)";
	// this.btnNPVRDelete = "Delete Recording";
	// this.btnNPVRCancel = "Cancel Recording Task";
	// this.btnNPVRProtect = "Protect";
	// this.btnNPVRUnprotect = "Unprotect";

	/* Search */
	this.txtNoResultsInSearch = "Su búsqueda no tiene resultados";
	this.txtNoResultsInCategory = "No hay resultados en la categoría";
	// this.txtNoResultsParentalInCategory = "Results blocked by parental controls";
	this.txtNoResultsInFavourites = "Actulmente no tiene favoritos";
	this.btnSearch = "Buscar";

	/* Parental Controls */
	this.txtParentalControlsHeading = "Control Parental";
	this.txtParentalListPrompt = "Elija el nivel de contenido que desea mostrar";
	this.txtPasswordRequired = "Se requiere contraseña";
	this.txtParentalTurnOffPrompt = "Eliminar control parental";
	this.txtParentalChangePrompt = "Cambiar el control parental a ";
	this.txtParentalPasswordPrompt = " por favor introduzca su contraseña";
	this.txtParentalComplete = "Rating cambiado, por favor presione OK para refrescar la aplicación";
	this.txtRating1 = "Para todos los publicos";
	this.txtRating2 = "Bajo supervisión parental";
	this.txtRating3 = "Para mayores de 12 años";
	this.txtRating4 = "Para mayores de 15 años";
	this.txtRating5 = "Mostrar todo el contenido";
	// this.txtParentalFailureTitle = "Rating Failed";
	// this.txtParentalFailure = "Sorry, the parental rating could not be set";

	/* Settings */
	this.txtSettingsHeading = "Ajustes de aplicación";
	this.txtSettingsChangeLanguage = "Cambiar idioma";
	this.txtSettingsAbout = "Acerca de";
	this.txtSettingsDeviceName = "Cambiar nombre de dispositivo";
	this.txtLanguageChangeMessage = "Elija un idioma. Presione OK para refrescar la aplicación.";
	this.txtDeviceNameChangeMessage = "Inserte el nuevo nombre para identificar su dispositivo.";
	this.txtRefreshApplicationTitle = "Refrescar aplicación";
	this.txtRefreshApplicationMessage = "La aplicación debe ser refrescada. ¿Continuar?";
	this.txtReloadApplicationTitle = "Recargar aplicación";
	this.txtReloadApplicationMessage = "Los datos de la aplicación han caducado y necesitan ser recargados. ¿Continuar?";
	//this.txtDevicenameSettingFailureTitle = "Setting Failed";
	//this.txtDeviceNameSettingFailureMessage = "Device name was not set";

	/*Exit dialogs*/
	this.txtReloadAppMessage = "Would you like to reload the application?";
	this.txtExitAppTitle = "Exit Application";
	this.txtExitAppMessage = "Are you sure you want to exit the application?";

	/* Misc */
	this.txtLoadingPleaseWait = "Espere, por favor";
	this.txtBack = "Atrás";
	this.txtRetry = "Reintentar";
	this.txtCancel = "Cancelar";
	this.txtSubmit = "Enviar";
	this.txtInformation = "Información";
	this.txtOK = "OK";
	this.txtAppUpdateTitle = "Actualización disponible";
	this.txtAppUpdateMessage = "Hay una una versión de la aplicación, pulse OK para actualizar y recargar.";
	this.txtRemove = "Borrar de favoritos";
	this.btnChangeLanguage = "Cambiar";

	/* \n Is a line break.  Leave it in */
	this.txtRemoveMessage = "¿Desea eliminar \n %TITLE% \n de su lista de favoritos?";

	/* Purchasing */
	this.txtPurchaseOptionLabel = "Alquilar %DEFINITION% durante %DURATION% %CURRENCY% %PRICE%";
	this.txtPurchaseOptionsMessage = "Elija la opción de compra";
	this.txtPurchasePasswordMessage = "Para comprar %TITLE% en %DEFINITION% por %CURRENCY% %PRICE% introduzca su contraseña. \n Este producto expira en  %DURATION%";
	this.txtAlreadyPurchasedTitle = "Contenido disponible";
	this.txtAlreadyPurchased = "Este contenido ya está disponible para ver";

	/* Plugin checks */
	this.txtPluginMissing = "Plugin no encontrado";
	this.txtPluginMissingMessage = "Para usar la aplicación necesita instalar el plugin NMP, pulse en Download para descargarlo.";
	this.txtDownload = "Descargar";
	this.txtReload = "Recargar";
	this.txtContinue = "Continuar";
	this.txtUpgrade = "Actualizar";
	this.txtPluginUpgrade = "Actualizar Plugin";
	this.txtPluginForceUpgradeMessage = "Necesita actualizar el plugin. Pulse Actualizar para descargar e instalar la nueva versión.";
	this.txtPluginUpgradeMessage = "Hay un plugin más actual, haga click en Actualizar para descargar e instalar la nueva versión, o pulse continuar para cargar la aplicación con la versión actual.";
	this.txtPluginDownloading = "Descargando...";
	this.txtPluginInstallMessage = "Para usas esta aplicación necesita el plugin NMP.\n La última versión se está descargando, una vez instalado pulse Recargar para lanzar la aplicación.";
	// this.txtPluginUpgradeMessage = "To use this application you need to upgrade to the latest NMP Plugin.\n The latest plugin is currently downloading, once installed press the Reload button to start the app.";

	/* Used in the about dialog */
	this.txtAboutUserName = "Usuario";
	this.txtAboutUIVersion = "Versión de UI";
	this.txtAboutJSFWVersion = "Versión de JSFW";
	this.txtAboutNMPVersion = "Versión de NMP";
	this.txtAboutSDPVersion = "Versión de SDP";
	this.txtAboutLocation = "Localización";
	this.txtAboutUserAgent = "User Agent";
	//this.txtAboutNetwork = "Network Type";

	/*Network Recording*/
	// this.txtNetworkDevice = "Network PVR";
	// this.txtDeleteNetworkRecording = "Delete Recording";
	// this.txtDeleteNetworkScheduled = "Cancel Recording Task";
	// this.txtDeleteNetworkRecordingMessage = "Would you like to delete \n %PROGRAMME_TITLE% \n from %DEVICE_NAME%?";
	// this.txtDeleteNetworkScheduledMessage = "Would you like to cancel the recording of \n %PROGRAMME_TITLE% \n on %DEVICE_NAME%?";
	// this.txtDeleteNetworkSeriesRecordingMessage = "Would you like to delete the series \n %PROGRAMME_TITLE% \n from %DEVICE_NAME%?";
	// this.txtDeleteNetworkSeriesScheduledMessage = "Would you like to cancel the series recording of \n %PROGRAMME_TITLE% \n on %DEVICE_NAME%?";
	// this.txtSetNetworkRecordingTitle = "Set recording";
	// this.txtSetNetworkRecordingMessage = "Record %PROGRAMME_TITLE% on %DEVICE_NAME%?";
	// this.txtSetNetworkRecordingSeriesMessage = "Set to record the series";
	// this.txtDeleteNetworkRecordingSeriesMessage = "Remove the recorded items in the series";
	// this.txtDeleteNetworkRecordingSeriesAllMessage = "Remove the recorded items and cancel the recording of the series";
	// this.txtDeleteNetworkRecordingSuccess = "%PROGRAMME_TITLE% successfully removed from %DEVICE_NAME%";
	// this.txtSetNetworkRecordingSuccess = "%PROGRAMME_TITLE% successfully scheduled to record on %DEVICE_NAME%";
	// this.txtNetworkRemoveError = "Error Removing";
	// this.txtProtectNetworkRecordingTitle = "Protect Recording";
	// this.txtProtectNetworkRecordingSuccess = "%PROGRAMME_TITLE% successfully protected on %DEVICE_NAME%";
	// this.txtUnprotectNetworkRecordingTitle = "Unprotect Recording";
	// this.txtUnprotectNetworkRecordingMessage = "To unprotect %PROGRAMME_TITLE% please enter your password";
	// this.txtUnprotectNetworkRecordingSuccess = "%PROGRAMME_TITLE% successfully unprotected on %DEVICE_NAME%";
	// this.txtProtectedTitle = "Protected Recordings";
	// this.txtDeleteTileProtectedMessage = "The recording you are trying delete is protected, please unprotect before trying to delete it.";
	// this.txtDeleteTileSeriesProtectedMessage = "Some of the items in the series are protected, are you sure you want to delete/cancel them all?";
	// this.txtConfirm = "Confirm";

	/* Favourites */
	//this.favouritesError = "Favourites Error";
	//this.favouritesServerCreateErr = "Unable to save favourite. Please delete some and try again";
	//this.favouritesServerDeleteErr = "Unable to remove favourite";
	//this.favouritesMaxReachedErr = "Maximum number of favourites reached. Please delete some and try again";
	//this.favouritesDefault = "Error storing favourite";
	this.favouritesStaleUpdate = "There has been an error updating your favourites. Please try again in few seconds";

	/* Subtitles */
	this.txtSubtitles = "Subtitles";
	this.txtEnableDisableSubtitles = "ON/OFF";
	this.txtSubtitlesON = "Turn Subtitles on";
	this.txtSubtitlesOFF = "Turn Subtitles off";

	/* Mobile Video Playback */
	//this.txtMobileNetworkPlayback = "3g/4g Playback Settings";
	//this.txtMobileVideo = "3g/4g Video Playback";
	//this.txtEnableDisableMobileVideo = "Enabled/Disabled";

	/* Mobile Network Warning Dialog */
	//this.txtMobileNetworkDetected = "Mobile Network Detected";
	//this.txtMobileNetworkProceed = "Continue";
	//this.txtMobileNetworkRetry = "Retry";
	//this.txtMobileNetworkClose = "Close";
	//this.txtMobileNetworkMessage = "Please note that mobile streaming may incur additional data charges from your mobile network.";

	//this.txtMobileNetworkExit = "Exit";
	//this.txtMobileNetorkAppLoadMessage = "Continuing may incur additional charges from your mobile network provider.";

	/* Mobile Network Warning Dialog */
	//this.txtNetworkChanged = "Network changed";
	//this.txtNetworkChangedInformation = "Network type has changed to";

	/* Application error */
	//this.txtApplicationErrorTitle = "Application Error";
	//this.txtApplicationErrorMessage = "The application has encountered an error and must be refreshed.";
	//this.txtApplicationErrorButton = "Refresh";

	/* Connection error */
	//this.txtConnectionErrorTitle = "Network Error";
	//this.txtConnectionErrorMessage = "Unable to connect to the server.<br><br>Please check your internet connection then refresh the application.";
	//this.txtConnectionErrorButton = "Refresh";

	/* Connection error */
	//this.txtConnectionWarningTitle = "Network Error";
	//this.txtConnectionWarningMessage = "Unable to connect to the server.<br><br>Please check your internet connection then try again.";
	//this.txtConnectionWarningButton = "Continue";

	/* Asset Search Result Overlay */
	//this.txtSearchMatches = "Matches";
	//this.txtSearchMoreLikeThis = "Other results";
	//this.txtSearchMatchActors = "Actor";
	//this.txtSearchMatchTitle = "Title";
	//this.txtSearchMatchDirectors = "Director";
	//this.txtSearchMatchDescription = "Description";
	//this.txtSearchMatchSynopsis = "Synopsis";

	/* Trailer Errors */
	// this.txtTrailerErrorTitle = "Trailer Error";
	// this.txtTrailerErrorMessage = "Unable to to find the trailer for this content.";

	/* Rating Dialog */
	//this.txtRate = "Rate";
	//this.txtRateThis = "Rate This!";
	//this.txtRateContent = "How do you rate %CONTENT_NAME%?";
	//this.txtRatingNotChosen = "No rating chosen";
	//this.txtNoThanks = "No Thanks";

	/* No plugin */
	//this.txtNoPluginMsg = "No plugin installed. Please download and install the plugin before continuing";
	//this.txtNoPluginTitle = "No Plugin Installed";

	/*Text that is only in Gateway Branch*/
	//this.menuChannels = "Gateway Channels";
	//this.menuNowPlaying = "Now Playing";
	//this.txtFETCH = "FETCH";
	//this.txtFetching = "Fetching";
	//this.txtJoinLiveTV = "Joining Live TV";
	//this.txtThrowSuccess = "Successfully threw to %DEVICENAME%";
	//this.txtThrowTo = "Choose device to throw to";
	//this.txtNowPlayingOn = "Now Playing on %DEVICENAME%";
	//this.btnPlaybackOnDevice = "Playback on %DEVICENAME%";
	//this.txtRemoveRecording = "Remove Recording";
	//this.txtRemoveScheduled = "Remove Scheduled Recording";
	//this.txtRemoveSeriesRecording = "Remove Series Recording";
	//this.txtRemoveRecordingMessage = "Would you like to remove \n %TITLE% \n from your recordings?";
	//this.txtRemoveScheduledMessage = "Would you like to remove \n %TITLE% \n from your scheduled recordings?";
	//this.txtSetRecordingTitle = "Set recording";
	//this.txtSetRecordingMessage = "Record %PROGRAMME_TITLE% on %DEVICE_NAME%";
	//this.txtSetRecordingSeriesMessage = "Set to record the series";
	//this.txtSetRecordingSuccess = "%PROGRAMME_TITLE% successfully scheduled to record on %DEVICE_NAME%";
	//this.txtSetRecordingConflictMessage = "There has been a conflict with another recording task, please check the current tasks and remove the ones you don't want.";
	//this.txtSetRecordingGatewayNotFound = "The gateway box cannot be found or is off, please check it.";
	//this.txtRemoveError = "Error Removing";
	//this.txtRemoveErrorMessage = "The item cannot be removed from the Gateway";
	//this.txtGatewayNotFound = "Gateway not found - refreshing...";
	//this.txtGatewayFound = "Found gateway";
	//this.txtRecordingUnavailable = "The PVR item has been removed from the Gateway, press ok to update the data.";
	//this.txtMissingError = "Item Not Found";
	//this.txtGatewayLost = "Lost connection to Gateway";
	//this.txtGatewayLostMessage = "Please check the connection settings before continuing.";
	//this.txtThrowError = "Throw Error";
	//this.txtPlaybackErrorMaxDevices = "You have reached the maximum allowable devices to playback on";
	//this.txtVODPlayback = "Cannot play VOD";
	//this.txtVODPlaybackMessage = "VOD playback is happening on the Gateway, you need to stop this playback before you can play on this device.";
	//this.txtCatchUpNodeName = "Catch Up TV";
	//this.txtSeriesRecording = "SERIES RECORDING";
	//this.txtEpisodes = "Episodes";
	//this.txtStarRating = "Rate";
}

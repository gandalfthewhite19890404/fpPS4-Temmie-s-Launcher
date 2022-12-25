/*
	******************************************************************************
	fpPS4 Temmie's Launcher
	design.js

	This file contains tools, functions and variables related for rendering and
	updating main GUI

	Quick note: This is probably the largest file on this project!
	******************************************************************************
*/

temp_DESIGN = {

	// Hack List
	hackList: [
		'DEPTH_DISABLE_HACK',
		'COMPUTE_DISABLE_HACK',
		'MEMORY_BOUND_HACK',
		'IMAGE_TEST_HACK',
		'IMAGE_LOAD_HACK',
		'DISABLE_SRGB_HACK'
	],

	// Process checkbox status
	processCheckbox: function(domName){

		var res = !1,
		    domId = document.getElementById(domName).checked;

		if (domId === !1){
			res = !0;
		}

		document.getElementById(domName).checked = res;

	},

	// Parse percentage
	parsePercentage: function(current, maximum){

		var res = 0;
		
		if (current !== void 0 && maximum !== void 0){
			res = Math.floor((current / maximum) * 100);
		}
		
		return res;

	},
	
	// Render hack list
	renderHacklist: function(){

		var htmlTemp = '';
		this.hackList.forEach(function(hackName){
			htmlTemp = htmlTemp + '<input type="checkbox" id="CHECK_' + hackName + '"><label class="LABEL_checkbox" onclick="APP.design.processCheckbox(\'CHECK_' + hackName +
					   '\');">Enable ' + hackName + '</label><br>';
		});

		document.getElementById('DIV_HACK_LIST').innerHTML = htmlTemp;

		// Render GUI
		this.update();

	},

	// Render game list
	renderGameList: function(customList){

		var tempHtml = '',
			gList = customList;
		
		if (customList === void 0){
			gList = APP.gameList.list;
		}

		// Process game list
		Object.keys(gList).forEach(function(cGame){

			var appTitle = '',
				gameBgAndIcon,
				classDisplayEntryMode = '',
				appNameClass = 'LABEL_gameTitle',
				classGameDetailsMode = 'GAME_DETAILS',
				gameMetadata = '<br>Path: ' + gList[cGame].exe,
				bgPath = 'url(\'' + gList[cGame].bg.replace(RegExp('\'', 'gi'), '\\\'') + '\')';

			// Disable background image
			if (APP.settings.data.gui.showBgOnEntry !== !0){
				bgPath = 'none';
			}

			// Background and Icon
			gameBgAndIcon = '<div class="GAME_ENTRY_BG" style="background-image: ' + bgPath + '";></div><img class="IMG_GAME_ICON" src="' + gList[cGame].icon + '">';

			// If PARAM.SFO metadata exists, show serial and game version instead
			if (Object.keys(gList[cGame].paramSfo).length !== 0){
				gameMetadata = '<br>' + gList[cGame].paramSfo.TITLE_ID + ' - Version ' + gList[cGame].paramSfo.APP_VER;
			}

			// Settings: Show App / Game version (or executable path) for every title in game list
			if (APP.settings.data.gui.showPathEntry !== !0){
				gameMetadata = '';
			}

			// Display mode: Compact
			if (APP.settings.data.gui.gameListMode === 'compact'){
				gameMetadata = '';
				gameBgAndIcon = '';
				appNameClass = 'LABEL_gameTitleCompact';
				classDisplayEntryMode = ' GAME_ENTRY_COMPACT';
			}

			// Display mode: Grid
			if (APP.settings.data.gui.gameListMode === 'grid'){
				appTitle = gList[cGame].name;
				classGameDetailsMode = 'none';
				classDisplayEntryMode = ' GAME_ENTRY_GRID';
				gameBgAndIcon = '<div class="none" style="background-image: ' + bgPath + '";></div><img class="IMG_GAME_ICON IMG_GRID" src="' + gList[cGame].icon + '">';
			}

			/*
				Add entry
			*/
			tempHtml = tempHtml + '<div class="GAME_ENTRY' + classDisplayEntryMode + '" title="' + appTitle + '" onclick="APP.design.selectGame(\'' + cGame + '\');" id="GAME_ENTRY_' + cGame + '">' + gameBgAndIcon +
								  '<div class="' + classGameDetailsMode + '"><label class="' + appNameClass + '">' + gList[cGame].name + '</label>' + gameMetadata + '</div></div>';
		});

		// Insert HTML
		document.getElementById('DIV_LIST_INTERNAL').innerHTML = tempHtml;

		// Clear BG image
		TMS.css('DIV_GAMELIST_BG', {'background-image': 'none'});

	},

	// Select game
	selectGame: function(gameName){

		// Settings file
		var folderName = APP.gameList.list[gameName].folderName, 
			settingsFile = APP.settings.data.gamePath + '/' + folderName + '/launcherSettings.json';

		if (APP.gameList.list[gameName] !== void 0){

			// Select game and update GUI
			APP.gameList.selectedGame = gameName;
			APP.design.update();

			// Check if game config exists
			if (APP.fs.existsSync(settingsFile) === !1){

				// Get hack list
				var hList = {};
				APP.design.hackList.forEach(function(cHack){
					hList[cHack] = !1;
				});

				// Create settings file
				APP.gameList.createGameSettings({
					hacks: hList,
					path: settingsFile,
					name: APP.gameList.list[gameName].name,
					paramSfo: APP.gameList.list[gameName].paramSfo
				});

			}

			// Load settings file
			const gSettings = JSON.parse(APP.fs.readFileSync(settingsFile, 'utf-8'));
			APP.gameList.cGameSettings = gSettings;

			// Set hacks
			Object.keys(gSettings.hacks).forEach(function(hackName){
				document.getElementById('CHECK_' + hackName).checked = JSON.parse(gSettings.hacks[hackName]);
			});

		}

	},

	// Update GUI
	update: function(){

		// Update background image
		const sGame = APP.gameList.list[APP.gameList.selectedGame];
		if (sGame !== '' && sGame !== void 0){
			TMS.css('DIV_GAMELIST_BG', {
				'background-image': 'url("' + sGame.bg + '")'
			});
		}

		// Check if emu is present before allowing to run
		if (APP.fs.existsSync(APP.settings.data.emuPath) === !0 && APP.gameList.selectedGame !== ''){

			var btnRun = '',
				btnRefresh = '',
				btnSettings = '',
				logHeight = '248px',
				btnKill = 'disabled',
				emuRunPath = 'block',
				bgBlur = APP.settings.data.gui.bgListBlur,
				bgOpacity = APP.settings.data.gui.bgListOpacity,
				optionsCss = {'height': 'calc(100% - 298px)', 'display': 'block'},
				listCss = {'width': 'calc(100% - 280px)', 'height': 'calc(100% - 286px)'};

			// If emu is running
			if (APP.emuManager.emuRunning === !0){
	
				btnKill = '';
				btnRun = 'disabled';
				btnRefresh = 'disabled';
				btnSettings = 'disabled';
				logHeight = 'calc(100% - 400px)';
				bgBlur = APP.settings.data.gui.bgEmuBlur;
				listCss = {'width': '100%', 'height': '362px'};
				bgOpacity = APP.settings.data.gui.bgEmuOpacity;
				optionsCss = {'height': '350px', 'display': 'none'};
	
			}

			// Show / Hide path on game run
			if (APP.settings.data.gui.showPathRunning === !1){
				emuRunPath = 'none';
			}

			// Update GUI
			TMS.css('DIV_LIST', listCss);
			TMS.css('DIV_OPTIONS', optionsCss);
			TMS.css('DIV_LOG', {'height': logHeight});
			TMS.css('DIV_GAME_DETAILS_currentExec', {'display': emuRunPath});
			TMS.css('DIV_GAMELIST_BG', {'filter': 'blur(' + bgBlur + 'px) opacity(' + bgOpacity + ')'});
	
			// Update Buttons
			document.getElementById('BTN_RUN').disabled = btnRun;
			document.getElementById('BTN_KILL').disabled = btnKill;
			document.getElementById('BTN_REFRESH').disabled = btnRefresh;
			document.getElementById('BTN_SETTINGS').disabled = btnSettings;
			document.getElementById('INPUT_gameListSearch').disabled = btnRun;

		}

		// Selected game name
		var cGameName = 'No game selected';

		// If no game is selected, disable run button
		if (APP.gameList.selectedGame === ''){
			document.getElementById('BTN_RUN').disabled = 'disabled';
		}

		// Fix for grid mode
		if (APP.settings.data.gui.gameListMode === 'grid'){
			TMS.addClass('DIV_LIST_INTERNAL', 'DIV_LIST_GRID');
		} else {
			TMS.removeClass('DIV_LIST_INTERNAL', 'DIV_LIST_GRID');
		}

		// Disable Clear / Save log if clearLogOnEmuLoad, saveLogOnEmuClose or logOnExternalWindow are true
		var disableClearSaveBtn = '';
		if (APP.settings.data.clearLogOnEmuLoad === !0 || APP.settings.data.saveLogOnEmuClose === !0 || APP.settings.data.logOnExternalWindow === !0){
			disableClearSaveBtn = 'disabled';
		}
		document.getElementById('BTN_SAVE_LOG').disabled = disableClearSaveBtn;

		// If selected game exists, get it's name
		if (APP.gameList.list[APP.gameList.selectedGame] !== void 0){
			cGameName = APP.gameList.list[APP.gameList.selectedGame].name;
		}
		
		// Render current game name
		document.getElementById('DIV_labelSelectedGame').innerHTML = cGameName;

		// Scroll log
		var tx = document.getElementById('APP_LOG');
		tx.scrollTop = tx.scrollHeight;

		// Render Settings
		this.renderSettings();

	},

	// Change game list to display mode
	toggleDisplayMode: function(gameData){

		if (gameData !== void 0){
			
			var gameDetails = {'display': 'flex'},
				gameMetadata = 'Path: <label class="user-can-select">' + gameData.appPath + '</label>',
				listInternal = {'transition': '0.4s', 'filter': 'blur(' + APP.settings.data.gui.bgEmuBlur +'px) opacity(' + APP.settings.data.gui.bgEmuOpacity + ')'};
	
			// If emu isn't running
			if (APP.emuManager.emuRunning === !1){
	
				gameDetails = {'display': 'none'};
				listInternal = {'transition': 'none', 'filter': 'blur(' + APP.settings.data.gui.bgListBlur +'px) opacity(' + APP.settings.data.gui.bgListOpacity + ')'};
				APP.design.renderGameList();
	
			} else {

				// If PARAM.SFO metadata exists, display serial and game version instead
				if (Object.keys(gameData.paramSfo).length !== 0){
					gameMetadata = gameData.paramSfo.TITLE_ID + ' - Version ' + gameData.paramSfo.APP_VER;
				}
				
				// Clear game list
				document.getElementById('DIV_LIST_INTERNAL').innerHTML = '';
	
			}

			// Fix undefined path
			if (gameData.appIcon === void 0){
				gameData.appIcon = APP.settings.data.nwPath + '/App/img/404.png';
			}

			// Set game metadata
			document.getElementById('IMG_APP_ICON').src = gameData.appIcon;
			document.getElementById('DIV_GAME_DETAILS_currentExec').innerHTML = gameMetadata;
			document.getElementById('LABEL_GAME_DETAILS_STATUS').innerHTML = gameData.appStatus;
			document.getElementById('LABEL_GAME_DETAILS_APP_NAME').innerHTML = gameData.appName;
	
			// Set CSS
			TMS.css('DIV_GAMELIST_BG', listInternal);
			TMS.css('DIV_GAME_DETAILS', gameDetails);

		}

	},

	// Display / Hide Settings
	toggleSettings: function(hide){

		var showList = ['DIV_SETTINGS'],
			hideList = [
				'DIV_ACTIONS',
				'DIV_OPTIONS',
				'DIV_LIST',
				'DIV_LOG'
			];

		// Close settings
		if (hide === !0){

			hideList = ['DIV_SETTINGS'];
			showList = [
				'DIV_ACTIONS',
				'DIV_OPTIONS',
				'DIV_LIST',
				'DIV_LOG'
			];

			// Render game list
			APP.design.renderGameList();

			// Update GUI
			APP.design.update();

		}

		hideList.forEach(function(cElement){
			TMS.css(cElement, {'display': 'none'});
		});

		showList.forEach(function(cElement){
			TMS.css(cElement, {'display': 'block'});
		});

		// Render Settings
		this.renderSettings();

	},

	// Render settings list
	renderSettings: function(requestSave){

		// If need to save
		if (requestSave === !0){
			APP.design.saveSettings(requestSave);
		}

		// Shortcut
		const cSettings = APP.settings.data;

		// Lib modules path
		var tempHtml = '<option disabled="disabled">No lib folders detected</option>';
			libList = APP.fs.readdirSync(cSettings.libPath);
		
		// Check if exists lib folders on path
		if (libList.length !== 0){
		
			// Reset lib list
			tempHtml = '';

			// Process lib list
			libList.forEach(function(cLib){
				tempHtml = tempHtml + '<option value="' + cLib + '">' + cLib + '</option>';
			});

			// If Lib option is not select, use first item on list
			if (cSettings.selectedLibFolder === ''){
				cSettings.selectedLibFolder = libList[0];
			}
		
		}

		// Render Lib select option
		document.getElementById('SELECT_settingsSelectedLibPath').innerHTML = tempHtml;

		// Labels
		document.getElementById('LBL_SETTINGS_emuPath').innerHTML = cSettings.emuPath
		document.getElementById('LBL_SETTINGS_libPath').innerHTML = cSettings.libPath;
		document.getElementById('LBL_SETTINGS_gamePath').innerHTML = cSettings.gamePath;
		document.getElementById('LABEL_settingsGameListBgBlur').innerHTML = this.parsePercentage(cSettings.gui.bgListBlur, 6);
		document.getElementById('LABEL_settingsEmuRunningBgBlur').innerHTML = this.parsePercentage(cSettings.gui.bgEmuBlur, 6);
		document.getElementById('LABEL_settingsGameListBgOpacity').innerHTML = this.parsePercentage(cSettings.gui.bgListOpacity, 1);
		document.getElementById('LABEL_settingsEmuRunningBgOpacity').innerHTML = this.parsePercentage(cSettings.gui.bgEmuOpacity, 1);

		// Select
		document.getElementById('SELECT_settingsDisplayMode').value = cSettings.gui.gameListMode;
		document.getElementById('SELECT_settingsSearchMode').value = cSettings.gui.gameSearchMode;
		document.getElementById('SELECT_settingsSelectedLibPath').value = cSettings.selectedLibFolder;

		// Checkbox
		document.getElementById('CHECKBOX_settingsEnableParamSfo').checked = JSON.parse(cSettings.enableParamSfo);
		document.getElementById('CHECKBOX_settingsShowExecList').checked = JSON.parse(cSettings.gui.showPathEntry);
		document.getElementById('CHECKBOX_settingsShowExecRunning').checked = JSON.parse(cSettings.gui.showPathRunning);
		document.getElementById('CHECKBOX_settingsShowBgOnGameEntry').checked = JSON.parse(cSettings.gui.showBgOnEntry);
		document.getElementById('CHECKBOX_settingsSaveLogOnEmuClose').checked = JSON.parse(cSettings.saveLogOnEmuClose);
		document.getElementById('CHECKBOX_settingsClearLogOnEmuLoad').checked = JSON.parse(cSettings.clearLogOnEmuLoad);
		document.getElementById('CHECKBOX_settingsSeekMissingModules').checked = JSON.parse(cSettings.seekMissingModules);
		document.getElementById('CHECKBOX_settingsLogOnExternalWindow').checked = JSON.parse(cSettings.logOnExternalWindow);

		// Range
		document.getElementById('RANGE_settingsGameListBgBlur').value = cSettings.gui.bgListBlur;
		document.getElementById('RANGE_settingsEmuRunningBgBlur').value = cSettings.gui.bgEmuBlur;
		document.getElementById('RANGE_settingsGameListBgOpacity').value = cSettings.gui.bgListOpacity;
		document.getElementById('RANGE_settingsEmuRunningBgOpacity').value = cSettings.gui.bgEmuOpacity;

	},

	// Save user settings
	saveSettings: function(skipCloseSettings){

		// Select
		APP.settings.data.gui.gameListMode = document.getElementById('SELECT_settingsDisplayMode').value;
		APP.settings.data.gui.gameSearchMode = document.getElementById('SELECT_settingsSearchMode').value;
		APP.settings.data.selectedLibFolder = document.getElementById('SELECT_settingsSelectedLibPath').value;

		// Checkbox
		APP.settings.data.enableParamSfo = JSON.parse(document.getElementById('CHECKBOX_settingsEnableParamSfo').checked);
		APP.settings.data.gui.showPathEntry = JSON.parse(document.getElementById('CHECKBOX_settingsShowExecList').checked);
		APP.settings.data.gui.showBgOnEntry = JSON.parse(document.getElementById('CHECKBOX_settingsShowBgOnGameEntry').checked);
		APP.settings.data.gui.showPathRunning = JSON.parse(document.getElementById('CHECKBOX_settingsShowExecRunning').checked);
		APP.settings.data.saveLogOnEmuClose = JSON.parse(document.getElementById('CHECKBOX_settingsSaveLogOnEmuClose').checked);
		APP.settings.data.clearLogOnEmuLoad = JSON.parse(document.getElementById('CHECKBOX_settingsClearLogOnEmuLoad').checked);
		APP.settings.data.seekMissingModules = JSON.parse(document.getElementById('CHECKBOX_settingsSeekMissingModules').checked);
		APP.settings.data.logOnExternalWindow = JSON.parse(document.getElementById('CHECKBOX_settingsLogOnExternalWindow').checked);

		// Range
		APP.settings.data.gui.bgListBlur = parseFloat(document.getElementById('RANGE_settingsGameListBgBlur').value);
		APP.settings.data.gui.bgEmuBlur = parseFloat(document.getElementById('RANGE_settingsEmuRunningBgBlur').value);
		APP.settings.data.gui.bgListOpacity = parseFloat(document.getElementById('RANGE_settingsGameListBgOpacity').value);
		APP.settings.data.gui.bgEmuOpacity = parseFloat(document.getElementById('RANGE_settingsEmuRunningBgOpacity').value);

		/*
			End
		*/

		// Save settings
		APP.settings.save();

		// GUI: Close settings
		if (skipCloseSettings !== !0){
			APP.design.toggleSettings(!0);
		}

	}

}
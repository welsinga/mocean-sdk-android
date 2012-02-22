/*� 2010-2011 mOcean Mobile. A subsidiary of Mojiva, Inc. All Rights Reserved.*/
/*
 * Anonymous function to encapsulate the OrmmaAdController methods
 */
 //getViewable,supports
 
 
const ORMMA_STATE_UNKNOWN  = "unknown";
const ORMMA_STATE_HIDDEN   = "hidden";
const ORMMA_STATE_DEFAULT  = "default";
const ORMMA_STATE_EXPANDED = "expanded";
const ORMMA_STATE_RESIZED = "resized";

const ORMMA_EVENT_ERROR = "error";
const ORMMA_EVENT_HEADING_CHANGE = "headingChange";
const ORMMA_EVENT_KEYBOARD_CHANGE = "keyboardChange";
const ORMMA_EVENT_LOCATION_CHANGE = "locationChange";
const ORMMA_EVENT_NETWORK_CHANGE = "networkChange";
const ORMMA_EVENT_ORIENTATION_CHANGE = "orientationChange";
const ORMMA_EVENT_READY = "ready";
const ORMMA_EVENT_RESPONSE = "response";
const ORMMA_EVENT_SCREEN_CHANGE = "screenChange";
const ORMMA_EVENT_SHAKE = "shake";
const ORMMA_EVENT_SIZE_CHANGE = "sizeChange";
const ORMMA_EVENT_STATE_CHANGE = "stateChange";
const ORMMA_EVENT_VIEWABLE_CHANGE = "viewableChange";
const ORMMA_EVENT_TILT_CHANGE = "tiltChange";
const ORMMA_EVENT_ASSET_READY = "assetReady";
const ORMMA_EVENT_ASSET_REMOVED = "assetRemoved";
const ORMMA_EVENT_ASSET_RETIRED = "assetRetired";

(function() {
    /**
     * The main ad controller object
     */
    Ormma = {

        /**
         * The object that holds all types of OrmmaAdController events and associated listeners
         */
        events : [],

        /**
         * Holds the current dimension values
         */
        dimensions : {},

        /**
         * Holds the current property values
         */
         
        expandProperties :  {
        	"width" : 0,
        	"height" : 0,
        	"useCustomClose" :  false,
            "lockOrientation" : false,
			"use-background" : false,
			"background-color" : "#FFFFFF",
			"background-opacity" : 1.0,
			"is-modal" : true},

		shakeProperties : {
			"interval" : "10",
			"intensity" : "20"
		},
		
		resizeProperties : { 
			"transition" : "none" 
		},
			
		state : ORMMA_STATE_DEFAULT,	
		lastState : ORMMA_STATE_DEFAULT,
			
		/**
		 * Use this method to subscribe a specific handler method to a specific
		 * event. In this way, multiple listeners can subscribe to a specific event, 
		 * and a single listener can handle multiple events. The events are:
		 *   
		 * <table>
		 *   <tr><td>ready</td><td>report initialize complete</td></tr>
		 *   <tr><td>network</td><td>report network connectivity changes</td></tr>
		 *   <tr><td>keyboard</td><td>report soft keyboard changes</td></tr>
		 *   <tr><td>orientation</td><td>report orientation changes</td></tr>
		 *   <tr><td>heading</td><td>report heading changes</td></tr>
		 *   <tr><td>location</td><td>report location changes</td></tr>
		 *   <tr><td>rotation</td><td>report rotation changes</td></tr>
		 *   <tr><td>shake</td><td>report device being shaken</td></tr>
		 *   <tr><td>state</td><td>report state changes</td></tr>
		 *   <tr><td>tilt</td><td>report tilt changes</td></tr>
		 * </table>
		 *
		 * <br/>#side effects: registering listeners for device features may power 
		 *                     up sensors in the device that will reduce the device
		 *                     battery life. 
		 * <br/>#ORMMA Level: 1 
		 *
		 * @param {String} event name of event to listen for
		 * @param {Function} listener function name / anonymous function to execute 
		 */
		addEventListener : function( evt, listener ) {
		
		    if (evt != ORMMA_EVENT_ERROR &&
		    	evt != ORMMA_EVENT_HEADING_CHANGE &&
		    	evt != ORMMA_EVENT_KEYBOARD_CHANGE &&
		    	evt != ORMMA_EVENT_LOCATION_CHANGE &&
		    	evt != ORMMA_EVENT_NETWORK_CHANGE &&
		    	evt != ORMMA_EVENT_ORIENTATION_CHANGE &&
		    	evt != ORMMA_EVENT_READY &&
		    	evt != ORMMA_EVENT_RESPONSE &&
		    	evt != ORMMA_EVENT_SCREEN_CHANGE &&
		    	evt != ORMMA_EVENT_SIZE_CHANGE &&
		    	evt != ORMMA_EVENT_STATE_CHANGE &&
		    	evt != ORMMA_EVENT_TILT_CHANGE &&
		    	evt != ORMMA_EVENT_ASSET_READY &&
		    	evt != ORMMA_EVENT_ASSET_REMOVED &&
		    	evt != ORMMA_EVENT_SHAKE &&
		    	evt != ORMMA_EVENT_VIEWABLE_CHANGE &&
		    	evt != ORMMA_EVENT_ASSET_RETIRED){
	        	ormma.fireError('addEventListener','Unknown event: '+evt);
	        }
	        
			ORMMAUtilityControllerBridge.eventAdded(evt);
			if (typeof listener == 'function') {
	            if (!this.events[evt]) {
	                this.events[evt] = [];
	            }
	            if (!this.events[evt].listeners) {
	                this.events[evt].listeners = [];
	            }
	            if (getListenerIndex(evt, listener) === -1) {
	                this.events[evt].listeners.splice(0, 0, listener);
	            }
	        }
	
			if (evt == ORMMA_EVENT_LOCATION_CHANGE){
	        	_startLocationListener();
	        }
	
			if (evt == ORMMA_EVENT_TILT_CHANGE){
	        	_startTiltListener();
	        }
	
			if (evt == ORMMA_EVENT_SHAKE){
	        	_startShakeListener();
	        }        
	
			if (evt == ORMMA_EVENT_ORIENTATION_CHANGE){
	        	_startOrientationListener();
	        }        

			if (evt == ORMMA_EVENT_SCREEN_CHANGE){
	        	_startOrientationListener();
	        }        

			if (evt == ORMMA_EVENT_NETWORK_CHANGE){
	        	_startNetworkListener();
	        }        
	
			if (evt == ORMMA_EVENT_HEADING_CHANGE){
	        	_startHeadingListener();
	        }        

			if (evt == ORMMA_EVENT_RESPONSE){
	        	_startNetworkListener();
	        }       
		},
		
		removeEventListener : function( evt, listener ) {		
			// notify the native API that the appropriate sensor should be 
			// brough on-line
			// now remove the actual listener
			
			ORMMAUtilityControllerBridge.eventRemoved(evt);
			
			if (evt == ORMMA_EVENT_LOCATION_CHANGE){
	        	_stopLocationListener();
	        }
	        
			if (evt == ORMMA_EVENT_TILT_CHANGE){
	        	_stopTiltListener();
	        }
	        
	        if (evt == ORMMA_EVENT_SHAKE){
	        	_stopShakeListener();
	        }  
	                      
			if (evt == ORMMA_EVENT_ORIENTATION_CHANGE){
	        	_stopOrientationListener();
	        }  

			if (evt == ORMMA_EVENT_SCREEN_CHANGE){
	        	_stopOrientationListener();
	        }  
	              
			if (evt == ORMMA_EVENT_NETWORK_CHANGE){
	        	_stopNetworkListener();
	        }      
	          
			if (evt == ORMMA_EVENT_HEADING_CHANGE){
	        	_stopHeadingListener();
	        }        

			if (evt == ORMMA_EVENT_RESPONSE){
	        	_stopNetworkListener();
	        }      
	
	        if (typeof listener == 'function' && this.events[evt] && this.events[evt].listeners) {
	            var listenerIndex = getListenerIndex(evt, listener);
	            if (listenerIndex !== -1) {
	                this.events[evt].listeners.splice(listenerIndex, 1);
	            }
	        }else
	        {
	       		ormma.fireError('removeEventListener','Listener not currently registered for event \''+evt+'\'');
	        }
		},

		expand : function (URL){
			//if(this.state == ORMMA_STATE_DEFAULT) {
			 	//if(URL==undefined)
				//{
				//	_resize(this.getExpandProperties().width,this.getExpandProperties().height);
				//}
				//else
				{
					_expand(URL, this.getExpandProperties());					
				}
				
				fireEvent(ORMMA_EVENT_STATE_CHANGE, ORMMA_STATE_EXPANDED);				
			//}else{
			//	ormma.fireError('expand','Can only expand from the default state');
			//}
		},

        /**
         * resize resizes the display window
         * @param {Object} dimensions The new dimension values of the window
         * @returns nothing
         */
        resize : function (width, height) {
        	//if(this.state == ORMMA_STATE_DEFAULT) {
	            _resize(width, height);
				fireEvent(ORMMA_EVENT_STATE_CHANGE, ORMMA_STATE_RESIZED);
            //}else
            //{
            //   ormma.fireError('resize','Cannot resize an ad that is not in the default state');
            //}
        },

        /**
         * reset the window size to the original state
         * @param {Function} listener The listener function
         * @returns nothing
         */
        close : function () {
			if(this.state == ORMMA_STATE_DEFAULT)
			{
				ormma.hide();
			} 
			else
			{
            	_close();
				fireEvent(ORMMA_EVENT_STATE_CHANGE, ORMMA_STATE_DEFAULT);
            }
        },

        open : function (URL, controls) {
            _open(URL, controls);
        },
        
        /**
         * Use this method to hide the web viewer.
         * @param none
         * @returns nothing
         */
		hide : function() {
			if(this.state == ORMMA_STATE_DEFAULT) {
				_hide();
				fireEvent(ORMMA_EVENT_STATE_CHANGE, ORMMA_STATE_HIDDEN);				
				fireEvent(ORMMA_EVENT_VIEWABLE_CHANGE, false);				
			}
		},

		show : function() {
			if(this.state == ORMMA_STATE_HIDDEN) {
				_show();
				fireEvent(ORMMA_EVENT_STATE_CHANGE, this.lastState);
				fireEvent(ORMMA_EVENT_VIEWABLE_CHANGE, true);
			}else
			{
				ormma.fireError('show','Ad is currently visible');
			}
		},
		
		getKeyboardState : function() {
			return _getKeyboardState();
		},
		
        /**
         * Use this method to get the current state of the web viewer. 
         * @param none
         * @returns boolean reflecting visible state
         */		
		getState : function() {
			return this.state;
		},
		
		setState : function(state) {
			this.state = state;
		},
		
		getHeading: function() {
			return _getHeading();
		},

		getLocation: function() {
			return _getLocation();
		},

		getNetwork: function() {
			return _getNetwork();
		},

		getTilt: function() {
			return _getTilt();
		},

		isViewable: function() {
			return _getViewable();
		},
		
		getViewable: function() {
			return _getViewable();
		},

		gotTiltChange: function(change){
			fireEvent(ORMMA_EVENT_TILT_CHANGE, change);
		},

		gotShake: function(change){
			fireEvent(ORMMA_EVENT_SHAKE, change);
		},

		gotOrientationChange: function(change){
			fireEvent(ORMMA_EVENT_ORIENTATION_CHANGE, change);
			fireEvent(ORMMA_EVENT_SCREEN_CHANGE, ormma.getScreenSize());
		},

		gotNetworkChange: function(change){
			fireEvent(ORMMA_EVENT_NETWORK_CHANGE, change);
		},

		gotResponse: function(uri, response){
			var data = { uri : uri,
					 response : decode64(response) };
			fireEvent(ORMMA_EVENT_RESPONSE, data);
		},

		getOrientation: function() {
			return _getOrientation();
		},

		getResizeDimensions: function() {
			return dimensions;
		},

		getScreenSize: function() {
			return _getScreenSize();
		},

		getSize: function() {
			return _getSize();
		},

		getDefaultPosition: function() {
			return _getDefaultPosition();
		},

		getShakeProperties: function() {
			return this.shakeProperties;
		},

		setShakeProperties: function(properties) {
			this.shakeProperties = properties;
		},

		getMaxSize: function() {
			return _getMaxSize();
		},

		locationChanged: function(loc){
			fireEvent(ORMMA_EVENT_LOCATION_CHANGE, loc);
		},
		
		gotHeadingChange: function(heading){
			fireEvent(ORMMA_EVENT_HEADING_CHANGE, heading);
		},

		supports: function(feature) {
			return _supports(feature);
		},

		getResizeProperties: function() {
			return this.resizeProperties;
		},

		setResizeProperties: function(properties) {
			this.resizeProperties = properties;
		},
		
		getExpandProperties: function() {
			return this.expandProperties;
		},

		setExpandProperties: function(properties) {
			this.expandProperties = properties;
		},
		
		ready: function(){
			fireEvent(ORMMA_EVENT_READY);
			if (window.ORMMAReady){ ORMMAReady();}			
		},
		
		fireError: function(action, message){
			var data = { message : message,
					 action : action };
			fireEvent(ORMMA_EVENT_ERROR, data);
		},
		
		sendSMS: function(recipient, body){
			_sendSMS(recipient, body);
		},
		
		sendMail: function(recipient, subject, body){
			_sendMail(recipient, subject, body);
		},
		
		makeCall: function(number){
			_makeCall(number);
		},
		
		createEvent: function(date, title, body){
			_createEvent(date, title, body);
		}, 
		
		addAsset: function(url, alias){
			_addAsset(url, alias);
		},

		addAssets: function(assets){
			_addAssets(assets);
		},
		
		addedAsset: function(alias){
			fireEvent(ORMMA_EVENT_ASSET_READY, alias);
		}, 
		
		getAssetURL: function(alias){
			return _getAssetURL(alias);
		},

		removeAsset: function(alias){
			_removeAsset(alias);
		},
		
		removeAllAssets: function(){
			_removeAllAssets();
		},
		
		assetRemoved: function(alias){
			fireEvent(ORMMA_EVENT_ASSET_REMOVED, alias);
		}, 
		
		getCacheRemaining: function(){
			return _getCacheRemaining();
		},
		
		assetRetired: function(alias){
			fireEvent(ORMMA_EVENT_ASSET_RETIRED, alias);
		}, 
		
		storePicture: function(url){
			_storePicture(url);
		}, 
		
		request: function(uri, display){
			_request(uri, display);
		},
		
		playVideo: function (URL, properties) {
			_playVideo(URL, properties);
		}, 
		
		playAudio: function (URL, properties) {
			_playAudio(URL, properties);
		}, 
		openMap: function (POI, fullscreen) {
			_openMap(POI, fullscreen);
		},
		getPlacementType: function(){
			return _getPlacementType();
		},
		getVersion: function(){
			return "1.1.0";
		},
		useCustomClose: function(flag)
		{
			_useCustomClose(flag);
		}, 
	    fireEvent: function(event, args) 
	    {
	    	fireEvent (event, args)
	    }
	};
    /**
     * The private methods
     */

    /**
     * getListenerIndex retrieves the index of listener from the event listener array
     * @private
     * @param {String} event The event name
     * @param {Function} listener The listener function
     * @returns the index value of the listener array, -1 if the listener doesn't exist
     */
    function getListenerIndex (event, listener) {
        var len, i;
        if (Ormma.events[event] && Ormma.events[event].listeners) {
            len = Ormma.events[event].listeners.length;
            for (i = len-1;i >= 0;i--) {
                if (Ormma.events[event].listeners[i] === listener) {
                    return i;
                }
            }
        }
        return -1;
    }
   
    /**
     * fireEvent fires an event
     * @private
     * @param {String} event The event name
     * @param {Object} additional information about the event
     * @returns nothing
     */
    function fireEvent (event, args) {
		//if (event == ORMMA_EVENT_STATE_CHANGE && args != ORMMA_STATE_EXPANDED) {
		if (event == ORMMA_EVENT_STATE_CHANGE ) {
			Ormma.lastState = Ormma.state;
			Ormma.state = args;
		}

        var len, i;
        if (Ormma.events[event] && Ormma.events[event].listeners) {
            len = Ormma.events[event].listeners.length;
            for (i = len-1; i >= 0; i--) {
            	if(event == ORMMA_EVENT_ERROR) {
                	(Ormma.events[event].listeners[i])(args.message, args.action);
            	} else if(event == ORMMA_EVENT_STATE_CHANGE) {
                	(Ormma.events[event].listeners[i])(args);
            	} else if(event == ORMMA_EVENT_VIEWABLE_CHANGE) {
                	(Ormma.events[event].listeners[i])(args);
                } else if(event == ORMMA_EVENT_SIZE_CHANGE) {
                	(Ormma.events[event].listeners[i])(args.dimensions.width, args.dimensions.height);
            	} else if(event == ORMMA_EVENT_HEADING_CHANGE) {
                	(Ormma.events[event].listeners[i])(args);
            	} else if(event == ORMMA_EVENT_TILT_CHANGE) {
                	(Ormma.events[event].listeners[i])(args.x, args.y, args.z);
            	} else if(event == ORMMA_EVENT_SHAKE) {
                	(Ormma.events[event].listeners[i])();
            	} else if(event == ORMMA_EVENT_ORIENTATION_CHANGE) {
                	(Ormma.events[event].listeners[i])(args);
            	} else if(event == ORMMA_EVENT_SCREEN_CHANGE) {
                	(Ormma.events[event].listeners[i])(args.width, args.height);
            	} else if(event == ORMMA_EVENT_LOCATION_CHANGE) {
                	(Ormma.events[event].listeners[i])(args.lat, args.lon, args.acc);
            	} else if(event == ORMMA_EVENT_NETWORK_CHANGE) {
                	(Ormma.events[event].listeners[i])(args.online, args.connection);
            	} else if(event == ORMMA_EVENT_ASSET_READY) {
                	(Ormma.events[event].listeners[i])(args);
            	} else if(event == ORMMA_EVENT_ASSET_REMOVED) {
                	(Ormma.events[event].listeners[i])(args);
            	} else if(event == ORMMA_EVENT_ASSET_RETIRED) {
                	(Ormma.events[event].listeners[i])(args);
            	} else if(event == ORMMA_EVENT_RESPONSE) {
                	(Ormma.events[event].listeners[i])(args.uri, args.response);
            	} else {
                	(Ormma.events[event].listeners[i])(event, args);
            	}
            }
        }
    }
   
    /* implementations of public methods for specific vendors */

	function _useCustomClose(flag)
	{
		ORMMADisplayControllerBridge.useCustomClose(flag);
	}

	function _getPlacementType()
	{
		return ORMMADisplayControllerBridge.getPlacementType();
	}

    function _expand( URL, properties) {
        ORMMADisplayControllerBridge.expand(URL, convertJsonToString(properties));
    }

    function _open(URL, controls) {
        ORMMADisplayControllerBridge.open(URL);
    }

	function _getViewable () {
        return ORMMADisplayControllerBridge.getViewable();
    }

    function _resize (width, height) {
        ORMMADisplayControllerBridge.resize(width, height);
    }

    function _close () {
        ORMMADisplayControllerBridge.close();
    }

	function _hide() {
		ORMMADisplayControllerBridge.hide();
	}

	function _show() {
		ORMMADisplayControllerBridge.show();
	}

	function _addAsset(url, alias) {
		ORMMAAssetsControllerBridge.addAsset(url, alias);
	}

	function _addAssets(assets) {
		ORMMAAssetsControllerBridge.addAssets(convertJsonToString(assets));
	}

	function _getAssetURL(alias) {
		return ORMMAAssetsControllerBridge.getAssetURL(alias);
	}

	function _removeAsset(alias) {
		ORMMAAssetsControllerBridge.removeAsset(alias);
	}

	function _removeAllAssets() {
		ORMMAAssetsControllerBridge.removeAllAssets();
	}

	function _getCacheRemaining() {
		return ORMMAAssetsControllerBridge.getCacheRemaining();
	}

	function _storePicture(url) {
		return ORMMAAssetsControllerBridge.storePicture(url);
	}

	function _request(uri, display) {
		ORMMANetworkControllerBridge.request(uri, display);
		return false;
	}

	function _getKeyboardState() {
		return ORMMAUtilityControllerBridge.getKeyboardState();
	}
	
	function _getHeading() {
		return ORMMASensorControllerBridge.getHeading();
	}

	function _getLocation() {
		return eval('('+ORMMALocationControllerBridge.getLocation()+')');
	}

	function _getNetwork() {
		return ORMMANetworkControllerBridge.getNetwork();
	}

	function _getTilt() {
		return eval('('+ORMMASensorControllerBridge.getTilt()+")");
	}

	function _getOrientation() {
		return ORMMADisplayControllerBridge.getOrientation();
	}
	
	function _startLocationListener(){
		ORMMALocationControllerBridge.startLocationListener();
	}

	function _stopLocationListener(){
		ORMMALocationControllerBridge.stopLocationListener();
	}

	function _startTiltListener(){
		ORMMASensorControllerBridge.startTiltListener();
	}

	function _stopTiltListener(){
		ORMMASensorControllerBridge.stopTiltListener();
	}
	
	function _startHeadingListener(){
		ORMMASensorControllerBridge.startHeadingListener();
	}

	function _stopHeadingListener(){
		ORMMASensorControllerBridge.stopHeadingListener();
	}

	function _startShakeListener(){
		ORMMASensorControllerBridge.startShakeListener();
	}

	function _stopShakeListener(){
		ORMMASensorControllerBridge.stopShakeListener();
	}

	function _startOrientationListener(){
		ORMMADisplayControllerBridge.startOrientationListener();
	}

	function _stopOrientationListener(){
		ORMMADisplayControllerBridge.stopOrientationListener();
	}

	function _startNetworkListener(){
		ORMMANetworkControllerBridge.startNetworkListener();
	}

	function _stopNetworkListener(){
		ORMMANetworkControllerBridge.stopNetworkListener();
	}

	function _getScreenSize() {
		return eval('('+ORMMADisplayControllerBridge.getScreenSize()+')');
	}
	
	function _getMaxSize(){
		return eval('('+ORMMADisplayControllerBridge.getMaxSize()+')');
	}

	function _getSize(){
		return eval('('+ORMMADisplayControllerBridge.getSize()+')');
	}

	function _getDefaultPosition(){
		return eval('('+ORMMADisplayControllerBridge.getDefaultPosition()+')');
	}

	function _supports(feature){
		return ORMMAUtilityControllerBridge.supports(feature);
	}

	function _sendSMS(recipient, body){
		ORMMAUtilityControllerBridge.sendSMS(recipient, body);
	}
		
	function _sendMail(recipient, subject, body){
		ORMMAUtilityControllerBridge.sendMail(recipient, subject, body);
	} 
		
	function _makeCall(number){
		ORMMAUtilityControllerBridge.makeCall(number);
	}
		
	function _createEvent(date, title, body){
		var msecs=date.getTime();
		ORMMAUtilityControllerBridge.createEvent(msecs.toString(), title, body);
	}

	function convertJsonToString(jsonData){
		var res = '{';
		
    	for(var key in jsonData) {
    		
    		if(res!='{'){res += ', ';}
    		res += '"' + key + '"';
    		res += ': ';
    		res += '"' + jsonData[key] + '"';    		
   		}   		
   		res += '}';
		return res;	
	}
	
 	
	function decode64(input) {
		var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 		}
 
		output = _utf8_decode(output);
 		return output;
	}	
   
	function _utf8_decode(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 		}
 
		return string;
	}
	
	function _playVideo(URL, properties) {
		var audioMuted = false, autoPlay = false, controls = false, loop = false, position = [-1, -1, -1, -1], startStyle = 'normal', stopStyle = 'normal';
		if ( properties != null ) {

			if ( ( typeof properties.audio != "undefined" ) && ( properties.audio != null ) ) {
				 audioMuted = true;
			 }
			 
			 if ( ( typeof properties.autoplay != "undefined" ) && ( properties.autoplay != null ) ) {
				 autoPlay = true;
			 }
			
			 if ( ( typeof properties.controls != "undefined" ) && ( properties.controls != null ) ) {
				controls = true;
			 }
			 
			 if ( ( typeof properties.loop != "undefined" ) && ( properties.loop != null ) ) {
				loop = true;
			 }
			 
			 if ( ( typeof properties.position != "undefined" ) && ( properties.position != null ) ) {
				 position = new Array(4);
				 
				 position[0] = properties.position.top;
				 position[1] = properties.position.left;
				 
				 if ( ( typeof properties.width != "undefined" ) && ( properties.width != null ) ) {
					 position[2] =  properties.width;
				 }
				 else{
					 //TODO ERROR
				 }
				 
				 if ( ( typeof properties.height != "undefined" ) && ( properties.height != null ) ) {
					 position[3] =  properties.height;
				 }
				 else{
					 //TODO ERROR
				 }
			 }
		   

			 if ( ( typeof properties.startStyle != "undefined" ) && ( properties.startStyle != null ) ) {
				 startStyle = properties.startStyle;
			 }
			
			 if ( ( typeof properties.stopStyle != "undefined" ) && ( properties.stopStyle != null ) ) {
				stopStyle = properties.stopStyle;
			 }  
			 
			if (loop) {
				stopStyle = 'normal';
				controls = true;
			}

			if (!autoPlay)
				controls = true;
					
			if (!controls) {
				stopStyle = 'exit';
			} 
			if(position[0]== -1 || position[1] == -1)   {
				startStyle = "fullscreen";
			} 
		 }    
		 
		 try{
			  ORMMADisplayControllerBridge.playVideo(URL, audioMuted, autoPlay, controls, loop, position, startStyle, stopStyle);
		   } 
		   catch ( e ) {
		}     
	}
	
	function _playAudio(URL, properties) {
		var autoPlay = false, controls = false, loop = false, position = false, startStyle = 'normal', stopStyle = 'normal';
	    if ( properties != null ) {
	    	if ( ( typeof properties.autoplay != "undefined" ) && ( properties.autoplay != null ) ) {
            	autoPlay = true;
        	}
       
        	if ( ( typeof properties.controls != "undefined" ) && ( properties.controls != null ) ) {
        		controls = true;
        	}
        
        	if ( ( typeof properties.loop != "undefined" ) && ( properties.loop != null ) ) {
        		loop = true;
        	}
        
	        if ( ( typeof properties.position != "undefined" ) && ( properties.position != null ) ) {
    	    	position = true;
        	}
        
        	if ( ( typeof properties.startStyle != "undefined" ) && ( properties.startStyle != null ) ) {
	             startStyle = properties.startStyle;
    	    }
        
        	if ( ( typeof properties.stopStyle != "undefined" ) && ( properties.stopStyle != null ) ) {
            	stopStyle = properties.stopStyle;
        	}  
        
        	if(startStyle =='normal') {
        		position = true;
        	}
        
	 	/*	 if(position) {
    	   		autoPlay = true;
       			controls = false;
       			loop = false;
       			stopStyle = 'exit';
       		}
		*/
       		if(loop) {
           		stopStyle = 'normal'; 
           		controls = true;
        	}
        
        	if(!autoPlay) {
        		controls = true;
        	}
               	
       		if (!controls) {
				stopStyle = 'exit';
       		}
		}
		
	    try{
  	    	ORMMADisplayControllerBridge.playAudio(URL, autoPlay, controls, loop, position, startStyle, stopStyle);
	    } catch ( e ) {
	    }     
	}
	
	function _openMap (POI, fullscreen) {
		try{
			ORMMADisplayControllerBridge.openMap(POI, fullscreen);
		} catch (e) {
		}
	}
	
})();
window.ormma=window.Ormma;
window.mraid=window.Ormma;
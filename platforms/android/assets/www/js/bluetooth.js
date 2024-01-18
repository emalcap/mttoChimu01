/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var macAddress = "30:14:10:17:05:86";
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        
		 var element = document.getElementById('deviceProperties');   
         element.innerHTML =     'Nombre Equipo: '     + device.model     + '<br />' + 
                                //'Plataforma: ' + device.platform + '<br />' + 
                                'UUID: <span id="iduuid">'     + device.uuid     + '</span><br />' + 
								//'UUID: <span id="iduuid">b0a0316799dc4c09</span><br />'  
                                //'Version Equipo: '  + device.version  + '<br />' +	
								'Version Sistema: 1.2.0 <br />' ;
								
    },
   	
	connect: function() {
		
		statusDiv.innerHTML="Conectandose a " + macAddress + " .......";
		listaDisp.innerHTML="";
		
		
		//Coneccion a la balanza
		bluetoothSerial.isEnabled(function(enabled) {
           if (enabled)
		          bluetoothSerial.connect(macAddress, app.onConnect, app.onDisconnect);
        }, app.onFailure); 
		
        //bluetoothSerial.connect(macAddress, app.onConnect, app.onDisconnect);
    },
	
    disconnect: function() {
		statusDiv.innerHTML="Desconectandose de " + macAddress + " ......";
		listaDisp.innerHTML="";
        bluetoothSerial.disconnect(app.onDisconnect, app.onFailure);
    },
	
    showDeviceList: function() { 	  
	  if ( listaDisp.innerHTML != "" || listaDisp.innerHTML == null) {listaDisp.innerHTML=""; return }	  
      bluetoothSerial.isEnabled(
		function(){
			bluetoothSerial.list(
			  function( devices ){
				var s = "Lista de Dispositivos (macAddress) :<BR/>";
				for( var i = 0; i < devices.length; i++ ){
				  s += (i+1) + ". " + devices[i].name + ": " + devices[i].address + "<BR/>";
				}
				//alert(s);
				listaDisp.innerHTML = s;
			});
			},
			function(){
				navigator.notification.alert("Bluetooth Desactivado. Active el Bluetooth para continuar",null, 'Aviso');
			});
			return true; 
    },
    isBluetooth: function() {
        bluetoothSerial.isEnabled(function(enabled) {
            navigator.notification.alert(enabled,null, 'Aviso');  
			statusDiv.innerHTML="BlueTooth Activado"          
        }, app.onFailure); 
    },
    
    onConnect: function() {
        bluetoothSerial.subscribe("\n", app.onMessage, app.subscribeFailed);
        statusDiv.innerHTML="Conectado a " + macAddress + ".";  		  
    }, 
	
    onDisconnect: function() {
        statusDiv.innerHTML="Desconectado.";
		datosRecp.innerHTML ="...";

    },
	
    onFailure: function() {
        navigator.notification.alert("Bluetooth Desactivado. Active el Bluetooth",null, 'Aviso');
		statusDiv.innerHTML="Desconectado... "
    },
	
    onMessage: function(data) {
        datosRecp.innerHTML = data;        
    },
	
    subscribeFailed: function() {
        navigator.notification.alert("Error al recibir datos...",null, 'Aviso');
    },
	
    sendCommand: function( data ){
     bluetoothSerial.isEnabled(
          function(){
            bluetoothSerial.write( data );
          },
          function(){
            navigator.notification.alert("Bluetooth Desactivado. Active el Bluetooth",null, 'Aviso');
			statusDiv.innerHTML="Desconectado... "
        });

        return true;
    }

    
};

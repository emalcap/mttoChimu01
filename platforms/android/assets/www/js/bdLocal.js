function AbrirBDLocal()
{
	var shortName = 'webSFInventario';
	var version = '1.0';
	var displayName = 'webSFInventario';
	var maxSize = 65535;

	 if (!window.openDatabase) {
	   navigator.notification.alert("Su equipo no soporta SQLite.", null, 'Aviso');
	   return;
	 }
	
	db = openDatabase(shortName, version, displayName,maxSize);
	CreaDB();
}

function CreaDB() {
    db.transaction(CreaTablas, errorCB, successCB);
}

function CreaTablas(tx) {
     
	 //tx.executeSql('DROP TABLE DESPACHO') ; 
	 /*tx.executeSql('DROP TABLE INVENTARIO') ; 
	 tx.executeSql('DROP TABLE INVENTARIO_DET') ;
	 /*tx.executeSql('DROP TABLE MATERIAL') ; */
	 
	 //tx.executeSql('CREATE TABLE IF NOT EXISTS CONFIGURACION(CENTRO TEXT NOT NULL,ALMACEN TEXT NOT NULL, CAMARA TEXT NOT NULL)') ;	
	 //tx.executeSql('CREATE TABLE IF NOT EXISTS INVENTARIO(NRO TEXT NOT NULL PRIMARY KEY,IDALMACEN INTEGER ,IDCENTRO INTEGER ,IDCAMARA INTEGER ,ESTADO TEXT ,FECHA TEXT, FCIERRE TEXT,SUSUARIO TEXT)') ; 
	 //tx.executeSql('CREATE TABLE IF NOT EXISTS INVENTARIO_DET(NRO TEXT NOT NULL,IDITEM INTEGER NOT NULL,IDCAMARA INTEGER ,LOTE TEXT ,CODIGO TEXT ,UBICACION TEXT, POSICION TEXT, CANTIDAD DECIMAL(10,3),UNIDADES DECIMAL(10,3), ESTADO TEXT,FECHA TEXT,FVENCE TEXT,UNIDAD TEXT,SUSUARIO TEXT,ESVACIO TEXT)') ; 
	 //tx.executeSql('CREATE TABLE IF NOT EXISTS MATERIAL (CODIGO TEXT NOT NULL,DESCRIPCION TEXT,LOTE TEXT,FCADUCA  TEXT )') ; 
	 //tx.executeSql('CREATE TABLE IF NOT EXISTS MATERIAL_LOTE (CODIGO TEXT NOT NULL,LOTE TEXT,FCADUCA TEXT  )') ; 
	 //tx.executeSql('CREATE TABLE IF NOT EXISTS DESPACHO (CODIGO TEXT NOT NULL,OPCION TEXT,CAMARA TEXT,FECHA TEXT  )') ; 
	 //tx.executeSql('CREATE TABLE IF NOT EXISTS MAESTROS(TABLA TEXT NOT NULL,CODIGO TEXT NOT NULL, DESCRIPCION TEXT NOT NULL,CAMPO TEXT ,DESCAMPO TEXT )') ;	
	 
}
 
	 
	 
 
function errorCB(err) {	
     console.log(err)
     //navigator.notification.alert("Error processing SQL: Codigo: " + err.code + " Mensaje: "+err.message, null, 'Aviso');
	 $("#cargando").hide();
}
 
function successCB() {
	//Despues de crear la BD intenta ingresar al menu inicio.
	Inicio();
	return true
}



function RegistrarMaestras(items)
{
	
	var url =getIPorHOSTApi()
	var prefijo = getLocalStorage("centro")
	
	//$("#cargando").show();	

	/*db.transaction(	function (tx){tx.executeSql('DELETE FROM MAESTROS ',[]);}, errorCB, 
		function (){
			 $.each(items, function(indice, lista) {			
				   db.transaction(	function (tx){
						if (!(lista.Material=="" || lista.Material=="null"))
							tx.executeSql('INSERT INTO MAESTROS(TABLA ,CODIGO ,DESCRIPCION ,CAMPO ,DESCAMPO) VALUES (?,?,?,?,?)',
							[lista.Tabla,lista.Codigo,lista.Descripcion,lista.Campo,lista.DesCampo]);				
					}, errorCB, 
					 function (){											
					})												
			 });	
			 $("#cargando").hide();
	})*/
}



function UltimoInventarioLocal()
{
	window.localStorage.setItem("documento", "");
	db.transaction( function (tx){		
				tx.executeSql("SELECT * FROM INVENTARIO ORDER BY NRO DESC ", [], 
				function (tx2, results){	
				    
				    if (results != null && results.rows != null && results.rows.length > 0) {	
					   var row = results.rows.item(0);						   
					   window.localStorage.setItem("ultDocumento", row.NRO);
					   if (row.ESTADO == "C" || row.ESTADO == "A" || row.ESTADO =="T")
					   {   window.localStorage.setItem("documento", row.NRO);		
					       window.localStorage.setItem("almacen", row.IDALMACEN);
						   window.localStorage.setItem("centro", row.IDCENTRO);
						   window.localStorage.setItem("camara", row.IDCAMARA);		
					   }
					}										
		    },errorCB)
	})
}

function configurar()
{
	var centro = getLocalStorage("centro");
	var url =  getLocalStorage("url");
	$("#conURL").val(url)		
	$.mobile.changePage('#pagConfigurar')	
	
}

function PendientesSinc()
{
	var documento = getLocalStorage("documento");
	db.transaction( function (tx){		
			tx.executeSql("SELECT count(*) TOTAL FROM INVENTARIO_DET WHERE NRO =? AND ESTADO ='R' ", [documento], 
			function (tx2, results){	
				if (results != null && results.rows != null && results.rows.length > 0) {							   
				   var row = results.rows.item(0);	
				   $("#actPenSAP").html("Pendientes en enviar a SAP: " + row.TOTAL );
				}
			}
		 ,errorCB)
			
	},
	errorCB);	
}

function Inicializar()
{
	$("#cargando").show();
	var camara = getLocalStorage("camara")
	var almacen = getLocalStorage("almacen")
	var centro = getLocalStorage("centro")	
	var now=new Date();
	var fecha = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,19)	
	var url =getIPorHOSTApi()
	var prefijo = getLocalStorage("preLote")
	db.transaction( function (tx){		
			tx.executeSql("SELECT * FROM INVENTARIO ORDER BY NRO DESC ", [], 
			function (tx2, results){	
				
				if (results != null && results.rows != null && results.rows.length > 0) {							   
				   var row = results.rows.item(0);	
				   var estado = row.ESTADO =="C" ? "Creado" : (row.ESTADO =="A" ? "Reaperturado" : (row.ESTADO =="T" ? "Fin Tablet" : "Cerrado" )  )
				   if ( row.ESTADO =="C" || row.ESTADO =="A" || row.ESTADO =="T")		
				   {			   						
				   		$.mobile.changePage('#pIniciado')	
						$("#titInventarioInicio").html("Centro/Amacén/Cámara: "+centro+"/"+almacen+"/"+camara)
						$("#actAper").html("Apertura: " + row.FECHA );
						$("#actNro").html("Documento Inventario N°: " + row.NRO );
						$("#actEstado").html("Estado: " + estado );
						window.localStorage.setItem("documento", row.NRO);
						PendientesSinc()
				   }
					else						
					{	$.mobile.changePage('#pInicializar')
					    $("#iniUInv").html("<ins>Ultimo Inventario</ins> <br/> Centro/Amacén/Cámara: "+row.IDCENTRO+"/"+row.IDALMACEN+"/"+row.IDCAMARA)
						$("#iniUFecha").html("Fecha Cierre: " + row.FCIERRE );
						$("#iniUDoc").html("Documento Inventario N°: " + row.NRO );
						$("#iniUEst").html("Estado: "+estado );
						$("#iniCentro").val(centro)
						$("#iniAlmacen").val(almacen)
						$("#iniCamara").val(camara)
						window.localStorage.setItem("documento","");									
				   }
				}
				else
				{
					$.mobile.changePage('#pInicializar')	
					$("#iniUFecha").html("Fecha Cierre: 0000-00-00" );
					$("#iniUDoc").html("Documento Inventario N°: 00000000" );
					$("#iniUEst").html("Estado: Sin Aperturar" );
					$("#iniCamara").val( (camara==0 ?"":camara) )
					$("#iniAlmacen").val( (almacen ==0 ? "" : almacen) )
					$("#iniCentro").val( ( centro==0 ? "" : centro)	)
				}
				$("#cargando").hide();
				$("#iniURL").val(url)		
				$("#iniPreLote").val(prefijo)
		}
		 ,errorCB)
			
	},
	errorCB);		
	
}

function VerItemInventario ()
{
		db.transaction( function (tx){		
				tx.executeSql("SELECT * FROM MATERIAL ", [], 
				function (tx2, results){	
				   alert(results.rows.length)
		    	}
			 	,errorCB)
        		
			},
			errorCB);			
}

function BuscarUbicacion(ubicacion,nivel)
{
	$("#regAFecha").attr("readonly", true);
	$("#regFecha").attr("readonly", true);
	$("#regAFecha").closest('div').removeClass('ui-body-d');
	$("#regAFecha").closest('div').addClass('ui-body-b');
	$("#regFecha").closest('div').removeClass('ui-body-b');
	$("#regFecha").closest('div').addClass('ui-body-d');
	
	var ubicacion = ubicacion.toUpperCase()
	var documento = getLocalStorage("documento");
	var sql = "SELECT DT.IDITEM, DT.POSICION, DT.CODIGO,MA.DESCRIPCION, IFNULL(DT.FVENCE,MA.FCADUCA) FECHA, IFNULL(DT.LOTE,MA.LOTE) LOTE ,DT.CANTIDAD ,DT.UNIDADES, ESVACIO  FROM  INVENTARIO_DET DT LEFT OUTER JOIN MATERIAL MA ON DT.CODIGO = MA.CODIGO   WHERE DT.NRO = ? AND DT.UBICACION =? "

	if ( nivel =="N1"){
		if( ubicacion.indexOf("A") < 0)
		{
			navigator.notification.alert("Solo debe ingresar ubicación del primer nivel(A) ", null, 'Aviso');
			$("#regAUbicacion").val("")
			return
		}
		var material = $("#regAProducto").val()
		sql = sql + (material==null || material== "" ? "" : " AND DT.CODIGO ='"+ material +"'")
		$("#regAUbicacion").val(ubicacion)
	
	}else
	{
		if( ubicacion.indexOf("A")>=0)
		{
			navigator.notification.alert("No puede ingresar ubicación del primer nivel(A) ", null, 'Aviso');
			$("#regUbicacion").val("")
			return
		}	 
		$("#regUbicacion").val(ubicacion)
	}

	//Busca los datos
	$("#cargando").show();
	db.transaction( function (tx){		
				tx.executeSql(sql, [documento,ubicacion], 
				function (tx, results){	
				   if (results.rows.length > 0)
				   {  
				   		var row = results.rows.item(0);
						$("#regItem").val(row.IDITEM)
						$("#regPos").val(row.POSICION)
						if (nivel=="N1")
						{
							$("#regItem").val(-1)							
							/*if ( !( $("#regAProducto").val()==""|| $("#regAProducto").val() == null) )
							{
								$("#regAProducto").val(row.CODIGO)
								$("#regADesc").val(row.DESCRIPCION)
								$("#regAFecha").val(row.FECHA)
								$("#regALote").val(row.LOTE)
								$("#regACantidad").val(row.CANTIDAD)	
							}*/
						}
						else {						
							$("#regProducto").val(row.CODIGO)
							$("#regDesc").val(row.DESCRIPCION)
							$("#regFecha").val(row.FECHA)
							$("#regLote").val(row.LOTE)
							$("#regCantidad").val(row.CANTIDAD)			
							$("#regAFecha").closest('div').removeClass('ui-body-d');
							$("#regAFecha").closest('div').addClass('ui-body-b');
							$("#regFecha").closest('div').removeClass('ui-body-d');
							$("#regFecha").closest('div').addClass('ui-body-b');	
							$('#regVacio').attr('checked',false).checkboxradio('refresh');
							if (row.ESVACIO=="S")
								$('#regVacio').attr('checked',true).checkboxradio('refresh');
						}
								   
				   }else
				   {
					   if (nivel=="N1" && !( $("#regAProducto").val()==""|| $("#regAProducto").val() == null))
					    {   
							BuscarProducto($("#regAProducto").val(),nivel)
						}
						else
					   {
					    navigator.notification.alert("No existe ubicación la cámara", null, 'Aviso');	
						$("#regUbicacion").val("")
						$("#regAUbicacion").val("")	
						$("#regPos").val("")
					   	LimpiarFormulario(nivel)
						$("#regItem").val(-1)
					   }
					}
					$("#cargando").hide();
		    	}
			 	,errorCB)
        		
			},
			errorCB);		
				
}

function BuscarProducto(codigo,nivel,lote)
{
	//$("#regItem").val("")
	$("#regLote").val("")
	$("#regALote").val("")
	$("#regFecha").val("")
	$("#regAFecha").val("")
	$("#regAFecha").attr("readonly", true);
	$("#regFecha").attr("readonly", true);
	$("#regAFecha").closest('div').removeClass('ui-body-d');
	$("#regAFecha").closest('div').addClass('ui-body-b');
	$("#regFecha").closest('div').removeClass('ui-body-b');
	$("#regFecha").closest('div').addClass('ui-body-d');
							
	if (codigo == "" || codigo == null) 
	{ 
		if (!(lote == null || lote == ""))
		   navigator.notification.alert("Primero registra código del material", null, 'Aviso');
		return
	}
	
	var sql ="SELECT CODIGO,DESCRIPCION, FCADUCA FECHA, LOTE FROM  MATERIAL WHERE CODIGO = ? "
	if (!(lote == null || lote == ""))  
	{	prefijo=getLocalStorage("preLote");
	    if (prefijo!=null && prefijo.length > 0)
		{	 if (lote.substr(0, prefijo.length) != prefijo )
			  lote = prefijo+lote 
		}
	    sql = sql +" AND LOTE ='" + lote +"'"
	}
	
	db.transaction( function (tx){		
				tx.executeSql(sql, [codigo], 
				function (tx, results){	
				   if (results.rows.length > 0)
				   { 	var row = results.rows.item(0);
					    $("#regProducto").val(row.CODIGO)
						$("#regDesc").val(row.DESCRIPCION)
						$("#regCantidad").val("")		
						
						$("#regAProducto").val(row.CODIGO)
						$("#regADesc").val(row.DESCRIPCION)
						$("#regACantidad").val("")		
					
						if (!(lote == null || lote == "")){
							$("#regAFecha").val(row.FECHA)
							$("#regALote").val(row.LOTE)
							$("#regFecha").val(row.FECHA)
							$("#regLote").val(row.LOTE)
							$("#regAFecha").closest('div').removeClass('ui-body-d');
							$("#regAFecha").closest('div').addClass('ui-body-b');
							$("#regFecha").closest('div').removeClass('ui-body-d');
							$("#regFecha").closest('div').addClass('ui-body-b');
						}
										   
				   }else
				   {
					   if (lote == null || lote == "")
					   {    
					   	  navigator.notification.alert("Material no encontrado", null, 'Aviso');					    
						  LimpiarFormulario(nivel)
					   }else
					   	{	navigator.notification.alert("Lote no encontrado para el producto indicado.... ", null, 'Aviso');	
							$("#regLote").val(lote)
							$("#regALote").val(lote)
							$("#regAFecha").attr("readonly", false);
							$("#regFecha").attr("readonly", false);
							$("#regAFecha").closest('div').removeClass('ui-body-b');
							$("#regAFecha").closest('div').addClass('ui-body-d');
							$("#regFecha").closest('div').removeClass('ui-body-b');
							$("#regFecha").closest('div').addClass('ui-body-d');
							
						}
					   
					}
		    	}
			 	,errorCB)
        		
			},
			errorCB);	
}


function RegistrarUltInventario( inventario)
{
	var documento = inventario.NroInventario
	var almacen = inventario.Almacen
	var centro = inventario.Centro
	var camara = inventario.Camara
	var estado = inventario.Estado
	var fecha = inventario.FIni
	var susuario = inventario.Usuario
		
	var url =getIPorHOSTApi()
	var prefijo = getLocalStorage("preLote")
	
	$("#cargando").show();	
	db.transaction(	function (tx){tx.executeSql('DELETE FROM INVENTARIO_DET ',[]);}, errorCB, 
		function (){
			
		db.transaction(	function (tx){tx.executeSql('DELETE FROM INVENTARIO ',[]);}, errorCB, 
		function (){
	
			db.transaction(	 function (tx){ tx.executeSql('INSERT INTO INVENTARIO(NRO ,IDALMACEN ,IDCENTRO ,IDCAMARA ,ESTADO ,FECHA ,SUSUARIO) VALUES (?,?,?,?,?,?,?)',[documento,almacen,centro,camara,estado,fecha,susuario]);},  errorCB, 
				function (){			 
						 var items = inventario.Item
						 $.each(items, function(indice, lista) {			
							   db.transaction(	function (tx){
								   //if (lista.Ubicacion=="1B1" ) alert(lista.Cantidad)
								    //Ubicacion A todos son registrados como nuevos
									var estado = "E"
									if (!(lista.Material=="" || lista.Material=="null"))
								    	estado = lista.Ubicacion.indexOf("A")>0 ? "R" : "E" 
										tx.executeSql('INSERT INTO INVENTARIO_DET(NRO,IDITEM,IDCAMARA,LOTE,CODIGO,POSICION ,UBICACION, UNIDAD,CANTIDAD ,UNIDADES,ESTADO, SUSUARIO) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
										[documento,indice,lista.Camara,lista.Lote,lista.Material,lista.Posicion,lista.Ubicacion,lista.Undidad,lista.Cantidad,lista.Unidades,estado,lista.Usuario]);				
								}, errorCB, 
								 function (){											
								})									
						 });	
						
						 var destado= (estado=='C' ? 'Creado' : (estado=='A' ? 'Reaperturado' : (estado =="T" ? "Fin Tablet" : "Cerrado" ) ))
						 $("#actAper").html("Apertura: " + fecha );
						 $("#actPenSAP").html("Pendientes en enviar a SAP: " + "0" );
						 $("#actNro").html("Documento Inventario N°: " + documento );
						 $("#actEstado").html("Estado: " + destado );
						 $("#actSinSAP").html("Ultima sincronizacion con SAP: " + "2017-06-27 10:30 pm");
							
						 $("#titPopUp").html("Inventario Inicializado")
						 $("#msgPopUp").html("Inventario inicializado con éxito con documento de inventario nro " + documento)
						 $("#btnAceptar").unbind( "click" );
						 $("#btnAceptar").click(function() {  $.mobile.changePage('#pIniciado') })		
						 $("#btnPopUpCerrar").hide()	
						 $("#btnPopup").click();
						 
						 $("#titInventarioInicio").html("Centro/Amacén/Cámara: "+centro+"/"+almacen+"/"+camara)							 
						 window.localStorage.setItem("almacen", almacen);
						 window.localStorage.setItem("centro", centro);
						 window.localStorage.setItem("camara", camara);
						 window.localStorage.setItem("documento", documento);	
						 $("#cargando").hide();
						 
						 $("#iniURL").val(url)		
						$("#iniPreLote").val(prefijo)
				
			}) 
		})
	})
}

function EliminarUbicacion(iditem,producto)
{
	var documento=getLocalStorage("documento");
	var ubicacion = $("#tabUbicacion").val()
	navigator.notification.confirm(
	'¿Realmente quiere elminar el registro del item "'+ iditem +' producto: ' +producto+'" ?', 
	 function(buttonIndex){
		 if(buttonIndex==1){
			$("#cargando").show()	
			 db.transaction(function (tx){
								tx.executeSql("DELETE FROM INVENTARIO_DET WHERE NRO=? AND UBICACION= ? and IDITEM =?",[documento,ubicacion,iditem]);				
							}, errorCB, 
							 function (){
								$("#cargando").hide()	
								ListaUbicacionA(ubicacion)
								})					
		 }
	 }, 'Aviso',      
        'Si,No' )
			 
}

function RegistrarInvDetalle( nivel,estado, ubicacion,material,lote,fvence,cantidad,unidades)
{
	var documento=getLocalStorage("documento");
	var camara=getLocalStorage("camara");
	
	var usuario=getLocalStorage("susuario");
	var regItem = $("#regItem").val()
	var posicion = $("#regPos").val()
	var now=new Date();
	var fecha = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,19)	
	
	
	$("#cargando").hide()	
	//if (nivel=="N1" && $("#regAVacio").is(":checked") )
	if ( (nivel=="N1" && $("#regAVacio").is(":checked") ) || (nivel!="N1" && $("#regVacio").is(":checked") )  ) 
	{   //Limpia la ubicacion	    
			db.transaction(	function (tx){
				tx.executeSql("DELETE FROM INVENTARIO_DET WHERE NRO=? AND UBICACION =? ",[documento,ubicacion]);				
				 }, errorCB, 
			 function (){	
			 		 db.transaction(function (tx){
									tx.executeSql("INSERT INTO INVENTARIO_DET (NRO,IDITEM,IDCAMARA,UBICACION,POSICION,FECHA,FVENCE,ESTADO,ESVACIO) VALUES (?,?,?,?,?,?,?,?,?)",[documento,1,camara,ubicacion,posicion,fecha,fvence,estado,'S']);				
								}, errorCB,  function (){})	
								
			 		navigator.notification.alert("Registro guardado correctamente", null, 'Aviso');		
					$("#regUbicacion").val("")
					//$("#regAUbicacion").val("")
					//$("#regItem").val(-1)
					LimpiarFormulario(nivel)								
			})	
	}
	else if ( regItem !="" && regItem >= 0  )
	{	  //actualiza ubicacion
		    var esvacio =$("#regVacio").is(":checked") ? "S" : "N"
		    db.transaction(	function (tx){
				
				tx.executeSql('UPDATE INVENTARIO_DET SET  LOTE = ?,CODIGO = ?,CANTIDAD=?, UNIDADES=?,SUSUARIO=? , ESTADO= ?, FECHA=?, FVENCE =?, ESVACIO=? WHERE NRO=? AND IDITEM =? AND UBICACION=? ',
					[lote,material,cantidad,unidades,usuario,estado,fecha,fvence,esvacio,documento,regItem,ubicacion]);				
				 }, errorCB, 
			 function (){	
			 		navigator.notification.alert("Registro guardado correctamente", null, 'Aviso');		
					$("#regUbicacion").val("")
					//$("#regAUbicacion").val("")
					//$("#regItem").val(-1)
					LimpiarFormulario(nivel)								
			})									
	}else
	{	
		    var sql = ""
			var total=0
			var esvacio = "N"
			var estado=""
			var pos = 0  //Busca el orden de la posicion de la ubicacion
			db.transaction(	function (tx){			
				//Busca el maximo item para registrar otro producto en la misma ubicacion	
				sql = 'SELECT MAX(IFNULL(IDITEM,0)) IDITEM, COUNT(1) TOTAL ,MAX(ESTADO) ESTADO , MAX(POSICION) POSICION ,MAX(ESVACIO) ESVACIO FROM INVENTARIO_DET WHERE NRO=? AND UBICACION=? '
				tx.executeSql(sql ,[documento,ubicacion],
				function (tx, results){	
				    if (results.rows.length >0 )
					{
						regItem=  results.rows.item(0).IDITEM
						total = results.rows.item(0).TOTAL
						estado = results.rows.item(0).ESTADO	
						pos = results.rows.item(0).POSICION
						esvacio = results.rows.item(0).ESVACIO
					}
				 }
			 	,errorCB);	
							
			}, errorCB, 
			 function (){	
			 	if (total==1 && (estado =="E" || esvacio=="S")) //Si es un solo registro de inicio
				{
				  estado='R' //Cambiamos de estado
				  sql =	'UPDATE INVENTARIO_DET SET  IDCAMARA=?,LOTE = ?,CODIGO = ?,POSICION=?,UBICACION =?,ESTADO= ?,UNIDAD=?,CANTIDAD=?, UNIDADES=?,FECHA=?, FVENCE =?, ESVACIO=?,SUSUARIO=? WHERE NRO=? AND IDITEM =? AND UBICACION=? '				  
				}
				else
				{
					regItem ++					
					sql ='INSERT INTO INVENTARIO_DET(IDCAMARA,LOTE,CODIGO,POSICION ,UBICACION, ESTADO, UNIDAD,CANTIDAD,UNIDADES,FECHA,FVENCE,ESVACIO,SUSUARIO,NRO,IDITEM,UBICACION) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'				
				}
				
				  db.transaction(	function (tx){
						tx.executeSql(sql,
						[camara,lote,material,pos,ubicacion,estado,null,cantidad,unidades,fecha,fvence,'N',usuario,documento,regItem,ubicacion]);				
					
					}, errorCB, 
					 function (){
						 navigator.notification.alert("Registro guardado correctamente", null, 'Aviso');		
						 //$("#regAUbicacion").val("")
						 $("#regUbicacion").val("")
						 //$("#regItem").val(-1)
						 LimpiarFormulario(nivel)	
					})
					
			 })
	}
	
}

function RegistrarMateriales(materiales)
{
	var i = 1;	
	db.transaction(	function (tx){ tx.executeSql('DELETE  FROM MATERIAL ',[]);},  errorCB, 
	function (){
		$.each(materiales, function(indice, lista) {			
			$("#cargando").show();
			db.transaction(	function (tx){
					tx.executeSql('INSERT INTO  MATERIAL (CODIGO,DESCRIPCION,LOTE,FCADUCA ) VALUES (?,?,?,?)',[lista.Codigo,lista.Descripcion, lista.Lote,lista.FechaCaduca]);				
				 }, errorCB, 
				 function (){
					 if(i>=materiales.length){
						$("#cargando").hide();	
						 $("#titPopUp").html("Carga de Materiales")
						 $("#msgPopUp").html("Se han sincronizado  " + i +" materiales desde el servidor WEB")
						 $("#btnpoupAceptar").unbind( "click" );
						 $("#btnpoupAceptar").click(function() {  $.mobile.changePage('#pIniciado') })		
						 $("#btnPopUpCerrar").hide()	
						 $("#btnPopup").click();							
					 }
					 i++;
				})	
			});	
	})
}

function ActualizaLotes(lotes)
{
	var i = 1;	
	db.transaction(	function (tx){ tx.executeSql('DELETE  FROM MATERIAL_LOTE ',[]);},  errorCB, 
	function (){
		$.each(lotes, function(indice, lista) {			
			$("#cargando").show();
			db.transaction(	function (tx){
							tx.executeSql('INSERT INTO  MATERIAL_LOTE (CODIGO,LOTE,FCADUCA) VALUES (?,?,?)',[lista.Codigo,lista.Lote,lista.FechaCaduca]);				
						}, errorCB, 
						 function (){
							 if(i>=lotes.length){
								$("#cargando").hide();	
								 $("#titPopUp").html("Carga de Lotes")
								 $("#msgPopUp").html("Se han sincronizado  " + i +" Lotes desde el servidor WEB")
								 $("#btnpoupAceptar").unbind( "click" );
								 $("#btnpoupAceptar").click(function() {  $.mobile.changePage('#pIniciado') })		
								 $("#btnPopUpCerrar").hide()	
								 $("#btnPopup").click();							
							 }
							 i++;
						})	
			});	
	})
}
 
function RegistroLocal(){
	var documento = getLocalStorage("documento");
	if (documento=="" ||documento=="0"){
		navigator.notification.alert("NO hay documento de inventario que cerrar!!")
		return	
	}
	$.mobile.changePage('#pListaRegistroLocal')
	$("#cargando").show();	
	var documento = getLocalStorage("documento");
	db.transaction( function (tx){		
				tx.executeSql("SELECT DT.UBICACION,DT.IDITEM, DT.CODIGO,DT.ESVACIO,DT.LOTE,DT.CANTIDAD,DT.FECHA,(SELECT DISTINCT(DESCRIPCION)  FROM MATERIAL MA WHERE MA.CODIGO=DT.CODIGO) DESCRIPCION "+ 
							  "FROM INVENTARIO_DET DT WHERE DT.NRO=? AND (DT.CODIGO IS NOT NULL or DT.ESVACIO='S')  AND ESTADO ='R' AND UBICACION NOT LIKE '%A%' "+
							  "ORDER BY 1", [documento], ListaMateriales, errorCB);			
						 }, 
						 errorCB);		

}


function ListaMateriales(tx, results)
{
	
	var html = "";
	var btnNuevo ="";
	var btnNuevaInt ="";
	var existe = false;
	var onclick ="";
	
	$("#tabMateriales").html("");
	html = html + '<tr class="tabla_tiulo"><td style="text-align:center">N°</td>';
	html = html + '<td style="text-align:center" >Ubicación</td>';
	html = html + '<td style="text-align:center" >Mat.</td>';
	html = html + '<td style="text-align:center" >Descripción Material</td>';
	html = html + '<td style="text-align:center" >Lote</td>';
	//html = html + '<td style="text-align:center" >Fecha</td>';
	html = html + '<td style="text-align:center" >Cantidad</td></tr>';

	//Busca Datos	
	if (results != null && results.rows != null) {		
		for (var i = 0; i < results.rows.length; i++) {
		 	var row = results.rows.item(i);		 
		 	if ( row.ID != -1){
				existe = true;
				html = html + '<tr id = "nivID_' + row.IDITEM + '"> ';
				html = html + '<td style="text-align:center" >' + (i+1) + '</td>';
				html = html + '<td style="text-align:center" >' + row.UBICACION + '</td>';
				html = html + '<td style="text-align:center" >' + (row.CODIGO==null ? "" : row.CODIGO)  + '</td>';
				html = html + '<td >' + (row.DESCRIPCION==null ? (row.ESVACIO=="S" ? "Vacío" : (row.CODIGO==null||row.CODIGO=="" ? "Sin Registrar" : row.CODIGO)) : row.DESCRIPCION) + '</td>';
				html = html + '<td style="text-align:center" >' + (row.LOTE==null ? "" : row.LOTE) + '</td>';
				//html = html + '<td style="text-align:center" >' + row.FECHA + '</td>';
				if (row.CANTIDAD != null  )
					html = html + '<td style="text-align:right" >' + row.CANTIDAD + '</td></tr>';
				else
					html = html + '<td style="text-align:center" >&nbsp;</td></tr>';
			}
		}		
	}

	if(!existe){
		html = html+'<tr><td colspan=6 style="text-align:rigth" >No hay ningun registro ...</td></tr>'		
	}
	$("#tabMateriales").html(html);
	$("#cargando").hide()
		
	return true	
		
}



function ListaUbicacionA(ubicacion){
	
	$.mobile.changePage('#pListaNivelA')
	$("#cargando").show();	
	var documento = getLocalStorage("documento");
	db.transaction( function (tx){		
				tx.executeSql("SELECT DT.IDITEM, DT.CODIGO,DT.LOTE,DT.CANTIDAD,DT.ESVACIO,(SELECT DISTINCT(DESCRIPCION)  FROM MATERIAL MA WHERE MA.CODIGO=DT.CODIGO) DESCRIPCION "+ 
							  "FROM INVENTARIO_DET DT WHERE DT.NRO=? AND DT.UBICACION =? AND ((DT.CODIGO IS NOT NULL AND DT.CODIGO <>'' ) OR ESVACIO IS NOT NULL)", [documento,ubicacion], ListaItemsLocal, errorCB);			
						 }, 
						 errorCB);		

}


function ListaItemsLocal(tx, results)
{
	
	var html = "";
	var btnNuevo ="";
	var btnNuevaInt ="";
	var existe = false;
	var onclick ="";
	
	$("#tabUbicacionA").html("");
	html = html + '<tr class="tabla_tiulo"><td style="text-align:center">N°</td>';
	html = html + '<td style="text-align:center" >Material</td>';
	html = html + '<td style="text-align:center" >Descripción Material</td>';
	html = html + '<td style="text-align:center" >Lote</td>';
	html = html + '<td style="text-align:center" >Vacio</td>';
	html = html + '<td style="text-align:center" >Cantidad</td></tr>';

	//Busca Datos	
	if (results != null && results.rows != null) {		
		for (var i = 0; i < results.rows.length; i++) {
		 	var row = results.rows.item(i);		 
		 	if ( row.ID != -1){
				existe = true;
				html = html + '<tr id = "nivID_' + row.IDITEM + '"> ';
				html = html + '<td style="text-align:center" >' + (i+1) + '</td>';
				html = html + '<td style="text-align:center" >' + (row.CODIGO==null ? "" : row.CODIGO)  + '</td>';
				html = html + '<td >' + (row.DESCRIPCION==null ? "" : row.DESCRIPCION) + '</td>';
				html = html + '<td style="text-align:center" >' + (row.LOTE ==null ? "" : row.LOTE )+ '</td>';
				html = html + '<td style="text-align:center" >' + (row.ESVACIO ==null ? "N" : row.ESVACIO ) + '</td>';
				if (row.CANTIDAD != null  )
					html = html + '<td style="text-align:right" >' + row.CANTIDAD + '</td></tr>';
				else
					html = html + '<td style="text-align:center" >&nbsp;</td></tr>';
			}
		}		
	}

	if(existe){
		//if(bdLocal!="S")
		//	$("#btnEnviarSer").show()		
	}else{
		html = html+'<tr><td colspan=6 style="text-align:rigth" >No hay ningun registro ...</td></tr>'		
	}
	$("#tabUbicacionA").html(html);
	$("#cargando").hide()
		
	return true	
		
}


function BuscaMaterial(){
	
	if ( $("#busProducto").length > 0)
		ListaInventario(nivelLista,$("#busProducto").val(),$("#busUbicacion").val())
}

function ListaInventario(nivel,material,ubicacion){
	nivelLista = nivel 
	
	if ( material=="" && $("#busProducto").length > 0)
		material = $("#busProducto").val()
		
	var camara = getLocalStorage("camara")
	var almacen = getLocalStorage("almacen")
	var centro = getLocalStorage("centro")	
	
	$.mobile.changePage('#pLista')
	$("#titInventario").html("Centro/Almacen/Camara :" +centro+"/"+almacen+"/"+camara)
	sql = "SELECT DT.IDITEM, POSICION,DT.UBICACION, DT.ESTADO, "+
	     	  	"(strftime('%s', date(IFNULL(DT.FVENCE,(SELECT MAX(FCADUCA)  FROM MATERIAL MA WHERE MA.CODIGO=DT.CODIGO AND MA.LOTE = DT.LOTE)))) - strftime('%s',date('now')))/(3600*24) DIAS,"+
	      	  	"IFNULL(DT.FVENCE,(SELECT MAX(FCADUCA)  FROM MATERIAL MA WHERE MA.CODIGO=DT.CODIGO AND MA.LOTE = DT.LOTE)) FVENCE, "+
		  		"DT.CODIGO,DT.LOTE,DT.CANTIDAD,DT.UNIDADES,DT.ESVACIO,(SELECT MAX(DESCRIPCION)  FROM MATERIAL MA WHERE MA.CODIGO=DT.CODIGO) DESCRIPCION "+ 
		  "FROM INVENTARIO_DET DT WHERE DT.NRO=? "
		  
	sql = material == "" ? sql : sql + " AND DT.CODIGO='"+material +"'"
	sql = ubicacion == "" ? sql : sql + " AND DT.UBICACION LIKE '%"+ubicacion +"%'"
	
		
	if (nivel =="N1") sql = sql +" AND UBICACION LIKE '%A%' "
    else if (nivel !="L") sql = sql +" AND UBICACION NOT LIKE '%A%' "
	sql = sql +" order by POSICION "
	
	$("#cargando").show();		
	
	var documento = getLocalStorage("documento");
	if (documento =="" )
	   documento = getLocalStorage("ultDocumento")
	   
	
	db.transaction( function (tx){		
				tx.executeSql(sql, [documento], ListaItemsInventario, errorCB);			
						 }, 
						 errorCB);		
	
	
	$("#btnRegLista").unbind("click" );			
	if (nivel=="L")				
		$("#btnRegLista").click(function() { $.mobile.changePage('#pagHome') })	
	else if (nivel =="N1")
		$("#btnRegLista").click(function() { $.mobile.changePage('#pRegistrarN1') })	
	else 
		$("#btnRegLista").click(function() { $.mobile.changePage('#pRegistrar') })		
	
}


function ListaItemsInventario(tx, results)
{
	var documento=getLocalStorage("documento")	
	$("#nroDocuLista").html("Documento: " + documento)
	if (documento =="" )
	{
	   documento = getLocalStorage("ultDocumento")
	   $("#nroDocuLista").html("Documento Cerrado: " + documento)
	}
	   
	var html = "";
	var btnNuevo ="";
	var btnNuevaInt ="";
	var existe = false;
	var onclick ="";
	var material =""
	var ubicacion =""
	var totUnidad = 0
	var totCantidad = 0
		
	if ( $("#busProducto").length > 0)	material = $("#busProducto").val()
	if ( $("#busUbicacion").length > 0)	ubicacion = $("#busUbicacion").val()
	
	$("#tabInventario").html("");
	html = html + '<tr class="tabla_tiulo"><td colspan=2 style="text-align:left"><a href="javascript:void(0)" data-role=\"button\" data-theme=\"e\" data-icon =\"back\" data-mini=\"true\" data-inline=\"true\" onClick=\"$(\'#btnRegLista\').click(); \" >Regresar</a></td>'+
										 '<td colspan=1 style="text-align:center"><input class="formUbicacion" name="busUbicacion"  id="busUbicacion" placeholder="Nivel"  data-mini="true" style="text-align:right" type="text"></td>' +	
										 '<td colspan=2 style="text-align:center"><input class="formNumero" name="busProducto" pattern="[0-9]*" id="busProducto" placeholder="Material"  data-mini="true" style="text-align:right" type="number"></td>' +	
									  	 "<td colspan=3 style='text-align:center'><a href='javascript:void(0)' data-role=\"button\" data-theme=\"b\" data-icon =\"search\" data-mini=\"true\" data-inline=\"true\" onClick=\"BuscaMaterial(); return false;\" >Buscar</a></td></tr>";
	html = html + '<tr class="tabla_tiulo"><td style="text-align:center">Ubic.</td>';
	html = html + '<td style="text-align:center" >Mat.</td>';
	html = html + '<td style="text-align:center" >Descripción Material</td>';
	html = html + '<td style="text-align:center" >Fecha Venc.</td>';
	html = html + '<td style="text-align:center" >Vida Util (Días)</td>';
	html = html + '<td style="text-align:center" >Lote</td>';
	html = html + '<td style="text-align:center" >Cant.</td>';
	html = html + '<td style="text-align:center" >Unid.</td></tr>';

	//Busca Datos	
	if (results != null && results.rows != null) {		
		for (var i = 0; i < results.rows.length; i++) {
		 	var row = results.rows.item(i);		 
		 	if ( row.ID != -1){
				existe = true;
				html = html + '<tr id = "idItem_' + row.IDITEM + '"> ';
				html = html + '<td style="text-align:center" >' + row.UBICACION+ '<input type="hidden" id="idUni-'+row.IDITEM+'" value="'+row.UNIDADES+'" /><input type="hidden" class="posicion" value="'+row.POSICION+'" /></td>';
				html = html + '<td style="text-align:center" >' + (row.CODIGO==null ? "" : row.CODIGO)  + '</td>';
				html = html + '<td >' + (row.DESCRIPCION==null ? (row.ESVACIO=="S" ? "Vacío" : (row.CODIGO==null||row.CODIGO=="" ? "Sin Registrar" : row.CODIGO)) : row.DESCRIPCION) + '</td>';
				html = html + '<td style="text-align:center">' + (row.FVENCE==null ? "" : row.FVENCE) + '</td>';
				html = html + '<td style="text-align:center" >' + (row.DIAS==null ? "" : row.DIAS) + '</td>';
				html = html + '<td style="text-align:center" >' + (row.LOTE ==null ? "" : row.LOTE )+ '</td>';
				if (row.CANTIDAD != null  ){
					html = html + '<td style="text-align:right" >' + row.CANTIDAD + '</td>';
					totCantidad += row.CANTIDAD
				}
				else
					html = html + '<td style="text-align:center" >&nbsp;</td>';
				
				if (row.UNIDADES != null  ){
					html = html + '<td style="text-align:right" >' + row.UNIDADES+ '</td></tr>';
					totUnidad += row.UNIDADES
				}
				else
					html = html + '<td style="text-align:center" >&nbsp;</td></tr>';
			}			
		}	
		totCantidad = totCantidad.toFixed(2)
		totUnidad = totUnidad.toFixed(2)
		
		html = html + '<tr><td style="text-align:center"><b>'+results.rows.length+'</b></td><td colspan=5 style="text-align:center">TOTALES</td><td style="text-align:right">'+totCantidad+'</td><td style="text-align:right">'+totUnidad+'</td></tr>';		
	}

	if(!existe){
		html = html+'<tr><td colspan=8 style="text-align:rigth" >No hay ningun registro ...</td></tr>'			
					
	}
	$("#tabInventario").html(html);
	$("#tabInventario").trigger('create')
	$("#busProducto").val(material)
	$("#busUbicacion").val(ubicacion)
	$("#cargando").hide()
		
	return true	
		
}

function Sincronizar(){


		$("#titPopUp").html("Sinc. al Servidor")
		$("#cabPopUp").html("Sinc. al Servidor")
		$("#msgPopUp").html("Este proceso enviará los datos registrados en el equipo al servidor de San Fernando<br/>¿Seguro de continuar?")
		$("#btnPopup").click()
		$("#btnAceptar").unbind( "click" );
		$("#divAceptar").show()
		$("#btnAceptar").click(function() {
			$("#divAceptar").hide()
			$("#msgPopUp").html("Espere mientras envia los datos al servidor")
			EnviarServidor('S') //Sincroniza
		})		
	
}

function EnviarServidor(forma)
{
	var documento = getLocalStorage("documento");
	var url =getIPorHOSTApi() + "InventarioApi/ProbarConn"
	tipoEnvio = forma
	
	$("#cargando").show();
	$.getJSON(url, {}, function (resultado) {				  
			$("#msgPopUp").html("Enviando registros pendientes al servidor San Fernando, por favor espere...", null, 'Aviso');		
			var sql = "SELECT * FROM INVENTARIO_DET WHERE NRO=? "
			 
			//Si es inventario superior solo envia la ubicacion superior
			if (forma =="S" || forma =='TS' ) 
				sql= sql +" AND ESTADO ='R'  AND UBICACION NOT LIKE '%A%'  "	
			else
				sql= sql +" AND UBICACION LIKE '%A%'  "
			
			db.transaction( function (tx){		
					tx.executeSql(sql, [documento], RegistraNube, errorCB);			
				}, 
				errorCB);	

		}).error(function(){
			$("#msgPopUp").html("No puede conectarse al servidor para enviar datos ")
			$("#cargando").hide();
			});	
	
}

function RegistraNube(tx, results){
	
	var total = 0;
	var url = ""
	var documento = getLocalStorage("documento");
	var camara = getLocalStorage("camara");
	var centro = getLocalStorage("centro");
	
	var equipo = $("#iduuid").html();
	if (results != null && results.rows != null) {
		for (var i = 0; i < results.rows.length; i++) {		  
			total ++;
			var row = results.rows.item(i);					
			var dato ='{"centro":"'+centro +'","camara":"'+camara +'","documento":"'+documento+'","Ubicacion":"' +row.UBICACION+'","Posicion":"'+row.IDITEM+'","Material":"' +row.CODIGO+'","Lote":"'+row.LOTE+
					  '","Cantidad":"'+row.CANTIDAD+'","Unidades":"'+row.UNIDADES+'","FechaHora":"'+row.FECHA+'","FechaVence":"'+row.FVENCE+'","Usuario":"'+row.SUSUARIO+'","esvacio":"'+row.ESVACIO+'","Equipo":"'+equipo+'"}'
			if (total > 1)
			 	listaDatos = listaDatos +"," +dato
			else
				listaDatos = dato			
		}
		if(total>0)
		{			
			var now=new Date();
			var fecha = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,19)	
	
			$("#actSinSAP").html("Última sincronizacion con SAP: " + fecha);
			listaDatos = "[" +listaDatos+"]"	
			$("#msgPopUp").html($("#msgPopUp").html()+"<br/>Registros Enviados: "+total )			
			url = getIPorHOSTApi() + "InventarioApi/EnviarListaInventario"								
			GrabarRegistro(url,"post",listaDatos);										
		}	
	}
	
	if (total == 0)
	{
		$("#cargando").show();
		if (tipoEnvio=="T" || tipoEnvio =="TS") //Si es terminar
		{	CerrarInventarioLocal()			
		}
		else
		{
			$("#msgPopUp").html("No existe ningun registro en la BD Loca que enviar al Servidor");		
			$("#divAceptar").show()	
			$("#btnAceptar").unbind("click" );		
			$("#btnAceptar").click(function() { $.mobile.changePage('#pListaRegistroLocal') })	
		}
	}
	
}

 
function GrabarRegistro(url,tipo,data)
{
	var documento = getLocalStorage("documento");
	
	$("#cargando").show();		
	$.ajax(url, {
           "async":false,
		   "type": tipo,
		   "processData": false,
           "contentType": "application/json; charset=utf-8",
           "dataType"   : "json",
		   "data": data,
		   "success": function(result) {	
		   			 if (result.indexOf("OK") != -1 ){
						var reg=0
						var registros =	result.split("|")					 
						$.each(registros, function(indice, dato) {		
							   reg++
							   var arrayDato = dato.split(";")
							   if (arrayDato.length > 2)
								{	var ubicacion = arrayDato[0]
								    var iditem = arrayDato[1]
									if (arrayDato[2] =="OK")
									{
										//if (tipoEnvio=="T" || tipoEnvio=="TS" ) //Termina
										//	db.transaction(	function (tx){ tx.executeSql("DELETE FROM INVENTARIO_DET WHERE NRO=? AND UBICACION = ? AND IDITEM =? ",[documento,ubicacion,iditem ]);},errorCB, function(){})
										//else
											db.transaction(	function (tx){ tx.executeSql("UPDATE INVENTARIO_DET SET ESTADO = 'E' WHERE NRO=? AND UBICACION = ? AND IDITEM =? ",[documento,ubicacion,iditem ]);},errorCB, function(){})																																			
									}
								}			
								if (reg >= registros.length && (tipoEnvio=="T" || tipoEnvio=="TS"))
								{	CerrarInventarioLocal()					
									
								}
						 });							 
						 $("#cargando").hide();
					}
					else
					{	
						$("#msgPopUp").html($("#msgPopUp").html() +"<br/>Problemas al tratar de grabar " + result)	
						$("#msgPopUp").html($("#msgPopUp").html() +"<br/> ¿Desea reintentar?")	
						$("#divAceptar").show()	
						$("#cargando").hide();					
					}
					
					
			   	},
		   "error": function(result) {
					$("#msgPopUp").html($("#msgPopUp").html() + "<br/>No se pudo conectar con el servidor. " + result)		
					$("#cargando").hide();
			   }
		});		
}

function CerrarInventarioLocal()
{
	var camara = getLocalStorage("camara");
	var almacen = getLocalStorage("almacen");
	var centro = getLocalStorage("centro");
	var documento = getLocalStorage("documento");
	
	
	var now=new Date();
	var fechaCierre = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,19)	
			
	$("#cargando").show();	
	var url =getIPorHOSTApi()+"InventarioApi/CerrarInventario"	 
	$.ajax(
		{url: url, 
		crossDomain:true,
		cache:false,
		type: "POST",
		data: { NroInventario: documento,camara: camara,almacen:almacen,centro:centro},
		success: function(result){
			if (result.indexOf("ERR") != -1   ){
				$("#msgPopUp").html($("#msgPopUp").html()+"<br/> "+result )			
			}else
			{					
				db.transaction(	function (tx){tx.executeSql('DELETE FROM INVENTARIO WHERE NRO <> ? ',[documento]);}, errorCB, function (){})
				db.transaction(	function (tx){tx.executeSql('DELETE FROM INVENTARIO_DET  WHERE NRO <> ? ',[documento]);}, errorCB, function (){})			
				//db.transaction(	function (tx){tx.executeSql('DELETE FROM INVENTARIO_DET ',[]);}, errorCB, function (){})	
				db.transaction(	function (tx){tx.executeSql('UPDATE INVENTARIO SET ESTADO =?,FCIERRE=? WHERE NRO = ? ',['E',fechaCierre,documento]);}, errorCB, function (){})
				window.localStorage.setItem("documento","")		 	
				$("#divAceptar").show()
				$("#msgPopUp").html("Inventario Cerrado Correctamente." )
				$("#titPopUp").html("Inventario Cerrado")
				$("#btnAceptar").unbind("click" );							
				$("#btnAceptar").click(function() { $.mobile.changePage('#pagHome') })		
			}	
			$("#cargando").hide();
		},
		 error: function (jqXHR, exception) {
			$("#msgPopUp").html($("#msgPopUp").html()+"<br/>Problemas al tratar de cerrar el inventario en SAP" )
			$("#cargando").hide();
		}
	});	
}


function ValidarCierreInventario()
{
	var documento = getLocalStorage("documento");
	if (documento=="" ||documento=="0"){
		navigator.notification.alert("NO hay documento de inventario que cerrar!!")
		return	
	}
	var perfil = getLocalStorage("perOperB");
	if ( perfil != "INV_OPERA")
	{
		CerrarInventario()	
		return
	}
	
	var documento = getLocalStorage("documento");
	var sql = "SELECT COUNT(distinct ubicacion) TOTAL,  " +
					" COUNT(distinct (case when CODIGO <> '' or esvacio='S' then ubicacion else null end ) ) REG "+
			  "FROM INVENTARIO_DET WHERE NRO=? AND UBICACION LIKE '%A%'  "	
			
	
			  
	CerrarInventario()	
	return
	
	db.transaction( function (tx){		
					tx.executeSql(sql, [documento],
					 function (tx, results){
						 if (results != null && results.rows != null && results.rows.length > 0) {							   
				   			var row = results.rows.item(0);
							
							if (row.TOTAL <= row.REG)
								CerrarInventario()														
							else
								navigator.notification.alert("Debe registrar el inventario en todas las Ubicaciones del Nivel A!!")
						 }
						 else
						 	navigator.notification.alert("NO se puede determinar si registro todos las ubicaciones del nivel!!")
					 }, 
					errorCB);			
				}, 
				errorCB);	
}



function limpiarDespacho()
{
	var now=new Date();
	var fecha = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,10)	
	
	db.transaction(function (tx){tx.executeSql("DELETE FROM DESPACHO WHERE FECHA <> ?",[fecha]);	}, errorCB, 
							 function (){})		
							 
								
}

function validarDespacho(opcion,codigo,camara)
{
	var now=new Date();
	var fecha = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,10)	
	
	//console.log("Valida: "+codigo)
	
	db.transaction( function (tx){		
				tx.executeSql("SELECT COUNT(1) TOTAL FROM DESPACHO WHERE OPCION =? AND CODIGO=? AND CAMARA=? AND FECHA = ?",[opcion,codigo,camara,fecha],
				 function (tx, results){
					 if (results != null && results.rows != null && results.rows.length > 0) {							   
						var row = results.rows.item(0);
						
						if (row.TOTAL > 0)
							gGrabaCab ="S"	//Marca como que ya grago la cabecera..												
						else
							gGrabaCab ="N"
					 }
					 else
						gGrabaCab ="S"
						
					
				 }, 
				errorCB);			
			}, 
			errorCB);	
							
}

function registraDespacho()
{
	
	var opcion = gopcion
	var codigo = ""
	var camara=""
	if (opcion == 3){
		codigo = $("#cbxTransporte").val()
		camara = $("#docCamara").val()
	}
	if (opcion == 2){
		codigo = $("#cbxGrupo").val()
		camara = $("#grCamara").val()
	}
	if (opcion ==1){
		 camara  = $("#preCamara").val()	
		 codigo = gcodRuta
	}
		
	var now=new Date();
	var fecha = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().substring(0,10)	
	
	
	console.log("Registrando.. Op:"+opcion +" Cod:"+codigo+" Cam:"+ camara)
	db.transaction( function (tx){		
				tx.executeSql("INSERT INTO DESPACHO ( OPCION ,CODIGO,CAMARA,FECHA) VALUES(?,?,?,?)",[opcion,codigo,camara,fecha],
				 function (tx, results){
				 }, 
				errorCB);			
			}, 
			errorCB);	
							
}

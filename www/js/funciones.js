
function getIPorHOSTApi() {

	//return "http://webdes.san-fernando.com.pe:8100/"
	return "http://localhost:50241/"
	//return "http://webgsf.san-fernando.com.pe/"//

	var url = getLocalStorage("url");
	if (url == "" || url == null) {
		return "http://webgsf.san-fernando.com.pe/"
		//url = "http://webdes.san-fernando.com.pe:8100/"
		//url= "http://localhost:50241/"
	}

	return url;
}

function getLocalStorage(str) {
	return limpiarCadena(window.localStorage.getItem(str));
}

function limpiarCadena(str) {
	if (str == undefined) str = "";
	if (str == null) str = "";
	if (str == "undefined") str = "";
	if (str == "null") str = "";
	str = $.trim(str);
	return str;
}


function validarLogin() {

	if ($.trim($("#txtUsuario").val()) == "" || $.trim($("#txtPassword").val()) == "") {


		navigator.notification.alert("Ingrese Usuario y/o Password")
		/*$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>" + $("#valmsj").val() + "</h1></div>").css({ "display": "block", "opacity": 0.96, "top": 180, "font-size": 11 })
			.appendTo($.mobile.pageContainer)
			.delay(2500)
			.fadeOut(100, function () {
				$(this).remove();
			});*/

		return;
	} else {
		window.localStorage.setItem("usuario", $("#txtUsuario").val());
		window.localStorage.setItem("password", $("#txtPassword").val());

		var usuario = getLocalStorage("usuario");
		var clave = getLocalStorage("password");

		ingresarSistema(usuario, clave);
	}
}
var datosUsuario = []
function ingresarSistema(usuario, clave) {

	var aplicacion = 8;
	$("#cargando").show();

	$.ajax({
		url: getIPorHOSTApi() + "Usuario/ValidarUsuario",
		crossDomain: true,
		cache: false,
		type: "POST",
		timeout: 60000,
		data: { caplicacion: aplicacion, susuario: usuario, tclave: clave },
		beforeSend: function () {
			datosUsuario.length = 0;
			$("#cargando").show();
		},
		success: function (resultado) {
			if (resultado.CUSUARIO != -1) {
				datosUsuario = resultado;
				window.localStorage.setItem("cusuario", resultado.CUSUARIO);
				window.localStorage.setItem("susuario", resultado.SUSUARIO);
				window.localStorage.setItem("dusuario", resultado.DUSUARIO);

				$("#divNombreUsuario").html(resultado.DUSUARIO)
				activarLogeoInicial()
				$.mobile.changePage("#pagHome", { transition: "slideup" });

				configuracionUsuario()

			} else {
				var mensaje = "Usuario Incorrecto y/o usuario no existe!!";
				$("#divloginmensaje").html(mensaje);
				$("#divloginmensaje").show();
			}
			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			var msg = 'Problemas al tratar de conectarse.';
			navigator.notification.alert(msg)
			$("#cargando").hide();
		}
	})
}

var lstPerUsu = [];
function activarLogeoInicial() {

	ocultarModulos()

	$.ajax({
		url: getIPorHOSTApi() + "Usuario/UsuarioModuloPermiso",
		crossDomain: true,
		cache: false,
		type: "Get",
		timeout: 60000,
		data: { caplicacion: 8, cusuario: getLocalStorage("cusuario") },
		beforeSend: function () {
			lstPerUsu.length = 0
			$("#cargando").show();
		},
		success: function (result) {

			$.each(result, function (indice, row) {
				if (row.SMODULO == "GestionAviso") {
					$("#modAvisoMant").show();
					$("#menAvisoMant").show();
				}
				else if (row.SMODULO == "OrdenMant") {
					$("#modOrdenMant").show();
					$("#menOrdenMant").show();
				}
				else if (row.SMODULO == "CheckList") {
					$("#modCheckList").show();
					$("#menCheckList").show();
				}
				else if (row.SMODULO == "Indicadores") {
					$("#modIndicadores").show();
					$("#menIndicadores").show();
				}
				else if (row.SMODULO == "GestUsuario") {
					$("#modMttoUsu").show();
					$("#menMttoUsu").show();
				}
				else if (row.SMODULO == "Documento") {
					$("#modDocumento").show();
					$("#menDocumento").show();
				}
				else if (row.SMODULO == "ProgMant") {
					$("#modProgMant").show();
					$("#menProgMant").show();
				}

			});
			lstPerUsu = result;

			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			navigator.notification.alert("Problemas con la conexion para obtener perfiles!!")
			$("#cargando").hide();
		},
	});

}

function ocultarModulos() {
	$("#modAvisoMant").hide();
	$("#modOrdenMant").hide();
	$("#modCheckList").hide();
	$("#modIndicadores").hide();
	$("#modMttoUsu").hide();
	$("#modDocumento").hide();
	$("#modProgMant").hide();

	$("#menAvisoMant").hide();
	$("#menOrdenMant").hide();
	$("#menCheckList").hide();
	$("#menIndicadores").hide();
	$("#menMttoUsu").hide();
	$("#menDocumento").hide();
	$("#menProgMant").hide();

}

/// permisos perfil Modulo
/*function permisosModulo(modulo) {
	var getJSON = localStorage.getItem('PermisosModulo');
	var lstPermisos = JSON.parse(getJSON)
	//var permiso = lstPermisos.filter(x => x.SMODULO == modulo);
	//window.localStorage.setItem("iagregar", permiso[0].IAGREGAR)
	//window.localStorage.setItem("ieliminar", permiso[0].IELIMINAR)
	//window.localStorage.setItem("imodificar", permiso[0].IMODIFICAR)
}*/
var dataLogConUsu = []
function configuracionUsuario() {

	var cusuario = getLocalStorage("cusuario")
	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/Configuracion?cusuario=" + cusuario,
		type: "get",
		timeout: 60000,
		//data: {cusuario:cusuario},
		//content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			$("#txtConURL").val(getIPorHOSTApi())
			$("#txtConCentro").val(data.Centro)
			$("#txtConPuesto").val(data.Puesto)
			//Grupos
			$("#cbxConGrupo").empty()
			$("#cbxConGrupo").append('<option value="">Ver Grupos</option>')

			if (data.Grupos != null) {
				var datos = data.Grupos.split("|");
				for (i = 0; i < datos.length; i++) {
					$("#cbxConGrupo").append('<option value="' + datos[i] + '">' + datos[i] + '</option>')
				}
				if (datos.length == 1)
					$("#cbxConUbicacion").val(datos[0])
			}
			$("select#cbxConGrupo").change()

			$("#cbxConUbicacion").empty()
			$("#cbxConUbicacion").append('<option value="">Ver Ubicaciones</option>')
			if (data.Grupos != null) {
				var datos = data.Ubicaciones.split("|");
				for (i = 0; i < datos.length; i++) {
					$("#cbxConUbicacion").append('<option value="' + datos[i] + '">' + datos[i] + '</option>')
				}
				if (datos.length == 1)
					$("#cbxConUbicacion").val(datos[0])

			}
			$("select#cbxConUbicacion").change()
			dataLogConUsu = data	// ---
			registraMaestros(data)
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere Configuracion de Usuario " + jqXHR)

		}
	});

}

var lstMaestros = []
function registraMaestros(avisoBE) {


	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaMaestros",
		type: "post",
		timeout: 60000,
		data: avisoBE,
		content: "application/json",
		beforeSend: function () {
			lstMaestros.length = 0
			$("#cargando").show()
		},
		success: function (data) {
			listarUbicaciones(data)
			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtener Tablas Maestras")
		}
	});
}


$(document).ready(function () {

	$("#txtFilter").keyup(function () {
		var rows = $("#tabAvisoBody").find("tr").hide();
		var data = this.value.split(" ");
		$.each(data, function (i, v) {
			rows.filter(":contains('" + v + "')").show();
		});
	})

	$("#txtBusAviUbiTec").keyup(function () {
		var rows = $("#tblUbiTecBody").find("tr").hide();
		var data = this.value.split(" ");
		$.each(data, function (i, v) {
			rows.filter(":contains('" + v + "')").show();
		});
	})

	$("#tblAviUbiTecnica").delegate("td", "click", function () {
		var row = $(this).parent().parent().children().index($(this).parent()) + 1;
		var codigo = $('#tblAviUbiTecnica tr').eq(row).find('td:first').text()//.substring(0);
		var origen = $("#hidAviUbiTecOpc").val()

		if (origen == "L") {
			$("#txtAviCodUbiTecLis").val(codigo)
			$.mobile.changePage('#pagListaAvisos')
		} else if (origen == "E") {
			$("#txtAviCodUbi").val(codigo)
			$.mobile.changePage('#pagEditarAviso')
			obtenerDatosEquipo(codigo)
		}
	});

	$("#tblReqOpeSelServ").delegate("td", "click", function () {
		var row = $(this).parent().parent().children().index($(this).parent()) + 1;
		var codigo = $('#tblReqOpeSelServ tr').eq(row).find('td:first').text()//.substring(6);
		var descripcion = $('#tblReqOpeSelServ tr').eq(row).find("td").eq(1).text()//.substring(8)
		var um = $('#tblReqOpeSelServ tr').eq(row).find("td").eq(2).text()//.substring(2)
		var articulo = $('#tblReqOpeSelServ tr').eq(row).find("td").eq(3).text()//.substring(10)
		var compras = $('#tblReqOpeSelServ tr').eq(row).find("td").eq(4).text()//.substring(7)

		$("#txtReqCodSer").val(codigo)
		$("#txtReqServicio").val(descripcion)
		$("#txtReqUniMedida").val(um)
		$("#txtReqGrArticulo").val(articulo)
		$("#txtReqGrCompras").val(compras)
		$.mobile.changePage('#pagEditarReqOpeExterno')
	});

	$("#tblReqOpeClaMod").delegate("td", "click", function () {
		var row = $(this).parent().parent().children().index($(this).parent()) + 1;
		var codigo = $('#tblReqOpeClaMod tr').eq(row).find('td:first').text()//.substring(6);
		var descripcion = $('#tblReqOpeClaMod tr').eq(row).find("td").eq(1).text()//.substring(6)
		$("#txtReqClaveModelo").val(codigo)
		$("#txtReqDesModelo").val(descripcion)
		$("#hiddExtClaMod").val(codigo)
		$.mobile.changePage('#pagEditarReqOperacion')
	});

	$("#tblOpeSol").delegate("td", "click", function () {
		var row = $(this).parent().parent().children().index($(this).parent()) + 1;
		var codigo = $('#tblOpeSol tr').eq(row).find('td:first').text()//.substring(6);
		var descripcion = $('#tblOpeSol tr').eq(row).find("td").eq(1).text()//.substring(6)
		$("#txtReqSolicitante").val(codigo)
		//$("#txtReqDesSolicitante").val(descripcion)		
		$.mobile.changePage('#pagEditarReqOpeExterno')
	});

	$("#tblReqSelMat").delegate("td", "click", function () {
		var row = $(this).parent().parent().children().index($(this).parent()) + 1;
		var codigo = $('#tblReqSelMat tr').eq(row).find('td:first').text()//.substring(6);
		var descripcion = $('#tblReqSelMat tr').eq(row).find("td").eq(1).text()//.substring(8)
		var um = $('#tblReqSelMat tr').eq(row).find("td").eq(2).text()//.substring(2)
		var lote = $('#tblReqSelMat tr').eq(row).find("td").eq(3).text()//.substring(4)

		//console.log(codigo,descripcion,um,lote)
		$("#txtMatCodigo").val(codigo)
		$("#txtMatDesc").val(descripcion)
		$("#txtMatUniMed").val(um)
		$("#txtMatLote").val(lote)
		$.mobile.changePage('#pagEditarReqMaterial')
	});

})

function listarUbicaciones(datos) {

	$("#cargando").show();

	var html = ""
	var existe = false;

	var data = datos.filter(x => x.STABLA == "UBITEC")
	$(data).each(function (i, row) {
		existe = true;
		html = html + '<tr> ' +
			'<td>' + row.SITEM + '</td>' +
			'</tr>';
	})

	if (!existe) {
		html = html + '<tr><td colspan=1 style="text-align:rigth" >No hay registros...</td></tr>'
	}

	$("#tblAviUbiTecnica").find('tbody').empty();


	$("#tblAviUbiTecnica").find('tbody').append(html);
	$("#tblAviUbiTecnica").trigger('create');
	//$("#tblAviUbiTecnica").table("refresh"); 

	lstMaestros = datos
	$("#cargando").hide();

	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()


}



$.fn.delayPasteKeyUp = function (fn, ms) {
	var timer = 0;
	$(this).on("propertychange input", function () {
		clearTimeout(timer);
		timer = setTimeout(fn, ms);
	});
};


function getRealContentHeight() {

	var header = $.mobile.activePage.find("div[data-role='header']:visible");
	var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
	var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
	var viewport_height = $(window).height();

	var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
	if ((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
		content_height -= (content.outerHeight() - content.height());

	}
	return content_height;
}

//Cerrarsesion()
function cerrarsesion() {
	clearTimeout(timeoutHandle);
	//window.localStorage.clear();
	window.localStorage.setItem("usuario", "");
	window.localStorage.setItem("password", "");

	$("#txtUsuario").val("");
	$("#txtPassword").val("");
	$("#cargando").hide();
	//$("body").css("background-color","#e8ebec");
	$.mobile.changePage("#pagLogin", { transition: "slideup" });
}








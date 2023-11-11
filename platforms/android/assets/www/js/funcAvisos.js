//Avisos
function gestionAviso() {
	$("#btnEditAviso").prop("disabled", true);
	$("#btnAvisoGrabar").prop("disabled", true);
	$("#btnMantRequerimiento").prop("disabled", true);
	$("#btnRegOpeMant").prop("disabled", true);
	$("#btnNueOpe").prop("disabled", true);
	$("#btnRegOpe").prop("disabled", true);
	$("#btnRegOpeExt").prop("disabled", true);
	$("#btnNueMat").prop("disabled", true);
	$("#btnRegOpeMat").prop("disabled", true);

	var perUsu = lstPerUsu.find(x => x.SMODULO == "GestionAviso")
	//perUsu.IAGREGAR	perUsu.ICONSULTAR 	perUsu.IELIMINAR,	perUsu.IMODIFICAR
	if (perUsu.IAGREGAR == "1") {
		$("#btnEditAviso").prop("disabled", false);
		$("#btnAvisoGrabar").prop("disabled", false);
		$("#btnMantRequerimiento").prop("disabled", false);
		$("#btnRegOpeMant").prop("disabled", false);
		$("#btnNueOpe").prop("disabled", false);
		$("#btnRegOpe").prop("disabled", false);
		$("#btnRegOpeExt").prop("disabled", false);
		$("#btnNueMat").prop("disabled", false);
		$("#btnRegOpeMat").prop("disabled", false);
	}
	if (perUsu.ICONSULTAR == "1" && perUsu.IAGREGAR != "1") {
		$("#btnEditAviso").prop("disabled", false);
		$("#btnMantRequerimiento").prop("disabled", false);

		$("#btnEditAviso").prop("disabled", true);
		$("#btnAvisoGrabar").prop("disabled", true);
		$("#btnRegOpe").prop("disabled", true);
		$("#btnRegOpeExt").prop("disabled", true);
		$("#btnNueMat").prop("disabled", true);
		$("#btnRegOpeMat").prop("disabled", true);
	}


	$.mobile.changePage('#pagListaAvisos')
	//LLena daos maestros
	maestrosAviso()


}

function maestrosAviso() {

	$("#cbxAviGrupo,#cbxAviUbicacion,#cbxAvisoTip,#cbxAvisoUb,#cbxAvisoEq,#cbxAvisoGr").empty()

	$("#cbxAviGrupo").append('<option value="">Seleccione Grupo</option>')
	$("#cbxAviGrupo").append('<option value="0">Todos</option>')

	$("#cbxAvisoTip,#cbxAvisoEq").append('<option value="">Seleccione Item</option>')

	var lstTipos = lstMaestros.filter(x => x.STABLA == "TIPO" && x.SITEM != "Z1");
	//console.log(lstTipos)
	$(lstTipos).each(function (i, row) {
		$("#cbxAvisoTip").append('<option value="' + row.SITEM + '">' + row.SITEM + " " + row.DITEM + '</option>')
	})
	//Datos de la session
	var opts = 0, val = ""
	opts = 0, val = ""
	$("#cbxConGrupo > option").each(function () {
		if (this.value != "") {
			opts++; val = this.value
			$("#cbxAvisoGr,#cbxAviGrupo").append('<option value="' + this.value + '">' + this.text + '</option>')
		}
	});

	if (opts == 1)
		$("#cbxAvisoGr,#cbxAviGrupo").val(val)
	else
		$("#cbxAvisoGr,#cbxAviGrupo").val("0")

	var ubiSelCong = $("#cbxConUbicacion").val()
	var ubiConfi = dataLogConUsu.Ubicaciones	 //console.log(ubiConfi.split("|")[0])
	if (ubiSelCong != "")
		$("#txtAviCodUbiTecLis").val(ubiSelCong)
	else if (ubiConfi.length > 0)
		$("#txtAviCodUbiTecLis").val(ubiConfi.split("|")[0])

	$("select#cbxAviGrupo,#cbxAvisoTip,select#cbxAvisoEq,select#cbxAvisoGr").change()

	var html = "";
	html = html + '<tr><td colspan=11 style="text-align:rigth" >No hay registros...</td></tr>'
	$("#tabAviso").find('tbody').empty();
	$("#tabAviso").find('tbody').append(html);
	$("#tabAviso").trigger('create')
	$("#tabAviso").table("refresh");

	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()

}


var lstAvisos = []
function listarGestionAvisos() {

	var grupos = ""
	var ubicaciones = ""
	$("#txtFilter").val("")

	if ($("#cbxAviGrupo").val() == "0" || $("#cbxAviGrupo").val() == "") {
		$("#cbxAviGrupo > option").each(function () {
			if (this.value != "" && this.value != "0") grupos = grupos == "" ? this.value : grupos + '|' + this.value
		});
	} else
		grupos = $("#cbxAviGrupo").val()

	var ubi = $("#txtAviCodUbiTecLis").val()
	var lstUbi = lstMaestros.filter(x => x.STABLA == "UBITEC")
	if (ubi == "") {
		$(lstUbi).each(function (i, row) {
			ubicaciones = ubicaciones == "" ? row.SITEM : ubicaciones + "|" + row.SITEM
		})
	}
	else {
		$(lstUbi).each(function (i, row) {
			if (row.SITEM.indexOf(ubi) == 0)
				ubicaciones = ubicaciones == "" ? row.SITEM : ubicaciones + "|" + row.SITEM
		})
	}

	var avisoBE = {
		CodAviso: $("#txtAviAviso").val(),
		Centro: $("#txtConCentro").val(), //"3904"
		Puesto: $("#txtConPuesto").val(),     //'PRY-TECN',
		Grupo: grupos,    //'C51',
		Ubicacion: ubicaciones,  //'PC-PI-M-SUL-00001',
		perfil: dataLogConUsu.Perfil
	};

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaAviso",
		type: "post",
		timeout: 60000,
		data: avisoBE,
		content: "application/json",
		beforeSend: function () {
			lstAvisos.length = 0
			$("#cargando").show();
		},
		success: function (data) {
			lstAvisos = data
			listarAvisos(data)
			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de avisos")
		}
	});
}


function listarAvisos(data) {
	//console.log(data.find(x => x.CodAviso == $("#txtAvisoCodigo").val()))

	var perUsu = lstPerUsu.find(x => x.SMODULO == "GestionAviso")

	var html = ""
	var existe = false;

	$(data).each(function (i, row) {
		existe = true;
		var flgRegOpe = row.FlagReq == null ? "" : row.FlagReq;
		var modVer = "-";
		var aprobacion = ""
		if (perUsu.IMODIFICAR == "1")
			modVer = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-edit ui-btn-icon-notext ui-btn-b ui-mini" onClick="editarAviso(\'' + row.CodAviso + '\')"></a>'
		else if (perUsu.ICONSULTAR == "1" && perUsu.IMODIFICAR != "1")
			modVer = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-eye ui-btn-icon-notext ui-btn-d ui-mini" onClick="editarAviso(\'' + row.CodAviso + '\')"></a>'
		var estado = "";
		if (row.Estado == 1) estado = "Pendiente"
		if (row.Estado == 2) estado = "Evaluando"
		if (row.Estado == 3) estado = "Asignado"
		if (row.Estado == 4) estado = "Cerrado"

		html = html + '<tr id = "idItem_' + row.CodAviso + '"> ' +
			'<td style="text-align:center" >' + (i + 1) + '</td>' +
			'<td>' + row.CodAviso + '</td>' +
			'<td>' + row.Tipo + '</td>' +
			'<td >' + row.FInicio + '</td>' +
			'<td >' + row.Titulo + '</td>' +
			'<td >' + row.Ubicacion + '</td>' +
			'<td >' + row.Equipo + '</td>' +
			'<td >' + row.Grupo + '</td>' +
			'<td >' + row.Centro + '</td>' +
			'<td>' + estado + '</td>' +
			//'<td>' + flgRegOpe + '</td>' +
			'<td >' + modVer + "&nbsp;" + aprobacion + '</td></tr>';

	})
	if (!existe) {
		html = html + '<tr><td colspan=11 style="text-align:rigth" >No hay registros...</td></tr>'
	}

	$("#tabAviso").find('tbody').empty();
	$("#tabAviso").find('tbody').append(html);
	$("#tabAviso").trigger('create')
	$("#tabAviso").table("refresh");

}

function editarAviso(codigoAviso) {
	//estado : 1.- Pendiente,2.-Evaluando,3.-Asignado,4.- Cerrado

	//inicializa
	$("#cbxAvisoTip").selectmenu().selectmenu("enable");
	$("#cbxAvisoTip").selectmenu().selectmenu("disable");
	//supervisor
	$("#divSupAut").hide()

	$('#cbxAvisoParada').slider()
	// MTTO_SUPERV crea Z2 modifica Z3
	// MTTO_TECN crea Z2 modifica Z3
	// MTTO_CLIENTE crea Z2	
	//dataLogConUsu.Perfil = "MTTO_SUPERV"
	var arrayTipos = null;
	if (dataLogConUsu.Tipos.length > 0)
		arrayTipos = dataLogConUsu.Tipos.split("|")
	var opcTipo = -1;

	if (codigoAviso == "") {

		$("#titEditarAviso").html('Nuevo Aviso')
		opcTipo = -1
		if (dataLogConUsu.Perfil == "MTTO_SUPERV" || dataLogConUsu.Perfil == "MTTO_TECN" || dataLogConUsu.Perfil == "MTTO_CLIENTE") {
			opcTipo = arrayTipos.indexOf("Z2")
		}
		// ocultar
		$("#divDesIni").hide()
		$("#txtAvisoDescIni").val("")
		//fecha
		var dataFecha = new Date().toLocaleDateString().split("/")
		var mes = dataFecha[1]
		var dia = dataFecha[0]
		if (mes.length == 1) mes = '0' + mes;
		if (dia.length == 1) dia = '0' + dia;
		var fecha = dataFecha[2] + "-" + mes + "-" + dia
		//hora
		var h = new Date().getHours()
		var m = new Date().getMinutes()
		var s = new Date().getSeconds()
		var hs = "", ms = "", ss = "";
		hs = h.toString()
		ms = m.toString()
		if (h < 10) hs = "0" + h.toString();
		if (m < 10) ms = "0" + m.toString();

		var horaAct = hs + ":" + ms + ":00"

		$("#txtAvisoCodigo").val("0");
		$("#txtAvisoTitulo").val("");
		$("#txtAvisoDesc").val("");
		$("#cbxAvisoTip").val("");
		$("#txtAviCodUbi").val("");
		$("#cbxAvisoEq").val("");
		$("#txtAvisoEq").val("");
		$("#cbxAvisoGr").val("");
		$("#txtAvisoPuesto").val($("#txtConPuesto").val())
		$("#txtAvisoCentroPL").val($("#txtConCentro").val())
		$("#txtAvisoCentroEM").val("")
		$("#hidAvisoCentroSU").val("")
		$("#dateAvisoIni").val(fecha);
		$("#dateAvisoDesea").val(fecha);
		$("#timeAvisoHora").val(horaAct);
		$("#hidAviEstado").val("1")
		$("#cbxAvisoParada").val("0").slider('refresh')

		$("#cbxAvisoTip").selectmenu("enable");
		$("#txtAviCodUbi").prop("disabled", false);
		$("#btnBusUbiEdit").prop("disabled", false);

		$("#divcbxAvisoEq").show()
		$("#divtxtAvisoEq").hide()


	}
	else if (codigoAviso !== "") {

		var dataAviso = lstAvisos.filter(x => x.CodAviso == codigoAviso);
		$("#titEditarAviso").html('Editar Aviso: ' + codigoAviso)
		opcTipo = -1
		if (dataLogConUsu.Perfil == "MTTOSUPERV" || dataLogConUsu.Perfil == "MTTOTECN") {
			opcTipo = arrayTipos.indexOf("Z3")
		}

		if (dataLogConUsu.Perfil == "MTTO_SUPERV" && dataAviso[0].Estado == "1")
			$("#divSupAut").show()

		//estado : 1.- Pendiente,2.-Evaluando,3.-Asignado,4.- Cerrado
		var desEstado = "";
		if (dataAviso[0].Estado == "1") desEstado = "Pendiente"
		if (dataAviso[0].Estado == "2") desEstado = "Evaluando"
		if (dataAviso[0].Estado == "3") desEstado = "Asignado"
		if (dataAviso[0].Estado == "4") desEstado = "Cerrado"
		$("#txtAviDesEstado").html("Estado: " + desEstado)

		$("#divDesIni").show()
		$("#txtAvisoDescIni").val(dataAviso[0].Descripcion)
		// hora 	
		var horaIni = "", hora = ""
		var dataHora = dataAviso[0].Hora;
		if (dataHora.length > 0) {
			horaIni = dataHora.split("T");
			if (horaIni[1].length > 0)
				hora = horaIni[1]
		}

		$("#txtAvisoCodigo").val(codigoAviso);
		$("#txtAvisoTitulo").val(dataAviso[0].Titulo);
		$("#txtAvisoDesc").val("");
		$("#dateAvisoIni").val(dataAviso[0].FInicio)
		$("#dateAvisoDesea").val(dataAviso[0].FDeseado)
		$("#timeAvisoHora").val(hora)
		$("#txtAviCodUbi").val(dataAviso[0].Ubicacion)
		$("#txtAvisoPuesto").val(dataAviso[0].Puesto)
		$("#txtAvisoCentroPL").val(dataAviso[0].Centro)

		$("#hidAviEstado").val(dataAviso[0].Estado)

		$("#cbxAvisoTip").val(dataAviso[0].Tipo);
		$("select#cbxAvisoTip").change()

		$("#textFlgCbxEqui").val("0")
		if (dataAviso[0].Ubicacion.length > 0) {
			obtenerDatosEquipo(dataAviso[0].Ubicacion)
			$("#textFlgCbxEqui").val("1")
		}
		$("#cbxAvisoEq").val(dataAviso[0].Equipo)
		$("#txtAvisoEq").val(dataAviso[0].Equipo)
		$("#cbxAvisoGr").val(dataAviso[0].Grupo)

		$("#cbxAvisoParada").val(dataAviso[0].Parada).slider('refresh')

		$("#cbxAvisoTip").selectmenu("disable");
		$("#txtAviCodUbi").prop("disabled", true);
		$("#btnBusUbiEdit").prop("disabled", true);

		$("#divcbxAvisoEq").hide()
		$("#divtxtAvisoEq").show()

	}

	$("select#cbxAvisoTip,select#cbxAvisoEq,select#cbxAvisoGr").change()

	$.mobile.changePage('#pagEditarAviso')
	$("#textFlgCbxEqui").val("0")
}

function onchaBusUbiTecList(txtData) {

	var codUbi = txtData.value
	if (codUbi.trim() == "") return;

	var lstData = lstMaestros.filter(x => x.STABLA == "UBITEC");
	var data = lstData.filter(u => u.SITEM == codUbi);

	if (data.length == 0) {
		//$("#txtAviCodUbiTecLis").val("")
		//$("#txtDesUbiTecLis").val("")
		return
	}
	else if (data.length != 0) {
		$("#txtAviCodUbiTecLis").val(data[0].SITEM)
		$("#txtDesUbiTecLis").val(data[0].DITEM)
	}

}

var lstAviEquipos = [];
function onchaBusUbiTec(txtData) {
	var codUbi = txtData.value
	if (codUbi.trim() == "") return;

	var lstData = lstMaestros.filter(x => x.STABLA == "UBITEC");

	var data = lstData.filter(u => u.SITEM == codUbi);
	if (data.length == 0) {
		$("#txtAviCodUbi").val("")
		$("#txtAviDesUbi").val("")
		$("#cbxAvisoEq").val("")
		$("select#cbxAvisoEq").change()

	}
	else if (data.length != 0) {
		$("#txtAviCodUbi").val(data[0].SITEM)
		$("#txtAviDesUbi").val(data[0].DITEM)

		$("#txtAvisoPuesto").val("")
		$("#txtAvisoCentroPL").val("")
		$("#txtAvisoCentroEM").val("")
		$("#hidAvisoCentroSU").val("")
		$("#cbxAvisoGr").val("")
		$("select#cbxAvisoGr").change()
		obtenerDatosEquipo(codUbi)
	}

}


function verPaginaUbicaciones(opc) {

	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()

	$("#hidAviUbiTecOpc").val(opc)
	$.mobile.changePage('#pagAviSelUbiTec')
}

function retornaAviUbiTec(checkparametro) {

	var opc = $("#hidAviUbiTecOpc").val()

	var datpar = checkparametro.value.split(";")
	if (opc == "E") {
		$("#txtAviCodUbi").val(datpar[0])
		$("#txtAviDesUbi").val(datpar[1])

		$.mobile.changePage('#pagEditarAviso')
		obtenerDatosEquipo(datpar[0])
	}
	else if (opc == "L") {
		$("#txtAviCodUbiTecLis").val(datpar[0])
		$("#txtDesUbiTecLis").val(datpar[1])
		$.mobile.changePage('#pagListaAvisos')
	}

}

function retornaPapOpc() {
	var opc = $("#hidAviUbiTecOpc").val()
	if (opc == "E")
		$.mobile.changePage('#pagEditarAviso')
	else if (opc == "L")
		$.mobile.changePage('#pagListaAvisos')
}


function obtenerDatosEquipo(ubicacion) {

	var codAvi = $("#txtAvisoCodigo").val()

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaEquipos?ubicacion=" + ubicacion,
		type: "get",
		timeout: 60000,
		async: false,
		beforeSend: function () {
			$("#cargando").show();
			lstAviEquipos.length = 0;
		},
		success: function (data) {

			$("#cargando").hide();
			$("#cbxAvisoEq").empty()
			$("#cbxAvisoEq").append('<option value="">Seleccione Equipo</option>')

			$(data).each(function (i, row) {
				$("#cbxAvisoEq").append('<option value="' + row.Equipo + '">' + row.Equipo + " " + row.Nombre + '</option>')
			})

			if (data.length == 1) {

				$("#cbxAvisoEq").val(data[0].Equipo)
				$("select#cbxAvisoEq").change()
				//$('#cbxAvisoEq').attr("disabled", true);

				var dataEqui = data.filter(x => x.Equipo == data[0].Equipo);

				if (dataEqui.length > 0 && codAvi == "0") {

					$("#txtAvisoPuesto").val(dataEqui[0].Puesto)
					$("#cbxAvisoGr").val(dataEqui[0].Grupo)
					$("#txtAvisoCentroPL").val(dataEqui[0].CentroPL)
					$("#txtAvisoCentroEM").val(dataEqui[0].CentroEM)
					$("#hidAvisoCentroSU").val(dataEqui[0].Centro)
					$("select#cbxAvisoGr").change()
				}
			}
			else {
				$("#cbxAvisoEq").val("")
				$("select#cbxAvisoEq").change()
				//$("#cbxAvisoEq").attr("disabled", false);
			}

			lstAviEquipos = data;
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error: No se encontrador  equipos " + jqXHR)
		}
	});
}

function onchaEquipo(cbxData) {
	var flgCbx = $("#textFlgCbxEqui").val()

	var equipo = cbxData.value;
	var dataEqui = lstAviEquipos.filter(x => x.Equipo == equipo);

	if (dataEqui.length > 0 && flgCbx != "1") {
		$("#txtAvisoPuesto").val(dataEqui[0].Puesto)
		$("#cbxAvisoGr").val(dataEqui[0].Grupo)
		$("#txtAvisoCentroPL").val(dataEqui[0].CentroPL)
		$("#txtAvisoCentroEM").val(dataEqui[0].CentroEM)
		$("#hidAvisoCentroSU").val(dataEqui[0].Centro)
		$("select#cbxAvisoGr").change()
	}

}

function enviarAutorizacion() {

	$("#hidAviEstado").val("2")

	navigator.notification.confirm("Seguro de Aprobar el Aviso?", function (buttonIndex) {
		//onConfirm(buttonIndex, errormsg);
		if (buttonIndex == 1) grabarAviso()
	},)

}




function grabarAviso() {

	var CodAviso = $("#txtAvisoCodigo").val();
	var Titulo = $("#txtAvisoTitulo").val();
	var Tipo = $("#cbxAvisoTip").val();
	//var Descripcion = CodAviso == "0" ? $("#txtAvisoDesc").val() : $("#txtAvisoDescIni").val() + " " + $("#txtAvisoDesc").val();
	var Descripcion = $("#txtAvisoDesc").val();
	var Ubicacion = $("#txtAviCodUbi").val();
	var Equipo = CodAviso == '0' ? $("#cbxAvisoEq").val() : $("#txtAvisoEq").val();
	var Puesto = $("#txtAvisoPuesto").val();
	var Grupo = $("#cbxAvisoGr").val();
	var Centro = $("#txtAvisoCentroPL").val()
	var FInicio = $("#dateAvisoIni").val();
	var FDeseado = $("#dateAvisoDesea").val();
	var Hora = $("#timeAvisoHora").val();
	var Parada = $("#cbxAvisoParada").val()

	if (Ubicacion.trim() == "") {
		navigator.notification.alert("Ingrese código de ubicación")
		return;
	}
	if (Puesto.trim() == "") {
		navigator.notification.alert("Ingrese puesto")
		return;
	}

	if (Grupo == "" || Grupo == null) {
		navigator.notification.alert("Seleccione grupo")
		return;
	}

	if (Centro.trim() == "") {
		navigator.notification.alert("Ingrese Grupo")
		return;
	}

	if (FInicio.length == 0) {
		navigator.notification.alert("Ingrese fecha incio")
		return;
	}

	if (FDeseado.length == 0) {
		navigator.notification.alert("Ingrese fecha deseada")
		return;
	}

	if (Hora.length == 0) {
		navigator.notification.alert("Ingrese hora")
		return
	}

	var AvisoBE = {
		CodAviso: CodAviso,
		Titulo: Titulo,
		Tipo: Tipo,
		Descripcion: Descripcion,
		Ubicacion: Ubicacion,
		Equipo: Equipo,
		Puesto: Puesto,
		Grupo: Grupo,
		Centro: Centro,
		FInicio: FInicio,
		FDeseado: FDeseado,
		Hora: Hora,
		Parada: Parada,
		Usuario: getLocalStorage("susuario"),
		Estado: $("#hidAviEstado").val()
	}

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/MantAviso",
		type: "post",
		timeout: 60000,
		data: AvisoBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			console.log(data)
			$("#cargando").hide();

			if (data.Status != "OK")
				navigator.notification.alert(data.Mensaje)
			else if (data.Status == "OK") {
				if (CodAviso == 0) {
					$("#titEditarAviso").html('Editar Aviso:' + data.Codigo)
					$("#txtAvisoCodigo").val(data.Codigo);
					$('#btnMantRequerimiento').show();
					$('#divDesIni').show();
				}
				var descripcion = $("#txtAvisoDescIni").val() == "" ? $("#txtAvisoDesc").val() : $("#txtAvisoDescIni").val() + "\r\n" + $("#txtAvisoDesc").val();
				$("#txtAvisoDescIni").val("")
				$("#txtAvisoDescIni").val(descripcion)
				$("#txtAvisoDesc").val("")

				if (AvisoBE.Estado != "1") {
					$.mobile.changePage('#pagListaAvisos')
				}
				navigator.notification.alert("Datos registrados")

				listarGestionAvisos()
			}
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error, No se realizo el registro de Aviso")
		}
	});

}


var lstOpeAprobacion = []
function mantAprobacionTecSup(codAviso) {

	$("#titaprobarAviso").html("Aprobaciones Aviso: " + codAviso)
	$("#codAvisoAprobar").val(codAviso)

	var IPorHOST = getIPorHOSTApi();
	var url = IPorHOST + "MttoChimuAPI/ListaAvisoOperacion";


	$.ajax({
		url: url,
		crossDomain: true,
		cache: false,
		type: "Get",
		timeout: 60000,
		data: { codAviso: codAviso },
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			listarOpeAprobar(data)

			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de operación " + jqXHR)

		}
	});
	$.mobile.changePage('#pagAprobSuperTecni')

}

function listarOpeAprobar(data) {

	var html = ""
	var existe = false;
	$(data).each(function (i, row) {

		existe = true;
		var revSuper = '<input type="checkbox" name="checkAproRevSuper"    />';
		var revTecnico = '<input type="checkbox" name="checkAproRevSuperTec"  />';

		html = html + '<tr> ' +
			'<td>' + row.Codigo +
			'<input type ="hidden" name="aproCodOpe" value="' + row.CodOpe + '">' +
			'<input type ="hidden" name="aproCodReq" value="' + row.CodReq + '">' +
			'</td>' +
			'<td>' + row.Modulo + '</td>' +
			'<td>' + row.Operacion + '</td>' +
			'<td>' + row.Ctrl + '</td>' +
			'<td>' + revSuper + '</td>' +
			'</tr>';
	})
	if (!existe) {
		html = html + '<tr><td colspan=7 style="text-align:rigth" >No hay registro...</td></tr>'
	}

	$("#tabAproTecnico").find('tbody').empty();
	$("#tabAproTecnico").find('tbody').append(html);
	$("#tabAproTecnico").trigger('create')
	$("#tabAproTecnico").table("refresh");
	//
	$("#tabAproSuper").find('tbody').empty();
	$("#tabAproSuper").find('tbody').append(html);
	$("#tabAproSuper").trigger('create')
	$("#tabAproSuper").table("refresh");


}



var lstReqOperaciones = []
function mantAvisoRequerimiento(codAviso) {


	if (codAviso == "0") {
		codAviso = $("#txtAvisoCodigo").val()
		var html = '<tr><td colspan=5 style="text-align:rigth" >No hay registros...</td></tr>'
		$("#tblReqOperacion").find('tbody').empty();
		//---Temporarl ----Oculta todos los toggle
		//$(".ui-table-columntoggle-btn").hide()
		$("#tblReqOperacion").find('tbody').append(html);
		$("#tblReqOperacion").trigger('create')

	}


	if (codAviso == "0") {
		navigator.notification.alert("Primero debe registrar el Aviso")
		return
	}
	$("#titEditarReq").html('Aviso: ' + codAviso);
	$("#addOpeMat").html("Agregar Operación")

	obtenerReqOperacion(codAviso)

	$.mobile.changePage('#pagMantRequerimiento')

}

function obtenerReqOperacion(codAviso) {

	var IPorHOST = getIPorHOSTApi();
	var url = IPorHOST + "MttoChimuAPI/AvisoRequerimiento";
	$.ajax({
		url: url,
		crossDomain: true,
		cache: false,
		type: "Get",
		timeout: 60000,
		data: { CodAviso: codAviso },
		beforeSend: function () {
			$("#cargando").show();

		},
		success: function (data) {
			datosAvisoRequerimiento(data)
			$("#cargando").hide();
			return true
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de avisos " + jqXHR)
			return false
		}
	});
	return true

}

function datosAvisoRequerimiento(data) {

	$("#divSupGenOM").hide()

	$("#hidCodReq").val(data.CodReq)
	$("#txtReqDescripcion").val(data.Descripcion)
	$("#txtReqEstado").val(data.ESTADO)

    var codReg = $("#hidCodReq").val()
	if ( codReg =="") codReg = "0";	
	if (dataLogConUsu.Perfil == "MTTO_SUPERV" &&  codReg!= "0")
		$("#divSupGenOM").show()

	if (data.lstOpe.length > 0) {
		listarDataReqOperacion(data.lstOpe)
	}

}

function registrarRegOpeMat() {

	var codReq = $("#hidCodReq").val()
	var codAviso = $("#txtAvisoCodigo").val()
	var reqDescripcion = $("#txtReqDescripcion").val()
	var reqEstado = "CREADO"//$("#txtReqEstado").val()
	var accion = codReq == "0" ? "I" : "U"
	var cusuario = getLocalStorage("cusuario")

	var dataAvisoReq = {
		CodReq: codReq,
		Accion: accion,
		CodAviso: codAviso,
		Descripcion: reqDescripcion,
		Estado: reqEstado,
		Cusuario: cusuario
	}
	if (dataAvisoReq.Descripcion.trim() == "") {
		navigator.notification.alert("Ingrese Descripción")
		return
	}

	var IPorHOST = getIPorHOSTApi();
	var url = IPorHOST + "MttoChimuAPI/MantAvisoRequerimiento";
	$.ajax({
		url: url,
		type: "post",
		timeout: 60000,
		data: dataAvisoReq,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (data.Status == "OK") {
				$("#hidCodReq").val(data.Codigo)
				navigator.notification.alert("Dato registrado correctamente")
				return true
			} else {
				navigator.notification.alert(data.Mensaje)
				return false
			}

		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de avisos " + jqXHR)
			return false

		}
	});

	return true

}

function generarOM() {

	var codavi =  $("#txtAvisoCodigo").val()
	var  estAvi =  $("#hidAviEstado").val()
 
	navigator.notification.confirm("Seguro de Generar OM?", function (buttonIndex) {
		//onConfirm(buttonIndex, errormsg);
		//if (buttonIndex == 1) grabarAviso()

		return
	},)

}

function mantReqOperacion() {

	var codAviso = $("#txtAvisoCodigo").val();
	var codReq = $("#hidCodReq").val();
	var reqDes = $("#txtReqDescripcion").val();
	var estado = "CREADO"//$("#txtReqEstado").val();


	if (codAviso == "0") {
		navigator.notification.alert("Primero debe registrar el Aviso")
		return
	}

	if (codReq.trim() == "") {
		navigator.notification.alert("Debe registrar Requerimiento")
		return
	}

	if (reqDes.trim() == "") {
		navigator.notification.alert("Ingresar Descripción")
		return
	}

	if (estado.trim() == "") {
		navigator.notification.alert("Ingresar estado")
		return
	}



	$.mobile.changePage('#pagEditarReqOperacion')

	$("select#cbxReqOpeCtrl").change()
}

function nuevaReqOperacion() {

	var puesto = $("#txtConPuesto").val()
	var codReq = $("#hidCodReq").val()
	var codAviso = $("#txtAvisoCodigo").val()

	if (codReq == "0" || codReq == "") {
		navigator.notification.alert("Primero debe registrar el requerimiento")
		return
	}


	$("#titEditarReqOpe").html('Aviso :' + codAviso);
	$("#reqOpeLen").html("Operación: ")

	var reqBE = {
		CodReq: codReq,
		CodOpe: 0,
		CodAviso: codAviso,
		Codigo: "",
		Modelo: "",
		DModelo: "",
		Puesto: puesto,
		Operacion: "",
		Ctrl: "PMO1",
		Personas: "",
		Horas: "",
		CodServicio: "",
		DServicio: "",
		Cantidad: "",
		UM: "",
		Precio: "",
		Total: "",
		Solicitante: "",
		Articulo: "",
		Compras: "",
		ESTADO: ""
	}

	$("#hidReqCodigo").val(reqBE.CodReq)
	$("#hidReqCodOpe").val(reqBE.CodOpe)
	$("#txtReqClaveModelo").val(reqBE.Modelo)
	$("#txtReqDesModelo").val(reqBE.DModelo)
	$("#txtReqPuesto").val(reqBE.Puesto)
	$("#txtReqOperacion").val(reqBE.Operacion)
	$("#cbxReqOpeCtrl").val(reqBE.Ctrl)
	$("select#cbxReqOpeCtrl").change()

	$("#txtReqNroPer").val(reqBE.Personas)
	$("#txtReqHoras").val(reqBE.Horas)

	$("#hiddExtCodOperacion").val(reqBE.CodOpe)
	$("#hidReqExtCodigo").val(reqBE.CodReq)
	$("#txtReqExtOperacion").val("")
	$("#hiddExtClaMod").val(reqBE.Modelo)
	$("#hiddExtDesClaMod").val(reqBE.DModelo)
	$("#txtReqCodSer").val(reqBE.CodServicio)
	$("#txtReqServicio").val(reqBE.DServicio)
	$("#txtReqCantidad").val(reqBE.Cantidad)
	$("#txtReqUniMedida").val(reqBE.UM)
	$("#txtReqPrecioRef").val(reqBE.Precio)
	$("#txtReqTotal").val(reqBE.Total)
	$("#txtReqSolicitante").val(reqBE.Solicitante)
	$("#txtReqGrArticulo").val(reqBE.Articulo)
	$("#txtReqGrCompras").val(reqBE.Compras)

	$("#cbxReqOpeCtrl").selectmenu().selectmenu("enable");
	$("#cbxReqOpeCtrl").selectmenu("enable")

	$.mobile.changePage('#pagEditarReqOperacion')


}

function nuevoReqOpeExterno() {

	if ($("#cbxReqOpeCtrl").val() != "PMO3") {
		return
	}
	var reqClaveModelo = $("#txtReqClaveModelo").val()

	if (reqClaveModelo.length == 0) {
		navigator.notification.alert("Ingrese Clave Modelo")
		$("#cbxReqOpeCtrl").val("PMO1")
		$("select#cbxReqOpeCtrl").change()
		return;
	}

	var codReq = $("#hidCodReq").val()
	var codAviso = $("#txtAvisoCodigo").val()
	var modelo = $("#txtReqClaveModelo").val()
	var dModelo = $("#txtReqDesModelo").val()


	$("#hiddExtOpeCtrl").val("PM03")
	var reqBE = {
		CodReq: codReq,
		CodOpe: 0,
		CodAviso: codAviso,
		Codigo: "",
		Modelo: modelo,
		DModelo: dModelo,
		Puesto: "",
		Operacion: "",
		Ctrl: "PMO3",
		Personas: "",
		Horas: "",
		CodServicio: "",
		DServicio: "",
		Cantidad: "",
		UM: "",
		Precio: "",
		Total: "",
		Solicitante: "Ch-Ingenieri",// por defecto
		Articulo: "",
		Compras: "",
		ESTADO: ""
	}
	$("#btnBusSolicitante").prop("disabled", true);

	$("#reqOpeExtLen").html("Operación: ")
	$("#titEditarReqExterno").html('Aviso: ' + codAviso);

	$("#hidReqCodigo").val("")
	$("#hidReqCodOpe").val("")
	$("#txtReqClaveModelo").val("")
	$("#txtReqDesModelo").val("")
	$("#txtReqPuesto").val("")
	$("#txtReqOperacion").val("")
	$("#cbxReqOpeCtrl").val("")
	$("select#cbxReqOpeCtrl").change()
	$("#txtReqNroPer").val("")
	$("#txtReqHoras").val("")

	$("#txtReqExtOperacion").val(reqBE.Operacion)
	$("#hiddExtCodOperacion").val(reqBE.CodOpe)
	$("#hidReqExtCodigo").val(reqBE.CodReq)
	$("#hiddExtClaMod").val(reqBE.Modelo)
	$("#hiddExtDesClaMod").val(reqBE.DModelo)
	$("#txtReqCodSer").val(reqBE.CodServicio)
	$("#txtReqServicio").val(reqBE.DServicio)
	$("#txtReqCantidad").val(reqBE.Cantidad)
	$("#txtReqUniMedida").val(reqBE.UM)
	$("#txtReqPrecioRef").val(reqBE.Precio)
	$("#txtReqTotal").val(reqBE.Total)
	$("#txtReqSolicitante").val(reqBE.Solicitante)
	$("#txtReqGrArticulo").val(reqBE.Articulo)
	$("#txtReqGrCompras").val(reqBE.Compras)

	$.mobile.changePage('#pagEditarReqOpeExterno')



}

function buscarModeloReq(tipo) {

	var moduloBE = {
		STABLA: "MO",
		SITEM: "",
		DITEM: ""
	}
	if (tipo == "COD") {
		moduloBE.SITEM = $("#txtReqClaveModulo").val()
		$("#txtReqClaveModulo").val("")
		$("#txtReqDesModulo").val("")
	}
	else {
		if ($("#txtbusClaMod").val().trim() == "") {
			navigator.notification.alert("Ingresar Descripción Modulo")
			return
		}
		moduloBE.DITEM = $("#txtbusClaMod").val()
	}

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaTipos",
		type: "post",
		timeout: 60000,
		data: moduloBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (tipo == "COD") {
				if (data.length > 0) {
					$("#txtReqClaveModulo").val(data[0].SITEM)
					$("#txtReqDesModulo").val(data[0].DITEM)
				}
			} else {
				listarModeloReq(data)
			}
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de modulo " + jqXHR)
		}
	});

}
function verPagClaModelo() {
	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()
	$.mobile.changePage('#pagReqSelClaMod')

}

function listarModeloReq(data) {

	$("#cargando").show();
	var existe = false;
	var html = ""
	$(data).each(function (i, row) {
		existe = true;
		html = html + '<tr> ' + '<td>' + row.SITEM + '</td>' + '<td>' + row.DITEM + '</td>' + '</tr>';
	})
	if (!existe) {
		html = html + '<tr><td colspan=2 style="text-align:rigth" >No hay registros...</td></tr>'
	}

	$("#tblReqOpeClaMod").find('tbody').empty();
	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()

	$("#tblReqOpeClaMod").find('tbody').append(html);
	$("#tblReqOpeClaMod").trigger('create')
	$("#tblReqOpeClaMod").table("refresh");

	$("#cargando").hide();


}

function buscarServicioReq(tipo) {

	var SerBE = {
		STABLA: "SE",
		SITEM: "",
		DITEM: ""
	}
	if (tipo == "COD") {
		SerBE.SITEM = $("#txtReqClaveModulo").val()
		$("#txtReqCodSer").val("")
		$("#txtReqServicio").val("")
	}
	else {
		if ($("#txtbusServicio").val().trim() == "") {
			navigator.notification.alert("Ingresar Descripción de Servico")
			return
		}
		SerBE.DITEM = $("#txtbusServicio").val()
	}

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaTipos",
		type: "post",
		timeout: 60000,
		data: SerBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (tipo == "COD") {
				if (data.length > 0) {
					$("#txtReqCodSer").val(data[0].SITEM)
					$("#txtReqServicio").val(data[0].DITEM)
				}
			} else {
				listarServicioOpe(data)
			}
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de modulo " + jqXHR)
		}
	});

}

function listarServicioOpe(data) {

	$("#cargando").show();
	var existe = false;
	var html = ""
	$(data).each(function (i, row) {
		existe = true;
		html = html + '<tr> ' + '<td>' + row.SITEM + '</td>' +
			'<td>' + row.DITEM + '</td>' +
			'<td>' + row.SCAMPO + '</td>' +
			'<td>' + row.CVALOR1 + '</td>' +
			'<td>' + row.CVALOR2 + '</td>' +

			'</tr>';
	})
	if (!existe) {
		html = html + '<tr><td colspan=5 style="text-align:rigth" >No hay registros...</td></tr>'
	}

	$("#tblReqOpeSelServ").find('tbody').empty();
	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()
	$("#tblReqOpeSelServ").find('tbody').append(html);
	$("#tblReqOpeSelServ").trigger('create')
	$("#tblReqOpeSelServ").table("refresh");

	$("#cargando").hide();

}

function buscaSolicitante(tipo) {
	var SolBE = {
		STABLA: "US",
		SITEM: "",
		DITEM: ""
	}
	if (tipo == "COD") {
		SolBE.SITEM = $("#txtReqClaveModulo").val()
		$("#txtReqSolicitante").val("")
	}
	else {
		if ($("#txtbusSolicitante").val().trim() == "") {
			navigator.notification.alert("Ingresar Descripción solicitante")
			return
		}
		SolBE.SITEM = $("#txtbusSolicitante").val()
	}

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaTipos",
		type: "post",
		timeout: 60000,
		data: SolBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (tipo == "COD") {
				if (data.length > 0) {
					$("#txtReqSolicitante").val(data[0].SITEM)

				}
			} else {
				listaOpeSolicitante(data)
			}
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de modulo " + jqXHR)
		}
	});
}

function listaOpeSolicitante(data) {
	//console.log(data)
	$("#cargando").show();
	var existe = false;
	var html = ""
	$(data).each(function (i, row) {
		existe = true;
		html = html + '<tr> ' + '<td>' + row.SITEM + '</td>' + '<td>' + row.DITEM + '</td>' + '</tr>';
	})
	if (!existe) {
		html = html + '<tr><td colspan=2 style="text-align:rigth" >No hay registros...</td></tr>'
	}

	$("#tblOpeSol").find('tbody').empty();
	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()

	$("#tblOpeSol").find('tbody').append(html);
	$("#tblOpeSol").trigger('create')
	$("#tblOpeSol").table("refresh");

	$("#cargando").hide();



}


var lstServicios = []
function editarRepOpeExt(codOper) {

	$("#cbxReqOpeCtrl").selectmenu().selectmenu("disable");

	var data = lstReqOperaciones.filter(x => x.CodOpe == codOper);
	var codAviso = $("#txtAvisoCodigo").val()

	$("#hidOpeCtrlIni").val("")

	$("cbxReqOpeCtrl").attr('disabled', 'disabled');

	if (data[0].Ctrl == "PMO3") {



		$("#hiddExtCodOperacion").val(codOper)
		$("#hidReqExtCodigo").val(data[0].Codigo)
		$("#hiddExtOpeCtrl").val(data[0].Ctrl)
		$("#hiddExtClaMod").val(data[0].Modelo)
		$("#hiddExtDesClaMod").val(data[0].DModelo)

		$("#txtReqExtOperacion").val(data[0].Operacion)
		$("#txtReqCodSer").val(data[0].CodServicio)
		$("#txtReqServicio").val(data[0].DServicio)
		$("#txtReqCantidad").val(data[0].Cantidad)
		$("#txtReqUniMedida").val(data[0].UM)
		$("#txtReqPrecioRef").val(data[0].Precio)
		$("#txtReqTotal").val(data[0].Total)
		$("#txtReqSolicitante").val(data[0].Solicitante)
		$("#txtReqGrArticulo").val(data[0].Articulo)
		$("#txtReqGrCompras").val(data[0].Compras)

		$("#reqOpeExtLen").html("Operación: " + data[0].Codigo)
		$("#titEditarReqExterno").html('Aviso: ' + codAviso);

		$.mobile.changePage('#pagEditarReqOpeExterno')


	} else {
		//console.log(data[0])
		$("#cbxReqOpeCtrl").selectmenu("disable")
		$("#hidReqCodOpe").val(codOper)
		$("#hidReqCodigo").val(data[0].CodReq)
		$("#txtReqClaveModelo").val(data[0].Modelo)
		$("#txtReqDesModelo").val(data[0].DModelo)
		$("#txtReqPuesto").val(data[0].Puesto)
		$("#txtReqOperacion").val(data[0].Operacion)
		$("#cbxReqOpeCtrl").val("PMO1")
		$("select#cbxReqOpeCtrl").change()
		$("#txtReqNroPer").val(data[0].Personas)
		$("#txtReqHoras").val(data[0].Horas)

		$("#titEditarReqOpe").html('Aviso: ' + codAviso);
		$("#reqOpeLen").html("Operación: " + data[0].Codigo)

		$.mobile.changePage('#pagEditarReqOperacion')
	}

}

function grabarReqOperacion() {


	var codOpe = $("#hidReqCodOpe").val();
	var codReq = $("#hidReqCodigo").val()
	var codAviso = $("#txtAvisoCodigo").val()



	var reqBE = {
		CodReq: codReq,
		CodOpe: codOpe,
		Accion: codOpe == "0" ? "I" : "U",
		CodAviso: codAviso,
		Modelo: $("#txtReqClaveModelo").val(),
		DModelo: $("#txtReqDesModelo").val(),
		Puesto: $("#txtReqPuesto").val(),
		Operacion: $("#txtReqOperacion").val(),
		Ctrl: "PMO1",
		Personas: $("#txtReqNroPer").val(),
		Horas: $("#txtReqHoras").val(),
		CodServicio: "",
		DServicio: "",
		Cantidad: "",
		UM: "",
		Precio: "",
		Total: "",
		Solicitante: "",
		Articulo: "",
		Compras: "",
		ESTADO: "",
		Cusuario: getLocalStorage("cusuario")
	}

	if (reqBE.Modelo.trim() == "") {
		navigator.notification.alert("Ingrese Modelo")
		return
	}

	if (reqBE.Operacion.trim() == "") {
		navigator.notification.alert("Ingrese Operación")
		return
	}

	if (reqBE.Personas == "") {
		navigator.notification.alert("Ingrese Nro de personas")
		return
	}
	if (reqBE.Horas == "") {
		navigator.notification.alert("Ingrese Nro de horas")
		return
	}
	//console.log(reqBE)
	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/MantAvisoOperacion",
		type: "post",
		timeout: 60000,
		data: reqBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (data.Status == "OK") {
				$.mobile.changePage('#pagMantRequerimiento')
				obtenerOpeOperaciones(codAviso)
			} else {
				navigator.notification.alert(data.Mensaje)
			}

		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error al registrar los datos de operación " + jqXHR)


		}
	});

}


function retornaDataClaMod(checkparametro) {
	var datpar = checkparametro.value.split(";")
	$("#txtReqClaveModulo").val(datpar[0])
	$("#txtReqDesModulo").val(datpar[1])

	$.mobile.changePage('#pagEditarReqOperacion')
}


function obtenerOpeClavaModulo(moduloBE) {

}


function onchOpeExtCanPre() {
	var cantidad = $("#txtReqCantidad").val()
	var precio = $("#txtReqPrecioRef").val()
	if (cantidad == "") cantidad = 0
	if (precio == "") cantidad = 0
	$("#txtReqTotal").val(parseFloat(cantidad) * parseFloat(precio))

}

function grabarReqOpeExterno() {

	var codReq = $("#hidCodReq").val();
	var codOpe = $("#hiddExtCodOperacion").val()
	var codAviso = $("#txtAvisoCodigo").val()

	var reqBE = {
		CodReq: codReq,
		CodOpe: codOpe,
		Accion: codOpe == "0" ? "I" : "U",
		CodAviso: codAviso,
		Modelo: $("#hiddExtClaMod").val(),
		DModelo: $("#hiddExtDesClaMod").val(),
		Puesto: "",
		Operacion: $("#txtReqExtOperacion").val(),
		Ctrl: "PMO3",
		Personas: "",
		Horas: "",
		CodServicio: $("#txtReqCodSer").val(),
		DServicio: $("#txtReqServicio").val(),
		Cantidad: $("#txtReqCantidad").val(),
		UM: $("#txtReqUniMedida").val(),
		Precio: $("#txtReqPrecioRef").val(),
		Total: $("#txtReqTotal").val(),
		Solicitante: $("#txtReqSolicitante").val(),
		Articulo: $("#txtReqGrArticulo").val(),
		Compras: $("#txtReqGrCompras").val(),
		ESTADO: "",
		Cusuario: getLocalStorage("cusuario")
	}

	if (reqBE.Operacion.trim() == "") {
		navigator.notification.alert("Ingrese operación")
		return
	}

	if (reqBE.CodServicio.trim() == "") {
		navigator.notification.alert("Ingrese código de servicio")
		return
	}
	if (reqBE.Cantidad == "") {
		navigator.notification.alert("Ingrese cantidad")
		return
	}
	if (reqBE.Precio == "") {
		navigator.notification.alert("Ingrese Precio")
		return
	}

	if (reqBE.Solicitante == "") {
		navigator.notification.alert("Ingrese codigo de Solicitante")
		return
	}
	//console.log(reqBE)
	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/MantAvisoOperacion",
		type: "post",
		timeout: 60000,
		data: reqBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (data.Status == "OK") {
				$.mobile.changePage('#pagMantRequerimiento')
				obtenerOpeOperaciones(codAviso)
			} else {
				navigator.notification.alert(data.Mensaje)

			}

		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error al registrar los datos de operación " + jqXHR)


		}
	});

}

function obtenerListaServcios() {

	var avisoBE = {
		CodAviso: $("#txtAviAviso").val(),
		Centro: $("#txtConCentro").val(),
		Puesto: $("#txtConPuesto").val(),
		Grupo: $("#cbxAviGrupo").val(),
		Ubicacion: $("#cbxAviUbicacion").val()
	};
	var IPorHOST = getIPorHOSTApi();
	var url = IPorHOST + "MttoChimuAPI/ListaMateriales";
	$.ajax({
		url: url,
		type: "post",
		timeout: 60000,
		data: avisoBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
			lstServicios.length = 0
		},
		success: function (data) {
			lstServicios = data;
			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de avisos")
		}
	});

}

function onchBuscaServicios(txtData) {

	var codDatServ = txtData.value

	var servBE = {
		STABLA: "SE",
		SITEM: codDatServ,
		DITEM: ""
	}
	//async: false,
	obtenerOpeExtServicos(servBE)

	var data = lstServicios;
	if (data.length == 0 && codDatServ != "") {
		$("#txtReqCodSer").val("")
		$("#txtReqServicio").val("")
		$("#txtReqUniMedida").val("")
		$("#txtReqGrArticulo").val("")
		$("#txtReqGrCompras").val("")

		navigator.notification.alert("Datos no encotrados")
		return
	}
	else if (data.length != 0 && codDatServ != "") {
		$("#txtReqCodSer").val(data[0].SITEM)
		$("#txtReqServicio").val(data[0].DITEM)
		$("#txtReqUniMedida").val(data[0].SCAMPO)
		$("#txtReqGrArticulo").val(data[0].CVALOR1)
		$("#txtReqGrCompras").val(data[0].CVALOR2)
	}
}



function obtenerOpeExtServicos(servBE) {

	var IPorHOST = getIPorHOSTApi();
	var url = IPorHOST + "MttoChimuAPI/ListaTipos";
	$.ajax({
		url: url,
		type: "post",
		async: false,
		timeout: 60000,
		data: servBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
			lstServicios.length = 0
		},
		success: function (data) {
			if (data.length > 0) {
				lstServicios = data;
			}
			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de Servicio " + jqXHR)
		}
	});

}

function retornaDataSevicios(checkparametro) {

	var datpar = checkparametro.value.split(";")
	$("#txtReqCodSer").val(datpar[0])
	$("#txtReqServicio").val(datpar[1])
	$("#txtReqUniMedida").val(datpar[2])
	$("#txtReqGrArticulo").val(datpar[3])
	$("#txtReqGrCompras").val(datpar[4])

	$.mobile.changePage('#pagEditarReqOpeExterno')

}



var lstOpeSolicitante = [];
function obtenerOpeSolicitante(soliBE) {

	var IPorHOST = getIPorHOSTApi();
	var url = IPorHOST + "MttoChimuAPI/ListaTipos";
	$.ajax({
		url: url,
		type: "post",
		async: false,
		timeout: 60000,
		data: soliBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
			lstOpeSolicitante.length = 0
		},
		success: function (data) {
			if (data.length > 0) {
				lstOpeSolicitante = data;
			}
			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos del solicitante " + jqXHR)
		}
	});

}


function eliminarOpeItem(btn) {

	var tds = $(btn).closest("tr")

	var codOpe = tds.find("input[name='reqOpeCodOpe']").val()
	var codReq = tds.find("input[name='reqOpeCodReq']").val()
	var codAviso = $("#txtAvisoCodigo").val();

	var reqBE = {
		CodOpe: codOpe,
		CodReq: codReq,
		Accion: "D"
	}

	if (registrarReqOpeaciones(reqBE, codAviso))
		$(btn).closest("tr").remove();
}

function registrarReqOpeaciones(reqBE, codAviso) {

	var IPorHOST = getIPorHOSTApi();
	var url = IPorHOST + "MttoChimuAPI/MantAvisoOperacion";

	$.ajax({
		url: url,
		type: "post",
		timeout: 60000,
		data: reqBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (data.Status == "OK") {
				//
				obtenerOpeOperaciones(codAviso)
				$("hidReqCodOpe").val(data.Codigo)
				navigator.notification.alert("Dato registrado correctamente")
				return true
			} else {
				navigator.notification.alert(data.Mensaje)
				return false
			}

		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error al registrar los datos de operación " + jqXHR)
			return false

		}
	});

	return true
}

function obtenerOpeOperaciones(codAviso) {

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaAvisoOperacion",
		crossDomain: true,
		cache: false,
		type: "Get",
		timeout: 60000,
		data: { CodAviso: codAviso },
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			listarDataReqOperacion(data)

		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de Operaciones " + jqXHR)

		}
	});
}

function listarDataReqOperacion(data) {
	var perUsu = lstPerUsu.find(x => x.SMODULO == "GestionAviso")

	lstReqOperaciones = []
	lstReqOperaciones = data

	var html = ""
	var existe = false;
	$(data).each(function (i, row) {
		existe = true;
		var modVer = "";
		var eliminar = "";
		var material = "";
		if (perUsu.IMODIFICAR == "1")
			modVer = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-edit ui-btn-icon-notext ui-btn-b ui-mini" onClick="editarRepOpeExt(\'' + row.CodOpe + '\')"></a>'
		else if (perUsu.ICONSULTAR == "1" && perUsu.IMODIFICAR != "1")
			modVer = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-eye ui-btn-icon-notext ui-btn-c ui-mini" onClick="editarRepOpeExt(\'' + row.CodOpe + '\')"></a>'

		material = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-bars ui-btn-icon-notext ui-btn-d ui-mini" onClick="gestionReqMaterial(\'' + row.CodOpe + ";" + row.Codigo + ";" + row.CodReq + '\')"></a>'

		if (perUsu.IELIMINAR == "1")
			eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliminarOpeItem(this)"></a>'

		html = html + '<tr> ' +
			'<td>' + row.Codigo +
			'<input type="hidden" name="reqOpeCodOpe" value="' + row.CodOpe + '">' +
			'<input type="hidden" name="reqOpeCodReq" value="' + row.CodReq + '">' +
			'</td>' +
			'<td>' + row.Operacion + '</td>' +
			'<td>' + row.Ctrl + '</td>' +
			'<td>' + modVer + "&nbsp;" + material + "&nbsp;" + eliminar + '</td>' +
			'</tr>';
	})
	if (!existe) {
		html = html + '<tr><td colspan=4 style="text-align:rigth" >No hay registro...</td></tr>'
	}
	$("#tblReqOperacion").find('tbody').empty();
	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()

	$("#tblReqOperacion").find('tbody').append(html);
	$("#tblReqOperacion").trigger('create')
	$("#tblReqOperacion").table("refresh");


}

var lstReqMateriales = []
function gestionReqMaterial(parametros) {

	// lista materiales 
	var parametro = parametros.split(";")

	var codReqOpe = parametro[0]
	var codigoOpe = parametro[1]
	var codReq = parametro[2]

	$.mobile.changePage('#pagReqMaterial')

	$("#titEditarReqMante").html("Materiales - Ope: " + codigoOpe)
	$("#hidReqMatCodOperacion").val(codReqOpe)
	$("#hidReqMatCodReq").val(codReq)

	$("#hidReqMatCodigo").val(codigoOpe)

	obtenerOpeMateriales(codReq, codReqOpe)
}

function obtenerOpeMateriales(codReq, codReqOpe) {

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaAvisoMaterial",
		crossDomain: true,
		cache: false,
		type: "Get",
		timeout: 60000,
		data: { codreq: codReq, codope: codReqOpe },
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			listarDataReqMateriales(data)
			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de materiales" + jqXHR)

		}
	});
}


var lstMateriales = [];
function mantReqMaterial(codOpeMat) {

	var codReqOpe = $("#hidReqMatCodOperacion").val()
	var codReq = $("#hidReqMatCodReq").val()
	var codigoOpe = $("#hidReqMatCodigo").val()

	var centro = $("#hidAvisoCentroSU").val()

	$("#titEditarReqMat").html("Operación:" + codigoOpe)

	if (codOpeMat == "0") {

		$("#txtCodMat").val("")
		$("#hidMatCodOperacion").val(codReqOpe)
		$("#hidMatCodReq").val(codReq)
		$("#txtMatCodigo").val("")
		$("#txtMatDesc").val("")
		$("#txtMatUniMed").val("")
		$("#txtMatCantidad").val("")
		$("#txtMatLote").val("L")
		$("#txtMatCentro").val(centro)
		$("#txtMatAlmacen").val("")

		$("#postMat").html("Material ")
	}
	else if (codOpeMat != "0") {
		var data = lstReqMateriales.filter(x => x.CodMat == codOpeMat);

		$("#txtCodMat").val(codOpeMat)
		$("#hidMatCodOperacion").val(data[0].CodOpe)
		$("#hidMatCodReq").val(data[0].CodReq)
		$("#txtMatCodigo").val(data[0].CodMaterial)
		$("#txtMatDesc").val(data[0].DesMaterial)
		$("#txtMatUniMed").val(data[0].UM)
		$("#txtMatCantidad").val(data[0].Cantidad)
		$("#txtMatLote").val(data[0].Lote)
		$("#txtMatCentro").val(data[0].Centro)
		$("#txtMatAlmacen").val(data[0].Almacen)

		$("#postMat").html("Material: ")
	}

	$.mobile.changePage('#pagEditarReqMaterial')

}

function verPagMateriales() {

	if ($("#txtMatCentro").val().trim() == "") {
		navigator.notification.alert("Ingresar centro")
		$("#txtMatCodigo").val("")
		return
	}

	$.mobile.changePage('#pagReqSelMaterial')

	if ($("#hidDatCentro").val() != $("#txtMatCentro").val()) {
		$("#txtbusMaterial").val("")
		var html = '<tr><td colspan=4 style="text-align:rigth" >No hay registros...</td></tr>'

		$("#tblReqSelMat").find('tbody').empty();
		//---Temporarl ----Oculta todos los toggle
		//$(".ui-table-columntoggle-btn").hide()

		$("#tblReqSelMat").find('tbody').append(html);
		$("#tblReqSelMat").trigger('create')
		$("#tblReqSelMat").table("refresh");
	}


}
function verificarMaterial(dataInput) {

	if ($("#txtMatCodigo").val() != "") {
		navigator.notification.alert("Ingresar código de material")
		$("#txtMatCodigo").val("")
		$("#txtMatDesc").val("")
	}
}

function buscaMaterial(tipo) {

	var centro = $("#txtMatCentro").val()
	if (centro.trim() == "") {
		navigator.notification.alert("Ingresar centro")
		$("#txtMatCodigo").val("")
		$("#txtMatDesc").val("")
		return
	}

	var materialBE = {
		Centro: centro,
		Codigo: "",
		Descripcion: ""
	}

	if (tipo == "COD") {
		materialBE.Codigo = $("#txtMatCodigo").val()
		$("#txtMatCodigo").val("")
		$("#txtMatDesc").val("")
	}
	else {
		if ($("#txtbusMaterial").val().trim() == "") {
			navigator.notification.alert("Ingresar Descripción de material")
			return
		}
		materialBE.Descripcion = $("#txtbusMaterial").val()
	}

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaMateriales",
		type: "post",
		timeout: 60000,
		data: materialBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
			lstMateriales.length = 0
		},
		success: function (data) {
			$("#cargando").hide();
			if (tipo == "COD") {
				if (data.length > 0) {
					$("#txtMatCodigo").val(data[0].Codigo)
					$("#txtMatDesc").val(data[0].Descripcion)
				}
			} else {
				listarMaterialesOpe(data)
			}
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de materiales " + jqXHR)
		}
	});

}

function listarMaterialesOpe(data) {
	//lstMateriales = data;
	$("#hidDatCentro").val("")
	$("#cargando").show();

	var existe = false;
	var html = ""
	$(data).each(function (i, row) {
		existe = true;
		html = html + '<tr> ' + '<td>' + row.Codigo + '</td>' +
			'<td>' + row.Descripcion + '</td>' +
			'<td>' + row.UM + '</td>' +
			'<td>' + row.Lote + '</td>' +
			'</tr>';
	})
	if (!existe) {
		html = html + '<tr><td colspan=4 style="text-align:rigth" >No hay registros...</td></tr>'
	}
	else {
		$("#hidDatCentro").val($("#txtMatCentro").val())
	}


	$("#tblReqSelMat").find('tbody').empty();
	$("#tblReqSelMat").find('tbody').append(html);
	$("#tblReqSelMat").trigger('create')
	$("#tblReqSelMat").table("refresh");

	$("#cargando").hide();


}

function listaDetMat() {

	$("#tblReqSelMat").find('tbody').empty();
	$("#txtbusMaterial").val("")
	$.mobile.changePage('#pagReqSelMaterial')


}

function retornaDataMaterial(checkparametro) {
	var datpar = checkparametro.value.split(";")

	$("#txtMatCodigo").val(datpar[0])
	$("#txtMatDesc").val(datpar[1])
	$("#txtMatUniMed").val(datpar[2])
	$("#txtMatLote").val(datpar[3])

	$.mobile.changePage('#pagEditarReqMaterial')
}

function obtenerDataMateriales(materialBE) {


	var IPorHOST = getIPorHOSTApi();
	var url = IPorHOST + "MttoChimuAPI/ListaMateriales";
	$.ajax({
		url: url,
		type: "post",
		async: false,
		timeout: 60000,
		data: materialBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
			lstMateriales.length = 0
		},
		success: function (data) {
			if (data.length > 0) {
				lstMateriales = data
			}
			$("#cargando").hide();
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de materiales " + jqXHR)
		}
	});

}

function addReqMaterial() {

	var codOpeMat = $("#txtCodMat").val()
	if (codOpeMat == "")
		codOpeMat = "0"

	var codReq = $("#hidMatCodReq").val()
	var codReqOpe = $("#hidMatCodOperacion").val()

	var reqBE = {
		CodMat: codOpeMat,
		Accion: codOpeMat == 0 ? "I" : "U",
		CodOpe: $("#hidMatCodOperacion").val(),
		CodReq: $("#hidMatCodReq").val(),
		CodMaterial: $("#txtMatCodigo").val(),
		DesMaterial: $("#txtMatDesc").val(),
		UM: $("#txtMatUniMed").val(),
		Cantidad: $("#txtMatCantidad").val(),
		Lote: $("#txtMatLote").val(),
		Centro: $("#txtMatCentro").val(),
		Almacen: $("#txtMatAlmacen").val(),
		Cusuario: getLocalStorage("cusuario")
	}

	if (reqBE.Centro.trim() == "") {
		navigator.notification.alert("Ingresar centro")
		return
	}
	if (reqBE.Almacen.trim() == "") {
		navigator.notification.alert("Ingresar Almacen")
		return
	}

	if (reqBE.CodMaterial == "") {
		navigator.notification.alert("Ingresar código de material")
		return
	}
	if (reqBE.UM == "") {
		navigator.notification.alert("Ingresar UM")
		return
	}
	if (reqBE.Cantidad == "" || reqBE.Cantidad == "0") {
		navigator.notification.alert("Ingresar Cantidad")
		return
	}
	if (reqBE.Lote.trim() == "") {
		navigator.notification.alert("Ingresar lote")
		return
	}


	registraReqMaterial(reqBE, codReqOpe, codReq)

}

function eliminarMatItem(btn) {
	var tds = $(btn).closest("tr")
	var codMat = tds.find("input[name='reqMatCodMat']").val()
	var codOpe = tds.find("input[name='reqMatCodOpe']").val()
	var codReq = tds.find("input[name='reqMatCodReq']").val()

	var reqBE = {
		CodMat: codMat,
		CodOpe: codOpe,
		CodReq: codReq,
		Accion: "D"
	}

	if (registraReqMaterial(reqBE, codOpe, codReq))
		$(btn).closest("tr").remove();

}

function registraReqMaterial(reqBE, codOpe, codReq) {

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/MantAvisoMaterial",
		type: "post",
		timeout: 60000,
		data: reqBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (data.Status == "OK") {
				obtenerOpeMateriales(codReq, codOpe)
				$.mobile.changePage('#pagReqMaterial')
				return true

			} else {
				navigator.notification.alert(data.Mensaje)
				return false
			}
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Datos de materiales no registrados" + jqXHR)
			return false

		}
	});
	return true
}

function listarDataReqMateriales(data) {
	var perUsu = lstPerUsu.find(x => x.SMODULO == "GestionAviso")

	lstReqMateriales = []
	lstReqMateriales = data

	var html = ""
	var existe = false;
	$(data).each(function (i, row) {
		existe = true;
		var modver = ""
		var eliminar = ""
		if (perUsu.IMODIFICAR == "1")
			modver = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-edit ui-btn-icon-notext ui-btn-b ui-mini" onClick="mantReqMaterial(\'' + row.CodMat + '\')"></a>'
		else if (perUsu.ICONSULTAR == "1" && perUsu.IMODIFICAR != "1")
			modver = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-eye ui-btn-icon-notext ui-btn-c ui-mini" onClick="mantReqMaterial(\'' + row.CodMat + '\')"></a>'

		if (perUsu.IELIMINAR == "1")
			eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliminarMatItem(this)"></a>'

		var almacen = row.Almacen == null ? "" : row.Almacen;
		html = html + '<tr> ' +
			'<td>' + row.CodMaterial +
			'<input type="hidden" name="reqMatCodMat" value="' + row.CodMat + '">' +
			'<input type="hidden" name="reqMatCodOpe" value="' + row.CodOpe + '">' +
			'<input type="hidden" name="reqMatCodReq" value="' + row.CodReq + '">' +
			'</td>' +
			'<td>' + row.DesMaterial + '</td>' +
			'<td>' + row.UM + '</td>' +
			'<td>' + row.Cantidad + '</td>' +
			'<td>' + row.Lote + '</td>' +
			'<td>' + row.Centro + '</td>' +
			'<td>' + almacen + '</td>' +
			'<td>' + modver + "&nbsp;" + eliminar + '</td>' +
			'</tr>';

	})
	if (!existe) {
		html = html + '<tr><td colspan=8 style="text-align:rigth" >No hay registro...</td></tr>'
	}

	$("#tblReqMaterial").find('tbody').empty();
	//---Temporarl ----Oculta todos los toggle
	//$(".ui-table-columntoggle-btn").hide()

	$("#tblReqMaterial").find('tbody').append(html);
	$("#tblReqMaterial").trigger('create')
	$("#tblReqMaterial").table("refresh");

}
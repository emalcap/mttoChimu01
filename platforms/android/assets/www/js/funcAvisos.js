//Avisos
function gestionAviso() {

	//Activa los valores Iniciales
	$("#hidAvisoInicio").val("N")
	$("#ulAvisoFiltro").show()
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
	if (perUsu.ICONSULTAR == "1" && (perUsu.IAGREGAR != "1" || perUsu.IAGREGAR == "1")) {
		$("#btnEditAviso").prop("disabled", false);
		$("#btnMantRequerimiento").prop("disabled", false);
		$("#btnAvisoGrabar").prop("disabled", false);


		$("#btnRegOpe").prop("disabled", true);
		$("#btnRegOpeExt").prop("disabled", true);
		$("#btnNueMat").prop("disabled", true);
		$("#btnRegOpeMat").prop("disabled", true);
	}

	//LLena daos maestros
	maestrosAviso()


}

function maestrosAviso() {

	$("#cbxAviGrupo,#cbxAviUbicacion,#cbxAvisoTip,#cbxAvisoUb,#cbxAvisoGr").empty()

	if ($("#cbxConGrupo").children('option').length > 2) {
		$("#cbxAviGrupo").append('<option value="">Seleccione Grupo</option>')
		$("#cbxAviGrupo").append('<option value="0">Todos</option>')
	}

	$("#cbxAvisoTip").append('<option value="">Seleccione Item</option>')

	if (dataLogConUsu.Tipos != null) {
		var lstTipos = lstMaestros.filter(x => x.STABLA == "TIPO")
		var datos = dataLogConUsu.Tipos.split("|");
		for (i = 0; i < datos.length; i++) {
			var find = lstTipos.find(x => x.SITEM == datos[i])
			if (find != null)
				$("#cbxAvisoTip").append('<option value="' + find.SITEM + '">' + find.SITEM + " " + find.DITEM + '</option>')
		}
		if (datos.length == 1)
			$("#cbxAvisoTip").val(datos[0])
	}
	$("select#cbxAvisoTip").change()

	if (dataLogConUsu.Grupos != null) {
		var datos = dataLogConUsu.Grupos.split("|");
		for (i = 0; i < datos.length; i++) {
			$("#cbxAviGrupo").append('<option value="' + datos[i] + '">' + datos[i] + '</option>')
		}
		if (datos.length == 1) {
			$("#cbxAviGrupo").val(datos[0])
		}
	}
	$("select#cbxAviGrupo").change()
	// para editar aviso 
	var lstGrupos = lstMaestros.filter(x => x.STABLA == "GRUPO")

	$(lstGrupos).each(function (index, row) {
		$("#cbxAvisoGr").append('<option value="' + row.SITEM + '">' + row.SITEM + '</option>')
	});
	var grupSelec = $("#cbxConGrupo").val()
	var grupconf = dataLogConUsu.Grupos
	//console.log(grupconf)
	if (grupSelec != "")
		$("#cbxAvisoGr").val(grupSelec)
	else if (grupconf != null)
		if (grupconf.length > 0)
			$("#cbxAvisoGr").val(grupconf.split("|")[0])

	var ubiSelCong = $("#cbxConUbicacion").val()
	var ubiConfi = dataLogConUsu.Ubicaciones
	if (ubiSelCong != "")
		$("#txtAviCodUbiTecLis").val(ubiSelCong)
	else if (ubiConfi != null)
		if (ubiConfi.length > 0)
			$("#txtAviCodUbiTecLis").val(ubiConfi.split("|")[0])

	$("select#cbxAviGrupo,#cbxAvisoTip,select#cbxAvisoGr").change()



}

var lstAvisos = []
function listarGestionAvisos() {

	var grupos = ""
	var ubi = $("#txtAviCodUbiTecLis").val()
	//Verifica si las ubicaciones estan en las asignadas

	var datos = dataLogConUsu.Ubicaciones.split("|");

	var existeU = false
	for (i = 0; i < datos.length; i++) {
		if (ubi.indexOf(datos[i], ubi) >= 0) existeU = true
	}
	if (!existeU) {
		navigator.notification.alert("El Usuario no tiene asignado esta Ubicación")
		return
	}

	$("#txtFilter").val("")

	if ($("#cbxAviGrupo").val() == "0" || $("#cbxAviGrupo").val() == "") {
		$("#cbxAviGrupo > option").each(function () {
			if (this.value != "" && this.value != "0") grupos = grupos == "" ? this.value : grupos + '|' + this.value
		});
	} else
		grupos = $("#cbxAviGrupo").val()


	var ubicaciones = ubi
	var lstUbi = lstMaestros.filter(x => x.STABLA == "UBITEC")
	if (ubi == "") {
		$(lstUbi).each(function (i, row) {
			ubicaciones = ubicaciones == "" ? row.SITEM : ubicaciones + "|" + row.SITEM
		})
	}
	else {

		ubicaciones = ubi.toUpperCase()
		$(lstUbi).each(function (i, row) {
			if (row.SITEM.indexOf(ubi) == 0)
				ubicaciones = ubicaciones == "" ? row.SITEM : ubicaciones + "|" + row.SITEM
		})
		if (ubicaciones == ubi.toUpperCase()) {
			navigator.notification.alert("El Usuario no tiene asignado esta Ubicación")
			return
		}
	}

	var avisoBE = {
		CodAviso: $("#txtAviAviso").val(),
		Centro: $("#txtConCentro").val(), //"3904"
		Puesto: $("#txtConPuesto").val(),     //'PRY-TECN',
		Grupo: grupos,    //'C51',
		Ubicacion: ubicaciones,  //'PC-PI-M-SUL-00001',
		perfil: dataLogConUsu.Perfil,
		Tipo: dataLogConUsu.Tipos
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

function verFiltroAviso(accion) {

	if ($('#ulAvisoFiltro').is(':visible')) {
		$('#ulAvisoFiltro').hide()
	} else {
		$('#ulAvisoFiltro').show()
	}

	if (accion == 'B')
		$('#txtFilAv').focus();

}

function listarAvisos(data) {

	$("#ulAvisos").html("")

	var html = "" //'<li data-theme="b" > <h2>....</h2><p><strong>...</strong></p><p>...</p><p class="ui-li-aside"><strong>...</strong></p></li>'
	var existe = false;

	$(data).each(function (i, row) {
		existe = true;
		var colorFila = row.Estado == "1" ? "red" : row.Estado == "3" ? "#B5B2B2" : "";


		html = html + '<li data-theme="b" style="color:' + colorFila + '" onclick="editarAviso(' + row.CodAviso + ')"> ' +
			' <p style="float:right;fon"><strong>' + row.CodAviso + '</strong></p>' +
			' <h2>' + row.Ubicacion + '</h2> ' +
			' <p><strong>' + row.Titulo + '</strong></p>' +
			' <p style="float:left;">' + row.FInicio + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- &nbsp;&nbsp;&nbsp;' + row.Tipo + '</p> <p style="float:right;">' + row.DEstado + '</p>' +

			'</li>'
	})


	if (!existe) {
		html = html + '<li data-theme="b" > <h2>....</h2><p><strong>...</strong></p><p style="float:left;">...</p> <p style="float:right;">...</p><p class="ui-li-aside"><strong>...</strong></p></li>'
	}
	$("#ulAvisos").html(html)
	$('#ulAvisos').listview('refresh');

	if (data.length > 0) {
		verFiltroAviso('N')
		$('#ulAvisoFiltro').hide()
	}
	else {
		verFiltroAviso('N')
		$('#ulAvisoFiltro').show()
	}

}

function editarAviso(codigoAviso) {
	//estado : 1.- Pendiente,2.-Evaluando,3.-Asignado,4.- Cerrado

	//inicializa
	$("#cbxAvisoTip").selectmenu().selectmenu("enable");
	$("#cbxAvisoTip").selectmenu().selectmenu("disable");

	$("#cbxAvisoPuesto").selectmenu().selectmenu("enable");
	$("#cbxAvisoPuesto").selectmenu().selectmenu("disable");
	$("#cbxAvisoGr").selectmenu().selectmenu("enable");
	$("#cbxAvisoGr").selectmenu().selectmenu("disable");

	$("#cbxAvisoPuesto").selectmenu("enable");
	$("#cbxAvisoGr").selectmenu("enable");

	$("#hidFlgAviCentroPT").val("")
	$("#hidFlgAvisoPuesto").val("")
	$("#hidFlgAviCentroPL").val("")

	//supervisor muestra opcion para Autorizar
	$("#txtAviDesEstado").show()
	$("#divSupAut").hide()
	$("#txtAviOM").hide()
	$("#hidAviOM").val("")

	$('#cbxAvisoParada').slider()

	var arrayTipos = null;
	if (dataLogConUsu.Tipos.length > 0)
		arrayTipos = dataLogConUsu.Tipos.split("|")
	var opcTipo = -1;


	$("#txtAvisoTitulo").prop("readonly", false);
	$("#txtAvisoCentroPT").prop("readonly", false);

	$("#txtAvisoCentroPL").prop("readonly", false);
	$("#dateAvisoIni").prop("readonly", false);
	$("#timeAvisoHora").prop("readonly", false);
	$("#dateAvisoDesea").prop("readonly", false);


	$("#txtAviCodUbi").prop("readonly", false);
	$("#txtAvisoEqu").prop("readonly", false);

	$("#btnBusUbiEdit").prop("disabled", false);
	$("#btnBusEqui").prop("disabled", false);
	$("#btnBusPtoCentro").prop("disabled", false);

	$("#cbxAvisoParada").attr("disabled", false);

	if (codigoAviso == "") {

		$("#txtAvisoDescIni").val("Pendiente")
		$("#txtAviDesEstado").html("Estado:   <span style='font-size:17px;color: darkblue;'>PENDIENTE</span>")


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

		if ($("#cbxConTipo").val() != "")
			$("#cbxAvisoTip").val($("#cbxConTipo").val());
		else if (dataLogConUsu.Tipos.split("|").length > 0)
			$("#cbxAvisoTip").val(dataLogConUsu.Tipos.split("|")[0])
		else
			$("#cbxAvisoTip").val("")

		$("#txtAviCodUbi").val("");
		$("#txtAvisoEqu").val("");

		if ($("#cbxConGrupo").val() != "")
			$("#cbxAvisoGr").val($("#cbxConGrupo").val());
		else if (dataLogConUsu.Grupos.split("|").length > 0)
			$("#cbxAvisoGr").val(dataLogConUsu.Grupos.split("|")[0]);
		else
			$("#cbxAvisoGr").val("");

		$("#txtAvisoCentroPT").val(dataLogConUsu.Centro)
		obtenerCbxPtoTra(dataLogConUsu.Centro, dataLogConUsu.Puesto, "AVI")
		//$("#cbxAvisoPuesto").val(dataLogConUsu.Puesto)

		$("#txtAvisoCentroPL").val(dataLogConUsu.Centro)

		$("#dateAvisoIni").val(fecha);
		$("#dateAvisoDesea").val(fecha);
		$("#timeAvisoHora").val(horaAct);
		$("#hidAviEstado").val("1")

		$("#cbxAvisoParada").val("0").slider('refresh')
		$(".ui-slider-switch").removeClass("ui-state-disabled");

		$("#cbxAvisoTip").selectmenu("enable");

	}
	else if (codigoAviso !== "") {

		var dataAviso = lstAvisos.filter(x => x.CodAviso == codigoAviso);
		//console.log(dataAviso)
		$("#titEditarAviso").html('Editar Aviso: ' + codigoAviso)
		opcTipo = -1
		if (dataLogConUsu.Perfil == "MTTOSUPERV" || dataLogConUsu.Perfil == "MTTOTECN") {
			opcTipo = arrayTipos.indexOf("Z3")
		}
		if (dataLogConUsu.Perfil == "MTTO_SUPERV" && dataAviso[0].Estado == "1") {
			$("#divSupAut").show()
			//$("#txtAviDesEstado").hide()
			$("#txtAviOM").hide()
		}
		// con OM  solamente visualizar operaciones y materiales 
		var perUsu = lstPerUsu.find(x => x.SMODULO == "GestionAviso")
		if (perUsu.IAGREGAR = 1 && dataAviso[0].Estado == 3) {
			$("#btnNueOpe").prop("disabled", true);
			$("#btnRegOpe").prop("disabled", true);
			$("#btnRegOpeExt").prop("disabled", true);
			$("#btnNueMat").prop("disabled", true);
			$("#btnRegOpeMat").prop("disabled", true);
		}

		if (perUsu.IAGREGAR = 1 && dataAviso[0].Estado != 3) {
			$("#btnNueOpe").prop("disabled", false);
			$("#btnRegOpe").prop("disabled", false);
			$("#btnRegOpeExt").prop("disabled", false);
			$("#btnNueMat").prop("disabled", false);
			$("#btnRegOpeMat").prop("disabled", false);
		}
		if (dataAviso[0].Estado == 3) {
			$("#txtAviOM").show()
			$("#hidAviOM").val(dataAviso[0].Orden)
			//$("#txtAviDesEstado").hide()
		}
		//estado : 1.- Pendiente,2.-Evaluando,3.-Asignado,4.- Cerrado
		$("#txtAviDesEstado").html("Estado:   <span style='font-size:17px;color: darkblue;'>" + dataAviso[0].DEstado + "</span>")

		$("#txtAviOM").html("<span style='font-size:17px;color: darkblue;'>" + dataAviso[0].Orden + "</span>")

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

		$("#dateAvisoIni").val("")
		$("#dateAvisoDesea").val("")
		if (dataAviso[0].FInicio != "") {
			var arrayD = dataAviso[0].FInicio.split("/")
			$("#dateAvisoIni").val(arrayD[2] + "-" + arrayD[1] + "-" + arrayD[0])
		}
		if (dataAviso[0].FDeseado != "") {
			var arrayD = dataAviso[0].FDeseado.split("/")
			$("#dateAvisoDesea").val(arrayD[2] + "-" + arrayD[1] + "-" + arrayD[0])
		}

		$("#timeAvisoHora").val(hora)
		$("#txtAviCodUbi").val(dataAviso[0].Ubicacion)

		$("#hidFlgAviCentroPT").val(dataAviso[0].CentroPT)
		$("#hidFlgAvisoPuesto").val(dataAviso[0].Puesto)
		$("#hidFlgAviCentroPL").val(dataAviso[0].Centro)

		$("#txtAvisoCentroPT").val(dataAviso[0].CentroPT)
		obtenerCbxPtoTra(dataAviso[0].CentroPT, dataAviso[0].Puesto, "AVI")
		//$("#cbxAvisoPuesto").val(dataAviso[0].Puesto)
		$("#txtAvisoCentroPL").val(dataAviso[0].Centro)
		$("#hidAviEstado").val(dataAviso[0].Estado)

		$("#cbxAvisoTip").val(dataAviso[0].Tipo);
		$("select#cbxAvisoTip").change()
		$("#txtAvisoEqu").val(dataAviso[0].Equipo)

		$("#cbxAvisoGr").val(dataAviso[0].Grupo)

		$("#cbxAvisoParada").val(dataAviso[0].Parada).slider('refresh')
		//$(".ui-state-disabled").removeClass("ui-state-disabled");

		$("#cbxAvisoTip").selectmenu("disable");


		if (dataAviso[0].Estado > 2) {

			$("#txtAviCodUbi").prop("readonly", true);
			$("#txtAvisoEqu").prop("readonly", true);

			$("#btnBusUbiEdit").prop("disabled", true);
			$("#btnBusEqui").prop("disabled", true);

			//// 
			$("#txtAvisoTitulo").prop("readonly", true);
			$("#txtAvisoCentroPT").prop("readonly", true);
			$("#txtAvisoCentroPL").prop("readonly", true);
			$("#dateAvisoIni").prop("readonly", true);
			$("#timeAvisoHora").prop("readonly", true);
			$("#dateAvisoDesea").prop("readonly", true);

			$("#cbxAvisoPuesto").selectmenu("disable");
			$("#cbxAvisoGr").selectmenu("disable");

			$("#cbxAvisoParada").attr("disabled", true);
			$(".ui-slider-switch").addClass("ui-state-disabled");

			$("#btnBusPtoCentro").prop("disabled", true);


		}


		//Obtiene datos del equipo
		onchanEquiBusUbi()

	}



	$("select#cbxAvisoTip,select#cbxAvisoGr").change()

	$.mobile.changePage('#pagEditarAviso')

}


function onchaBusUbiTecList(txtData) {

	var codUbi = txtData.value
	if (codUbi.trim() == "") {
		return;
	}

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
	if (codUbi.trim() == "") {
		$("#txtAvisoEqu").val("")
		return;

	}
	var lstData = lstMaestros.filter(x => x.STABLA == "UBITEC");
	var data = lstData.filter(u => u.SITEM == codUbi);
	if (data.length == 0) {
		$("#txtAviCodUbi").val("")
		$("#txtAvisoEqu").val("")
		navigator.notification.alert("Ubicación no asignada al Usuario")
		return
	}
	obtenerDatosEquipo(codUbi)
}


function verPaginaUbicaciones(opc) {
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

function retornaPagOpc() {
	var opc = $("#hidAviUbiTecOpc").val()

	if (opc == "E")
		$.mobile.changePage('#pagEditarAviso')
	else if (opc == "L")
		$.mobile.changePage('#pagListaAvisos')
	else if (opc == "OM")
		$.mobile.changePage('#pagGestionOM')
}

function obteneEquiposUbi() {
	var ubiTec = $("#txtObtenerEquiUbi").val()
	if (ubiTec == "") {
		navigator.notification.alert("Ingrese Ubicación ")
		return
	}

	var lstData = lstMaestros.filter(x => x.STABLA == "UBITEC");
	var data = lstData.filter(u => u.SITEM == ubiTec);
	if (data.length == 0) {
		$("#txtObtenerEquiUbi").val("")
		navigator.notification.alert("Ubicación no asignada al Usuario")
		return
	}
	obtenerDatosEquipo(ubiTec)
}


var equipoUbi = [];
function obtenerDatosEquipo(ubicacion) {

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaEquipos?ubicacion=" + ubicacion,
		type: "get",
		timeout: 60000,
		beforeSend: function () {
			$("#cargando").show();
			lstAviEquipos.length = 0;
		},
		success: function (data) {
			$("#cargando").hide();
			listaEquiposUbicacion("U", "L", ubicacion, data)

		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error: No se encontrador  equipos " + jqXHR)
		}
	});
}

function datosPorEquipoEditAviso(equipo) {

	$("#tblAviEquipos tbody tr").each(function (index, row) {
		var codEquipo = $(row).find("td").find("input[name='txtEquipo']").val()
		var grupo = $(row).find("td").find("input[name='txtGrupo']").val()
		var puestoT = $(row).find("td").find("input[name='txtPuestoT']").val()
		var centroPL = $(row).find("td").find("input[name='txtCentroPL']").val()
		var centroPT = $(row).find("td").find("input[name='txtCentroPT']").val()
		var ubiTec = $(row).find("td").find("input[name='txtUbicacion']").val()
		//$(row).find("td").find("input[name='txtCentroEM']").val()
		//$(row).find("td").find("input[name='txtDesEquipo']").val()
		//$(row).find("td").find("input[name='txtAlmacenSU']").val()
		//$(row).find("td").find("input[name='txtCentroSU']").val()
		if (codEquipo == equipo) {
			$("#txtAviCodUbi").val(ubiTec)
			$("#cbxAvisoGr").val(grupo)
			$("select#cbxAvisoGr").change()


			$("#txtAvisoCentroPL").val(centroPL)
			$("#txtAvisoCentroPT").val(centroPT)
			obtenerCbxPtoTra(centroPT, puestoT, "AVI")
			//$("#cbxAvisoPuesto").val(puestoT)

			$("#txtAvisoEqu").val(equipo)


		}
	})

	$.mobile.changePage('#pagEditarAviso')
}


function onchanEquiBusUbi() {

	var equipo = $("#txtAvisoEqu").val()
	if (equipo == "") return

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/VerEquipo?equipo=" + equipo,
		type: "get",
		timeout: 60000,
		beforeSend: function () {
			$("#cargando").show();
			lstAviEquipos.length = 0;
		},
		success: function (data) {
			$("#cargando").hide();

			if (data == null || data.Ubicacion == null || data.Ubicacion == "") {
				navigator.notification.alert("No se encontró el código del equipo")
				$("#txtAvisoEqu").val("")
				return
			}
			var lstUbiUsu = dataLogConUsu.Ubicaciones.split("|")
			var valor = 0;
			$(lstUbiUsu).each(function (i, row) {
				if (data.Ubicacion.includes(row))
					valor = valor + 1
			})
			if (valor == 0) {
				navigator.notification.alert("El usuario no tiene asignado la Ubicación: " + data.Ubicacion)
				$("#txtAviCodUbi").val("")
				$("#txtAvisoEqu").val("")
				return

			}

			listaEquiposUbicacion("E", "L", data.Ubicacion, data)


		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error: No se encontro  equipos " + jqXHR)
		}
	});

}

function listaEquiposUbicacion(opc, tipo, ubicacion, data) {

	if (opc == "U" && data.length == 0) {
		$("#txtAvisoEqu").val("")
		$("#txtAviCodUbi").val("")
		navigator.notification.alert("Ubicación no exsite  ")
		return
	}

	$("#txtObtenerEquiUbi").val(ubicacion)
	if (opc == "U" && data.length > 1) $("#txtAvisoEqu").val("")

	if (opc == "U" && data.length == 1) {

		$("#cbxAvisoGr").val(data[0].Grupo)
		$("select#cbxAvisoGr").change()

		$("#txtAvisoCentroPT").val(data[0].CentroPT)
		obtenerCbxPtoTra(data[0].CentroPT, data[0].Puesto, "AVI")
		//$("#cbxAvisoPuesto").val(data[0].Puesto)	

		$("#txtAvisoCentroPL").val(data[0].CentroPL)
		$("#txtAvisoEqu").val(data[0].Equipo)
		$("#txtAviCodUbi").val(data[0].Ubicacion)

		equipoUbi = data[0]

	}
	// equipo 1 a  1
	if (opc == "E") {
		$("#cbxAvisoGr").val(data.Grupo)
		$("select#cbxAvisoGr").change()
		// centro PT
		var centroPt = $("#hidFlgAviCentroPT").val()
		if (centroPt != "")
			$("#txtAvisoCentroPT").val(centroPt)
		else
			centroPt = data.CentroPT

		$("#txtAvisoCentroPT").val(centroPt)
		// puesto
		var flgPuesto = $("#hidFlgAvisoPuesto").val()
		if (flgPuesto == "")
			flgPuesto = data.Puesto
		obtenerCbxPtoTra(centroPt, flgPuesto, "AVI")
		//$("#cbxAvisoPuesto").val(data.Puesto)	
		$("#txtAvisoCentroPL").val($("#hidFlgAviCentroPL").val())
		if ($("#hidFlgAviCentroPL").val() == "")
			$("#txtAvisoCentroPL").val(data.CentroPL)

		$("#txtAvisoEqu").val(data.Equipo)
		$("#txtAviCodUbi").val(data.Ubicacion)
		//lipiar lfg 
		$("#hidFlgAviCentroPT").val("")
		$("#hidFlgAvisoPuesto").val("")
		$("#hidFlgAviCentroPL").val("")


		equipoUbi = data

	}

	var html = ""
	var existe = false;
	if (tipo != "N") {
		$(data).each(function (index, row) {
			existe = true;
			html = html + '<tr> ' +
				'<td>' + row.Equipo +
				'<input type="hidden" name="txtGrupo" value="' + row.Grupo + '">' +
				'<input type="hidden" name="txtPuestoT" value="' + row.Puesto + '">' +
				'<input type="hidden" name="txtCentroPL" value="' + row.CentroPL + '">' +
				'<input type="hidden" name="txtCentroEM" value="' + row.CentroEM + '">' +
				'<input type="hidden" name="txtEquipo" value="' + row.Equipo + '">' +
				'<input type="hidden" name="txtDesEquipo" value="' + row.Nombre + '">' +
				'<input type="hidden" name="txtAlmacenSU" value="' + row.Almacen + '">' +
				'<input type="hidden" name="txtCentroSU" value="' + row.CentroSU + '">' +
				'<input type="hidden" name="txtCentroPT" value="' + row.CentroPT + '">' +
				'<input type="hidden" name="txtUbicacion" value="' + row.Ubicacion + '">' +
				'</td>' +
				'<td>' + row.Ubicacion + '</td>' +
				'</tr>';
		})
	}


	if (!existe) {
		html = html + '<tr><td colspan=2 style="text-align:rigth" >No hay registros...</td></tr>'
	}

	$("#tblAviEquipos").find('tbody').empty();
	$("#tblAviEquipos").find('tbody').append(html);
	$("#tblAviEquipos").trigger('create')

}

function mostrarPagEquiUbi() {

	if ($("#txtAviCodUbi").val() == "") {
		var html = "";
		html = html + '<tr><td colspan=2 style="text-align:rigth" >No hay registros...</td></tr>'

		$("#tblAviEquipos").find('tbody').empty();
		$("#tblAviEquipos").find('tbody').append(html);
		$("#tblAviEquipos").trigger('create')
		$("#txtObtenerEquiUbi").val("")
	}
	else if ($("#txtAviCodUbi").val() != "") {
		obtenerDatosEquipo($("#txtAviCodUbi").val())
	}

	$("#txtBusEquipo").val("")

	$.mobile.changePage('#pagAviSelEquipo')
}


function enviarAutorizacion() {

	$("#hidAviEstado").val("2")

	navigator.notification.confirm("Seguro de Autorizar el Aviso?", function (buttonIndex) {
		//onConfirm(buttonIndex, errormsg);
		if (buttonIndex == 1) grabarAviso()
	},)

}

function onchaObtPuestoAvi(obj) {

	if (obj.value == "") return

	var centro = lstCentros.find(x => x.SITEM == obj.value)
	if (centro == null) {
		$("#txtAvisoCentroPT").val("")
		$("#cbxAvisoPuesto").val("")
		$("select#cbxAvisoPuesto").change()
		navigator.notification.alert("Error, el Pto. centro ingresado no existe")
	}
	obtenerCbxPtoTra(obj.value, "", "AVI")

}


function grabarAviso() {

	var codAviso = $("#txtAvisoCodigo").val();
	var titulo = $("#txtAvisoTitulo").val();
	var tipo = $("#cbxAvisoTip").val();
	var descripcion = $("#txtAvisoDesc").val();
	var ubicacion = $("#txtAviCodUbi").val();
	var equipo = $("#txtAvisoEqu").val();
	var puesto = $("#cbxAvisoPuesto").val();
	var grupo = $("#cbxAvisoGr").val();
	var centro = $("#txtAvisoCentroPL").val()
	var centroPT = $("#txtAvisoCentroPT").val()
	var fInicio = $("#dateAvisoIni").val();
	var fDeseado = $("#dateAvisoDesea").val();
	var hora = $("#timeAvisoHora").val();
	var parada = $("#cbxAvisoParada").val()

	if (titulo == "") {
		navigator.notification.alert("Ingrese Titulo")
		return;
	}

	if (tipo == "") {
		navigator.notification.alert("Ingrese Tipo")
		return;
	}

	/*if (ubicacion.trim() == "") {
		navigator.notification.alert("Ingrese código de ubicación")
		return;
	}
  */
	if (centro.trim() == "") {
		navigator.notification.alert("Ingrese Pto. Centro")
		return;
	}

	if (puesto.trim() == "") {
		navigator.notification.alert("Seleccione Pto. Trabajo")
		return;
	}

	if (grupo == "" || grupo == null) {
		navigator.notification.alert("Seleccione grupo")
		return;
	}

	/*if (Centro.trim() == "") {
		navigator.notification.alert("Ingrese Centro")
		return;
	}*/

	if (fInicio.length == 0) {
		navigator.notification.alert("Ingrese fecha incio")
		return;
	}

	if (fDeseado.length == 0) {
		navigator.notification.alert("Ingrese fecha deseada")
		return;
	}

	if (hora.length == 0) {
		navigator.notification.alert("Ingrese hora")
		return
	}

	var AvisoBE = {
		CodAviso: codAviso,
		Titulo: titulo,
		Tipo: tipo,
		Descripcion: descripcion,
		Ubicacion: ubicacion,
		Equipo: equipo,
		Puesto: puesto,
		Grupo: grupo,
		Centro: centro,
		CentroPT: centroPT,
		FInicio: fInicio,
		FDeseado: fDeseado,
		Hora: hora,
		Parada: parada,
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

			$("#cargando").hide();

			if (data.Status != "OK")
				navigator.notification.alert(data.Mensaje)
			else if (data.Status == "OK") {
				if (codAviso == 0) {
					$("#titEditarAviso").html('Editar Aviso:' + data.Codigo)
					$("#txtAvisoCodigo").val(data.Codigo);
					$('#btnMantRequerimiento').show();
					$('#divDesIni').show();
					navigator.notification.alert("Se ha creado el aviso Nro. " + data.Codigo + "\r\n" + data.Mensaje)
				}
				else {
					navigator.notification.alert("Datos grabados correctamente \r\n" + data.Mensaje)
				}

				var descripcion = $("#txtAvisoDescIni").val() == "" ? $("#txtAvisoDesc").val() : $("#txtAvisoDescIni").val() + "\r\n" + $("#txtAvisoDesc").val();
				$("#txtAvisoDescIni").val("")
				$("#txtAvisoDescIni").val(descripcion)
				$("#txtAvisoDesc").val("")

				$.mobile.changePage('#pagListaAvisos')

				listarGestionAvisos("C")
			}
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error, No se realizo el registro de Aviso")
		}
	});

}



var lstReqOperaciones = []
function mantAvisoRequerimiento(codAviso) {

	if (codAviso == "0") {
		codAviso = $("#txtAvisoCodigo").val()
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
			$("#cargando").hide();
			datosAvisoRequerimiento(data)


		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtenere datos de avisos " + jqXHR)
			return false
		}
	});


}

function datosAvisoRequerimiento(data) {

	$("#divSupGenOM").hide()

	$("#hidCodReq").val(data.CodReq)

	$("#txtReqEstado").val(data.ESTADO)

	var codReg = $("#hidCodReq").val()
	if (codReg == "") codReg = "0";
	//estado 2 autorizado 3 GOM
	if (dataLogConUsu.Perfil == "MTTO_SUPERV" && codReg != "0" && $("#hidAviEstado").val() == "2")
		$("#divSupGenOM").show()

	$("#hidNroAviOpe").val("0")
	if (data.lstOpe.length > 0)
		$("#hidNroAviOpe").val(data.lstOpe.length)

	listarDataReqOperacion(data.lstOpe)

}

function registrarReqOperacion() {

	var codReq = $("#hidCodReq").val()
	var codAviso = $("#txtAvisoCodigo").val()
	var reqEstado = "CREADO"//$("#txtReqEstado").val()
	var accion = codReq == "0" ? "I" : ""
	var cusuario = getLocalStorage("cusuario")

	var dataAvisoReq = {
		CodReq: codReq,
		Accion: accion,
		CodAviso: codAviso,
		Estado: reqEstado,
		Cusuario: cusuario
	}

	/*****   validar dator operacion  */

	var reqBE = {
		CodAviso: codAviso,
		Modelo: $("#txtReqClaveModelo").val(),
		DModelo: $("#txtReqDesModelo").val(),
		Centro: $("#txtReqCentro").val(),
		Puesto: $("#cbxReqPuesto").val(),
		Ctrl: "PM01",
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

	if (reqBE.Personas == "") {
		navigator.notification.alert("Ingrese Nro de personas")
		return
	}
	if (reqBE.Horas == "") {
		navigator.notification.alert("Ingrese Duración")
		return
	}
	if (reqBE.Centro.trim() == "") {
		navigator.notification.alert("Ingrese Pto. Centro")
		return
	}
	if (reqBE.Puesto.trim() == "") {
		navigator.notification.alert("Seleccione Pto. Trabajo")
		return
	}


	if (accion == "I") {

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
					grabarReqOperacion(reqBE, codAviso)
				} else {
					navigator.notification.alert(data.Mensaje)
				}

			},
			error: function (jqXHR, exception) {
				$("#cargando").hide();
				navigator.notification.alert("Error: no se registro Requerimiento Operaciones " + jqXHR)

			}
		});
	}
	else
		grabarReqOperacion(reqBE, codAviso)

}

function grabarReqOperacion(reqBE, codAviso) {
	var codReq = $("#hidCodReq").val();
	var codOpe = $("#hidReqCodOpe").val();
	$("#hidReqCodigo").val(codReq)
	//var codAviso = $("#txtAvisoCodigo").val()
	reqBE.CodReq = codReq,
		reqBE.CodOpe = codOpe,
		reqBE.Accion = codOpe == "0" ? "I" : "U",


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

function generarOM() {
	var contar = 0;
	contar = $("#hidNroAviOpe").val();

	if (contar == 0) {
		navigator.notification.alert("El requeriminto no tiene operaciones")
		return
	}
	$("#titDatOM").html("Aviso: " + $("#txtAvisoCodigo").val())
	
	$("#cbxClaOM,#cbxClaACOM,#cbxPriOM").empty()
	var lstClasOrd = lstMaestros.filter(x => x.STABLA == "CLASEORDEN")
	$("#cbxClaOM").append('<option value="">Seleccione Clase</option>')
	$(lstClasOrd).each(function (index, row) {
		$("#cbxClaOM").append('<option value="' + row.SITEM + '">' + row.SITEM + "&nbsp;-&nbsp;" + row.DITEM + '</option>')
	});

	$("#cbxClaACOM").append('<option value="">Seleccione Clase AC</option>')	

	var lstPrio = lstMaestros.filter(x => x.STABLA == "PRIORIDAD")	
	$("#cbxPriOM").append('<option value="">Seleccione Prioridad</option>')
	$(lstPrio).each(function (index, row) {
		$("#cbxPriOM").append('<option value="' + row.SITEM + '">'+ row.DITEM + '</option>')
	});
	$("select#cbxClaOM,select#cbxClaACOM,select#cbxPriOM").change()

	$.mobile.changePage('#pagPopIGeneraOM')

	
$("#txtTituloOM").val($("#txtAvisoTitulo").val())

}
function onchaCargClaAC(){

	var claOrd = $("#cbxClaOM").val()
	if (claOrd =="") return ;
	$("#cbxClaACOM").empty()

	var lstClasAC = lstMaestros.filter(x => x.STABLA == "CLASEACT" && x.SCAMPO ==claOrd )
	$("#cbxClaACOM").append('<option value="">Seleccione Clase AC</option>')
	$(lstClasAC).each(function (index, row) {
		$("#cbxClaACOM").append('<option value="' + row.SITEM + '">' + row.SITEM + "&nbsp;-&nbsp;" + row.DITEM + '</option>')
	});
	$("select#cbxClaACOM").change()
	
}


function grabarGenerarOM() {

	var claOM = $("#cbxClaOM").val()
	var claACOM = $("#cbxClaACOM").val()
	var prio = $("#cbxPriOM").val()
	var titOM = $("#txtTituloOM").val()

	if (claOM == "") { 
		navigator.notification.alert("Seleccione Clase de Orden")
		return
	}
	if (claACOM == "") {
		navigator.notification.alert("Seleccione Clase AC")
		return
	}
	if (prio == "") {
		navigator.notification.alert("Seleccione Prioridad")
		return
	}
	if (titOM  =="") {
		navigator.notification.alert("Ingrese Titulo ")
		return
	}	


	var codAvi = $("#txtAvisoCodigo").val()
	var estAvi = $("#hidAviEstado").val()

	var dataAviso = lstAvisos.find(x => x.CodAviso == codAvi);

	var avisoBE = {
		CodAviso: dataAviso.CodAviso,
		Centro: dataAviso.Centro,
		Titulo: titOM, //dataAviso.Titulo,
		Equipo: dataAviso.Equipo,
		FInicio: dataAviso.FInicio,
		Grupo: dataAviso.Grupo,
		Puesto: dataAviso.Puesto,
		Ubicacion: dataAviso.Ubicacion,
		Clase: claOM,
		ClaseAC: claACOM,
		Prioridad: prio,
		Cusuario: getLocalStorage("cusuario")
	}

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/GenerarOM",
		type: "post",
		timeout: 60000,
		data: avisoBE,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show();
		},
		success: function (data) {
			$("#cargando").hide();
			if (data.Status != "OK")
				navigator.notification.alert(data.Mensaje)
			else if (data.Status == "OK") {
				navigator.notification.alert("Se ha creado OM:" + data.Codigo + "\r\n" + data.Mensaje)

				$.mobile.changePage('#pagListaAvisos')
				listarGestionAvisos("C")
			}
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Error, No se Genero OM")
		}
	});

}

function mantReqOperacion() {

	var codAviso = $("#txtAvisoCodigo").val();
	var codReq = $("#hidCodReq").val();

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

	var puesto = $("#cbxAvisoPuesto").val()
	var codReq = $("#hidCodReq").val()
	var codAviso = $("#txtAvisoCodigo").val()
	var centro = $("#txtAvisoCentroPT").val()

	$("#titEditarReqOpe").html('Aviso :' + codAviso);
	$("#reqOpeLen").html("N° Operación: ")

	var reqBE = {
		CodReq: codReq,
		CodOpe: 0,
		CodAviso: codAviso,
		Codigo: "",
		Modelo: "",
		DModelo: "",
		Puesto: "",
		Centro: centro,
		Ctrl: "PM01",
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

	$("#txtReqCentro").val(reqBE.Centro)
	if (reqBE.Centro != "")
		obtenerCbxPtoTra(centro, puesto, 'OPE')
	//$("#cbxReqPuesto").val(reqBE.Puesto)

	$("#cbxReqOpeCtrl").val(reqBE.Ctrl)
	$("select#cbxReqOpeCtrl").change()

	$("#txtReqNroPer").val(reqBE.Personas)
	$("#txtReqHoras").val(reqBE.Horas)
	$("#txtReqTrabajo").val("")

	$("#hiddExtCodOperacion").val(reqBE.CodOpe)
	$("#hidReqExtCodigo").val(reqBE.CodReq)


	$("#txtExtClaMod").val(reqBE.Modelo)
	$("#txtExtDesClaMod").val(reqBE.DModelo)
	$("#txtReqCodSer").val(reqBE.CodServicio)
	$("#txtReqServicio").val(reqBE.DServicio)
	$("#txtReqCantidad").val(reqBE.Cantidad)
	$("#txtReqUniMedida").val(reqBE.UM)
	$("#txtReqPrecioRef").val(reqBE.Precio)
	$("#txtReqTotal").val(reqBE.Total)
	$("#txtReqSolicitante").val(reqBE.Solicitante)
	$("#txtReqGrArticulo").val(reqBE.Articulo)
	$("#txtReqGrCompras").val(reqBE.Compras)
	$("#txtReqExtCentro").val("")// ope
	$("#txtReqExtPuesto").val("") //ope


	$("#cbxReqOpeCtrl").selectmenu().selectmenu("enable");
	$("#cbxReqOpeCtrl").selectmenu("enable")

	$.mobile.changePage('#pagEditarReqOperacion')


}

function nuevoReqOpeExterno() {


	$("#txtReqExtCentro").prop("readonly", false);
	$("#txtReqExtPuesto").prop("readonly", false);

	if ($("#cbxReqOpeCtrl").val() != "PM03") {
		return
	}

	var codReq = $("#hidCodReq").val()
	var codAviso = $("#txtAvisoCodigo").val()

	$("#hiddExtOpeCtrl").val("PM03")
	var reqBE = {
		CodReq: codReq,
		CodOpe: 0,
		CodAviso: codAviso,
		Codigo: "",
		Modelo: "",
		DModelo: $("#txtbusClaMod").val(),// suguiere la ultima descripcion del modelo
		Centro: "3904",
		Puesto: "MTO-EXTE",
		Operacion: "",
		Ctrl: "PM03",
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
	$("#txtExtDesClaMod").val("")
	$("#cbxReqPuesto").val("")
	$("#txtReqExtPuesto").val("")

	$("#cbxReqOpeCtrl").val("")
	$("select#cbxReqOpeCtrl").change()
	$("#txtReqNroPer").val("")
	$("#txtReqHoras").val("")


	$("#hiddExtCodOperacion").val(reqBE.CodOpe)
	$("#hidReqExtCodigo").val(reqBE.CodReq)

	$("#txtReqExtCentro").val(reqBE.Centro)
	$("#txtReqExtPuesto").val(reqBE.Puesto)

	$("#txtExtDesClaMod").val(reqBE.DModelo)
	$("#txtReqCodSer").val(reqBE.CodServicio)
	$("#txtReqServicio").val(reqBE.DServicio)
	$("#txtReqCantidad").val(reqBE.Cantidad)
	$("#txtReqUniMedida").val(reqBE.UM)
	$("#txtReqPrecioRef").val(reqBE.Precio)
	$("#txtReqTotal").val(reqBE.Total)
	$("#txtReqSolicitante").val(reqBE.Solicitante)
	$("#txtReqGrArticulo").val(reqBE.Articulo)
	$("#txtReqGrCompras").val(reqBE.Compras)

	$("#txtReqExtCentro").prop("readonly", true);
	$("#txtReqExtPuesto").prop("readonly", true);

	$.mobile.changePage('#pagEditarReqOpeExterno')

}

function onchanTrabReal() {

	var nroPer = $("#txtReqNroPer").val()
	var nroHor = $("#txtReqHoras").val()

	if (nroPer == "") nroPer = 0
	if (nroHor == "") nroHor = 0
	var nroPerEntero = nroPer.toString().split(".")
	var nroHorUndec = nroHor.toString().split(".")

	if (nroPerEntero[1] != undefined)
		if (nroPerEntero[1].length > 0) {
			$("#txtReqNroPer").val("")
			$("#txtReqTrabajo").val("")
			navigator.notification.alert("Nro. Personas solo valores enteros")
			return
		}
	if (nroHorUndec[1] != undefined)
		if (nroHorUndec[1].length > 1) {
			$("#txtReqHoras").val("")
			$("#txtReqTrabajo").val("")
			navigator.notification.alert("Duración solo un decimal")
			return
		}

	$("#txtReqTrabajo").val((parseFloat(nroPer) * parseFloat(nroHor)).toFixed(1))


}


function buscarModeloReq(tipo) {

	$("#txtBusModelo").val("")
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
			navigator.notification.alert("Ingrese descripción")
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
function verPagClaModelo(tipo) {
	$("#hidTipoRetModelo").val(tipo)

	$.mobile.changePage('#pagReqSelClaMod')

}

function verPagReqOpeSelServ() {
	$.mobile.changePage('#pagReqOpeSelServ')

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

	$("#txtReqExtCentro").prop("readonly", false);
	$("#txtReqExtPuesto").prop("readonly", false);
	if (data[0].Ctrl == "PM03") {

		$("#hiddExtCodOperacion").val(codOper)
		$("#hidReqExtCodigo").val(data[0].Codigo)
		$("#hiddExtOpeCtrl").val(data[0].Ctrl)

		$("#txtReqCodSer").val(data[0].CodServicio)
		$("#txtReqServicio").val(data[0].DServicio)

		$("#txtExtClaMod").val(data[0].Modelo)
		$("#txtExtDesClaMod").val(data[0].DModelo)

		$("#txtReqCantidad").val(data[0].Cantidad)
		$("#txtReqUniMedida").val(data[0].UM)
		$("#txtReqPrecioRef").val(data[0].Precio)
		$("#txtReqTotal").val(data[0].Total)
		$("#txtReqSolicitante").val(data[0].Solicitante)
		$("#txtReqGrArticulo").val(data[0].Articulo)
		$("#txtReqGrCompras").val(data[0].Compras)

		$("#txtReqExtCentro").val(data[0].Centro)
		$("#txtReqExtPuesto").val(data[0].Puesto)

		$("#reqOpeExtLen").html("Operación: " + data[0].Codigo)
		$("#titEditarReqExterno").html('Aviso: ' + codAviso);

		$("#txtReqExtCentro").prop("readonly", true);
		$("#txtReqExtPuesto").prop("readonly", true);


		$.mobile.changePage('#pagEditarReqOpeExterno')


	} else {

		//console.log(data[0])
		$("#cbxReqOpeCtrl").selectmenu("disable")
		$("#hidReqCodOpe").val(codOper)
		$("#hidReqCodigo").val(data[0].CodReq)
		$("#txtReqClaveModelo").val(data[0].Modelo)
		$("#txtReqDesModelo").val(data[0].DModelo)
		$("#txtReqCentro").val(data[0].Centro)
		obtenerCbxPtoTra(data[0].Centro, data[0].Puesto, "OPE")
		//$("#cbxReqPuesto").val(data[0].Puesto)

		$("#cbxReqOpeCtrl").val("PM01")
		$("select#cbxReqOpeCtrl").change()
		$("#txtReqNroPer").val(data[0].Personas)
		$("#txtReqHoras").val(data[0].Horas)
		var pers = data[0].Personas
		var horas = data[0].Horas
		var trabajo = pers * horas
		$("#txtReqTrabajo").val((parseFloat(trabajo)).toFixed(2))

		$("#txtReqTrabajo").val()

		$("#titEditarReqOpe").html('Aviso: ' + codAviso);
		$("#reqOpeLen").html("N° Operación: " + data[0].Codigo)

		$.mobile.changePage('#pagEditarReqOperacion')
	}

}

function retornaDataClaMod(checkparametro) {
	var datpar = checkparametro.value.split(";")
	$("#txtReqClaveModulo").val(datpar[0])
	$("#txtReqDesModulo").val(datpar[1])

	$.mobile.changePage('#pagEditarReqOperacion')
}


function onchOpeExtCanPre() {
	var cantidad = $("#txtReqCantidad").val()
	var precio = $("#txtReqPrecioRef").val()
	if (cantidad == "") cantidad = 0
	if (precio == "") cantidad = 0
	$("#txtReqTotal").val((parseFloat(cantidad) * parseFloat(precio)).toFixed(2))

}

function grabarReqOpeExterno() {

	var codReq = $("#hidCodReq").val()
	var codAviso = $("#txtAvisoCodigo").val()

	var reqEstado = "CREADO"
	var accion = codReq == "0" ? "I" : ""
	var cusuario = getLocalStorage("cusuario")

	var dataAvisoReq = {
		CodReq: codReq,
		Accion: accion,
		CodAviso: codAviso,
		Estado: reqEstado,
		Cusuario: cusuario
	}

	var codOpe = $("#hiddExtCodOperacion").val()

	var reqBE = {
		CodOpe: codOpe,
		Accion: codOpe == "0" ? "I" : "U",
		CodAviso: codAviso,
		Modelo: $("#txtExtClaMod").val(),
		DModelo: $("#txtExtDesClaMod").val(),
		Puesto: $("#txtReqExtPuesto").val(),
		Centro: $("#txtReqExtCentro").val(),
		Ctrl: "PM03",
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

	if (reqBE.Modelo.trim() == "") {
		navigator.notification.alert("Ingrese Modelo")
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

	if (reqBE.Puesto == "") {
		navigator.notification.alert("Ingrese puesto trabajo")
		return
	}
	if (reqBE.Centro == "") {
		navigator.notification.alert("Ingrese centro puesto trabajo")
		return
	}


	if (accion == "I") {

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
					$("#hidReqExtCodigo").val(data.Codigo)
					grabarOperacionExterno(reqBE, codAviso)
				} else {
					navigator.notification.alert(data.Mensaje)

				}

			},
			error: function (jqXHR, exception) {
				$("#cargando").hide();
				navigator.notification.alert("Error: no se registro Requerimiento Operaciones " + jqXHR)

			}
		});
	}
	else
		grabarOperacionExterno(reqBE, codAviso)


}
function grabarOperacionExterno(reqBE, codAviso) {

	var codReq = $("#hidCodReq").val()
	reqBE.CodReq = codReq;

	if (codReq != "0")
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
		//Ubicacion: 
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

	var codOpe = btn.split(";")[0]
	var OpeCodigo = btn.split(";")[1]
	var codReq = btn.split(";")[2]

	var codAviso = $("#txtAvisoCodigo").val();

	var reqBE = {
		CodOpe: codOpe,
		CodReq: codReq,
		Accion: "D"
	}

	navigator.notification.confirm("Esta Seguro de eliminar Operación: " + OpeCodigo, function (buttonIndex) {
		if (buttonIndex == 1)
			registrarReqOpeaciones(reqBE, codAviso)

	},)


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
	//alert(codAviso)
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
	var orden = $("#hidAviOM").val()

	lstReqOperaciones = [];
	lstReqOperaciones = data

	$("#ulAviOpe").html("")

	var html = ""
	var existe = false;
	$(data).each(function (i, row) {
		var eliminar = "";
		var material = "";
		material = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-bullets ui-btn-icon-notext ui-btn-d ui-mini" onClick="gestionReqMaterial(\'' + row.CodOpe + ";" + row.Codigo + ";" + row.CodReq + '\')"></a>'

		if (perUsu.IELIMINAR == "1" && orden == "")
			eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliminarOpeItem(\'' + row.CodOpe + ";" + row.Codigo + ";" + row.CodReq + '\')"></a>'

		existe = true;

		html = html + '<li data-theme="b"> ' +
			'<p  onclick="editarRepOpeExt(\'' + row.CodOpe + '\')" style="float:right;fon"><strong>' + row.Codigo + '</strong></p>' +
			' <h2 onclick="editarRepOpeExt(\'' + row.CodOpe + '\')">' + row.DModelo + '</h2> ' +
			'<div class="ui-grid-a">' +
			'<div class="ui-block-a" onclick="editarRepOpeExt(\'' + row.CodOpe + '\')"  >' +
			' <p><strong>' + row.Ctrl + '-' + row.DCtrl + '</strong></p>' +
			'</div>' +
			'<div class="ui-block-b">' +
			' <p style="float:right;">' + material + '&nbsp;&nbsp;' + eliminar + '</p>' +
			'</div>' +
			'</div>'
		'</li>'
	})

	if (!existe) {
		html = html + '<li data-theme="b" >' +
			'<h2>....</h2><p><strong>...</strong></p>' +
			'<p style="float:left;">...</p>' +
			'<p style="float:right;">...</p>' +
			'<p class="ui-li-aside"><strong>...</strong></p></li>'
	}
	$("#ulAviOpe").html(html)
	$('#ulAviOpe').listview('refresh');

}

function onchaPtoTrabaOpe(obj) {
	var centro = lstCentros.find(x => x.SITEM == obj.value)
	if (centro == null) {
		$("#txtReqCentro").val("")
		$("#cbxReqPuesto").val("")
		$("select#cbxReqPuesto").change()
		navigator.notification.alert("Error, el Pto. centro ingresado no existe")

	}
	obtenerCbxPtoTra(obj.value, "", "OPE")
}

function obtenerCbxPtoTra(centro, puesto, tipo) {

	if (centro == null || centro.trim() == "") return

	$.ajax({
		url: getIPorHOSTApi() + "MttoChimuAPI/ListaPuestos?centro=" + centro,
		type: "get",
		timeout: 60000,
		content: "application/json",
		beforeSend: function () {
			$("#cargando").show()
		},
		success: function (data) {
			$("#cargando").hide();
			llenarCbxPtoTra(data, puesto, tipo)
		},
		error: function (jqXHR, exception) {
			$("#cargando").hide();
			navigator.notification.alert("Problemas al obtener Tablas Pto Trabajo")
		}
	});

}

function llenarCbxPtoTra(data, puesto, tipo) {
	var ptos = data.filter(x => x.STABLA == "PUESTO")

	if (tipo == "AVI") {

		$("#cbxAvisoPuesto").empty()
		//$("#cbxAvisoPuesto").append('<option value="">Seleccione Pto. Trabajo</option>')
		$(ptos).each(function (index, row) {
			if (puesto == row.SITEM)
				$("#cbxAvisoPuesto").append('<option selected value="' + row.SITEM + '">' + row.SITEM + '</option>')
			else
				$("#cbxAvisoPuesto").append('<option value="' + row.SITEM + '">' + row.SITEM + '</option>')
		});
		$("select#cbxAvisoPuesto").change()

	}
	else if (tipo == "OPE") {
		$("#cbxReqPuesto").empty()
		//$("#cbxReqPuesto").append('<option value="">Seleccione Pto. Trabajo</option>')
		$(ptos).each(function (index, row) {
			if (puesto == row.SITEM)
				$("#cbxReqPuesto").append('<option selected value="' + row.SITEM + '">' + row.SITEM + '</option>')
			else
				$("#cbxReqPuesto").append('<option value="' + row.SITEM + '">' + row.SITEM + '</option>')
		});
		$("select#cbxReqPuesto").change()
	}

	else if (tipo == "HH") {

		//var rowIndex = $("#hidHHi").val()
		//$("#cbxPuestoHHOM_" + rowIndex).empty()

		$(ptos).each(function (index, row) {
			if (puesto == row.SITEM)
				$("#cbxPuestoHHOM").append('<option selected value="' + row.SITEM + '">' + row.SITEM + '</option>')
			else
				$("#cbxPuestoHHOM").append('<option value="' + row.SITEM + '">' + row.SITEM + '</option>')
		});
		$("select#cbxPuestoHHOM").change()
	}
}




var lstReqMateriales = []
function gestionReqMaterial(parametros) {
	// lista materiales 
	var parametro = parametros.split(";")

	var codReqOpe = parametro[0]
	var codigoOpe = parametro[1]
	var codReq = parametro[2]

	verPagReqMaterial()

	$("#titEditarReqMante").html("Materiales - Ope: " + codigoOpe)
	$("#hidReqMatCodOperacion").val(codReqOpe)
	$("#hidReqMatCodReq").val(codReq)

	$("#hidReqMatCodigo").val(codigoOpe)

	obtenerOpeMateriales(codReq, codReqOpe)
}

function verPagReqMaterial() {

	$.mobile.changePage('#pagReqMaterial')

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

	$("#titEditarReqMat").html("Operación:" + codigoOpe)

	if (codOpeMat == "0") {
		var centro = equipoUbi.CentroSU == undefined || equipoUbi.CentroSU == "" ? 3904 : equipoUbi.CentroSU;
		var alamcen = equipoUbi.Almacen == undefined || equipoUbi.Almacen == "" ? 1100 : equipoUbi.Almacen;

		$("#txtCodMat").val("")
		$("#hidMatCodOperacion").val(codReqOpe)
		$("#hidMatCodReq").val(codReq)
		$("#txtMatCodigo").val("")
		$("#txtMatDesc").val("")
		$("#txtMatUniMed").val("")
		$("#txtMatCantidad").val("")
		$("#txtMatLote").val("L")
		$("#txtMatCentro").val(centro)
		$("#txtMatAlmacen").val(alamcen)

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
	$("#txtBusMaterial").val("")

	var materialBE = {
		Centro: centro,
		Codigo: "",
		Descripcion: ""
	}

	if (tipo == "COD") {
		materialBE.Codigo = $("#txtMatCodigo").val()
		$("#txtMatCodigo").val("")
		$("#txtMatDesc").val("")
		$("#txtMatUniMed").val("")
	}
	else {
		if ($("#txtbusMaterial").val().trim() == "") {
			navigator.notification.alert("Ingrese descripción")
			return 
		}
		else
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
					$("#txtMatUniMed").val(data[0].UM)
					$("#txtMatLote").val(data[0].Lote) 
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
	var codMateial = tds.find("input[name='reqMatCodigo']").val()

	var reqBE = {
		CodMat: codMat,
		CodOpe: codOpe,
		CodReq: codReq,
		Accion: "D"
	}

	navigator.notification.confirm("Esta Seguro de eliminar Material: " + codMateial, function (buttonIndex) {

		if (buttonIndex == 1) {
			if (registraReqMaterial(reqBE, codOpe, codReq))
				$(btn).closest("tr").remove();
		}
	},)



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
				verPagReqMaterial()
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
	var orden = $("#hidAviOM").val()
	lstReqMateriales = []
	lstReqMateriales = data

	var html = ""
	var existe = false;
	$(data).each(function (i, row) {
		existe = true;
		var modver = ""
		var eliminar = ""
		//console.log(perUsu.ICONSULTAR, perUsu.IMODIFICAR)
		if (perUsu.IMODIFICAR == "1" && orden == "")
			modver = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-edit ui-btn-icon-notext ui-btn-b ui-mini" onClick="mantReqMaterial(\'' + row.CodMat + '\')"></a>'

		else if (perUsu.ICONSULTAR == "1" && (perUsu.IMODIFICAR != "1" || perUsu.IMODIFICAR == "1"))
			modver = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-eye ui-btn-icon-notext ui-btn-c ui-mini" onClick="mantReqMaterial(\'' + row.CodMat + '\')"></a>'

		if (perUsu.IELIMINAR == "1" && orden == "")
			eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliminarMatItem(this)"></a>'

		var almacen = row.Almacen == null ? "" : row.Almacen;
		html = html + '<tr> ' +
			'<td>' + row.CodMaterial +
			'<input type="hidden" name="reqMatCodigo" value="' + row.CodMaterial + '">' +
			'<input type="hidden" name="reqMatCodMat" value="' + row.CodMat + '">' +
			'<input type="hidden" name="reqMatCodOpe" value="' + row.CodOpe + '">' +
			'<input type="hidden" name="reqMatCodReq" value="' + row.CodReq + '">' +
			'</td>' +
			'<td>' + row.DesMaterial + '</td>' +
			'<td>' + row.UM + '</td>' +
			'<td>' + row.Cantidad + '</td>' +
			'<td>' + row.Centro + '</td>' +
			'<td>' + almacen + '</td>' +
			'<td>' + row.Lote + '</td>' +
			'<td>' + modver + "&nbsp;" + eliminar + '</td>' +
			'</tr>';

	})
	if (!existe) {
		html = html + '<tr><td colspan=8 style="text-align:rigth" >No hay registro...</td></tr>'
	}

	$("#tblReqMaterial").find('tbody').empty();
	$("#tblReqMaterial").find('tbody').append(html);
	$("#tblReqMaterial").trigger('create')
	$("#tblReqMaterial").table("refresh");

}
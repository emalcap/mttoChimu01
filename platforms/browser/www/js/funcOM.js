function gestionOM() {
    //var perUsu = lstPerUsu.find(x => x.SMODULO == "gestionOM")
    $("#hidGestOMInicio").val("N")
    $("#cbxGrupoOM").empty()
    if ($("#cbxConGrupo").children('option').length > 2) {
        $("#cbxGrupoOM").append('<option value="">Seleccione Grupo</option>')
        $("#cbxGrupoOM").append('<option value="0">Todos</option>')
    }

    var opts = 0, val = ""
    opts = 0, val = ""
    $("#cbxConGrupo > option").each(function () {
        if (this.value != "") {
            opts++; val = this.value
            $("#cbxGrupoOM").append('<option value="' + this.value + '">' + this.text + '</option>')
        }
    });

    if (opts == 1)
        $("#cbxGrupoOM").val(val)
    else
        $("#cbxGrupoOM").val("0")

    $("select#cbxGrupoOM").change()

    var ubiSelCong = $("#cbxConUbicacion").val()
    var ubiConfi = dataLogConUsu.Ubicaciones
    if (ubiSelCong != "")
        $("#txtUbiTecOM").val(ubiSelCong)
    else if (ubiConfi.length > 0)
        $("#txtUbiTecOM").val(ubiConfi.split("|")[0])

    $("select#cbxConGrupo").change()

    $.mobile.changePage('#pagGestionOM')
}

function verFiltroOM(accion) {

    if ($('#ulAvisoOMFiltro').is(':visible')) {
        $('#ulAvisoOMFiltro').hide()
    } else {
        $('#ulAvisoOMFiltro').show()
    }
    if (accion == 'B')
        $('#txtFilAviOM').focus();

}

function listarGestionOM() {
    var gruposOM = ""

    var ubi = $("#txtUbiTecOM").val()
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
    $("#txtFilterOM").val("")

    if ($("#cbxGrupoOM").val() == "0" || $("#cbxGrupoOM").val() == "") {
        $("#cbxGrupoOM > option").each(function () {
            if (this.value != "" && this.value != "0") gruposOM = gruposOM == "" ? this.value : gruposOM + '|' + this.value
        });
    } else
        gruposOM = $("#cbxGrupoOM").val()

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
        Orden: $("#txtAviOrdOM").val(),  // CodAviso old
        Centro: $("#txtConCentro").val(),
        Puesto: $("#txtConPuesto").val(),
        Grupo: gruposOM,
        Ubicacion: ubicaciones,

    };

    $.ajax({
        url: getIPorHOSTApi() + "MttoChimuAPI/ListaOM",
        crossDomain: true,
        cache: false,
        type: "Post",
        timeout: 60000,
        data: avisoBE,
        beforeSend: function () {
            $("#cargando").show();
        },
        success: function (data) {
            $("#cargando").hide();
            listaOpeOM(data)
        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Error al obtenere datos de OM " + jqXHR)
        }
    });
}

function listaOpeOM(data) {

    $("#ulAvisosOM").html("")
    var html = ""

    var existe = false;

    $(data).each(function (i, row) {
        existe = true;
        var clase = row.Clase == null ? "" : row.Clase
        var colorFila = row.Estado == "4" ? "#B5B2B2" : "";

        html = html + '<li data-theme="c" style="color:' + colorFila + '" > ' +
            '<p  onclick="detalleAvisoOM(\'' + row.Orden + '\')" style="float:right;fon"><strong>' + row.FechaIni + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + row.Orden + '</strong></p>' +
            '<h2 onclick="detalleAvisoOM(\'' + row.Orden + '\')">' + row.Ubicacion + '</h2> ' +

            '<p onclick="detalleAvisoOM(\'' + row.Orden + '\')"  style="float:right;">' + clase + '</p>' +
            '<p onclick="detalleAvisoOM(\'' + row.Orden + '\')"><strong>' + row.Descripcion + '</strong></p>' +
            '</li>'
    })

    if (!existe) {
        html = html + '<li data-theme="b" > <h2>....</h2><p><strong>...</strong></p><p style="float:left;">...</p> <p style="float:right;">...</p><p class="ui-li-aside"><strong>...</strong></p></li>'
    }
    $("#ulAvisosOM").html(html)
    $('#ulAvisosOM').listview('refresh');
    verFiltroOM('N')
    $('#ulAvisoOMFiltro').hide()
}

var lstOpeMatOM = []
var lstOpeOM = []
function detalleAvisoOM(codOrden) {

    if (codOrden == "" || codOrden == null)
        return

    var orden = codOrden
    $("#titEditarOrdenOM").html("ORDEN MANTENIMIENTO:&nbsp;&nbsp;" + codOrden)

    $.mobile.changePage('#pagDetalleOpeOM')

    $.ajax({
        url: getIPorHOSTApi() + "MttoChimuAPI/VerOM",
        crossDomain: true,
        cache: false,
        type: "Get",
        timeout: 60000,
        data: { Orden: orden },
        beforeSend: function () {
            $("#cargando").show();
            lstOpeMatOM.length = 0;
            lstOpeOM.length = 0;
        },
        success: function (data) {
            $("#cargando").hide();
            mostrarDetalleOM(data, orden)
        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Error al obtenere datos del aviso " + jqXHR)

        }
    });

}

function mostrarDetalleOM(data, orden) {
    // console.log(data)
    $("#txtOrdOM").val(orden)
    $("#txtclaOM").val(data.Clase)
    $("#txtActOM").val()
    $("#txtEstOM").val(data.Estado)
    $("#txtOpeOM").val(data.Descripcion)
    $("#txtUbiOM").val(data.Ubicacion)
    $("#txtequiOM").val(data.Equipo)
    // traer  estado  

    $("#ulAvisosOpeOM").html("")

    var existe = false;
    $("#hidOrdenOM").val(orden)

    var htmlOpe = '<li data-theme="b" data-role="list-divider" >' +
        '<p style="float:right" ><strong>CControl</strong></p>' +
        '<p  ><strong>Op &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Texto Operacion</strong></p>' +
        '<p style="float:right"><strong>Pst.Trabj&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Centro</strong></p>' +
        '<p ><strong>Cant &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Durac.' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tot.HH</strong></p>' +
        '</li>'

    existe = false;

    var lstOpe = data.lstOpe;

    $(lstOpe).each(function (i, row) {
        existe = true;
        var trab = 0
        var horas = 0
        var total = 0
        if (row.Ctrl == "PM01") {
            trab = row.Trabajo
            horas = row.Horas
        }
        total = parseFloat(trab * horas).toFixed(1)


        var DCtrl = row.Ctrl == "PM01" ? "PROPIO" : row.Ctrl == "PM03" ? "EXTERNO" : "";

        htmlOpe = htmlOpe + '<li data-theme="b" >' +
            '<p  onclick="detalleMatOpeOM(\'' + row.CodOpe + ';' + orden + '\')" style="float:right" ><strong>' + DCtrl + '</strong></p>' +
            '<p  onclick="detalleMatOpeOM(\'' + row.CodOpe + ';' + orden + '\')" ><strong>' + row.CodOpe + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + row.Operacion + '</strong></p>' +
            '<p onclick="detalleMatOpeOM(\'' + row.CodOpe + ';' + orden + '\')"  style="float:right"><strong>' + row.Puesto + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + row.Centro + '</strong></p>' +
            '<p onclick="detalleMatOpeOM(\'' + row.CodOpe + ';' + orden + '\')" ><strong>' + trab +
            '&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + parseFloat(horas).toFixed(1) +
            '&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + total + '</strong></p>' +
            '</li>'
    })

    if (!existe) {
        htmlOpe = htmlOpe + '<li data-theme="b" > <h2>....</h2><p><strong>...</strong></p><p style="float:left;">...</p> <p style="float:right;">...</p><p class="ui-li-aside"><strong>...</strong></p></li>'
    }
    $("#ulAvisosOpeOM").html(htmlOpe)
    $('#ulAvisosOpeOM').listview('refresh');
    //
    if (data.lstOpe != null)
        lstOpeOM = data.lstOpe;
    if (data.lstMat != null)
        lstOpeMatOM = data.lstMat;


}

function detalleMatOpeOM(codOpeOerd) {

    var ArrayVal = codOpeOerd.split(';')
    var data = lstOpeMatOM.filter(x => x.CodOpe == ArrayVal[0])
    var orden = ArrayVal[1]
    var reserva = ""
    if (data.length > 0)
        reserva = data[0].Reserva


    $("#lblResOM").html(reserva)
    $("#lblMatOM").html(orden)

    $("#ulAvisosMatOM").html("")
    $.mobile.changePage('#pagDetalleMatOM')

    var html = '<li data-theme="b"  data-role="list-divider" >' +
        '<p style="float:right" ><strong>Oper.</strong></p>' +
        '<p><strong>Pos&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Material' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Descripción</strong></p>' +
        '<p style="float:right"><strong>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></p>' +
        '<p><strong>UM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cant' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CantDesp' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Almacén' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Centro</strong></p> ' +
        '</li>'

    var existe = false;

    $(data).each(function (i, row) {
        existe = true;

        var mov = "", saf = "";
        if (row.MovimPerm == "1")
            mov = '<input type="checkbox" checked disabled/>'
        if (row.SalFinal == "1")
            saf = '<input type="checkbox" checked disabled/>'

        html = html + '<li data-theme="b" >' +
            '<p style="float:right" ><strong>' + row.CodOpe + '</strong></p>' +
            '<p><strong>' + row.CodMat +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + row.CodMaterial +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + row.DesMaterial +
            '</strong></p>' +
            '<p style="float:right" ><strong> Mov: ' + mov +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SAF: ' + saf + '</strong></p>' +

            '<p><strong>' + row.UM +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + parseFloat(row.Cantidad).toFixed(2) +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + parseFloat(row.CantidadDesp).toFixed(2) +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + row.Almacen +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + row.Centro +
            '</strong></p> ' +
            '</li>'
    })

    if (!existe) {
        html = html + '<li data-theme="b" > <h2>....</h2><p><strong>...</strong></p><p style="float:left;">...</p> <p style="float:right;">...</p><p class="ui-li-aside"><strong>...</strong></p></li>'
    }
    $("#ulAvisosMatOM").html(html)
    $('#ulAvisosMatOM').listview('refresh');

}


function gestionNotHH() {

    $("#lenTitMotOM").html("OM: " + $("#hidOrdenOM").val())

    var data = lstOpeOM.filter(x => x.Ctrl == "PM01")
    if (data.length == 0) {
        navigator.notification.alert("No existe Operaciones para OM:" + $("#hidOrdenOM").val(), null, "Aviso", ["OK"])
        return
    }
    var codOpePM01 = "";
    var cont = 0;
    $(data).each(function (index, row) {
        codOpePM01 = codOpePM01 == "" ? row.CodOpe : codOpePM01 + ',' + row.CodOpe
        cont = cont + 1
    })

    $("#hidCodOpePM01").val(codOpePM01)
    $("#hidPosOpePM01").val(0)
    $("#hidtotalOpe").val(data.length)

    var posCodOpe;

    if (cont == 1)
        posCodOpe = codOpePM01
    else if (cont > 1)
        posCodOpe = codOpePM01.split(",")[0]
    //
    limpiarOpeNotHH()
    var dataOpe = lstOpeOM.filter(x => x.CodOpe == posCodOpe)
    mantCodOpeNotHH(dataOpe)
}

function posCodOpeNotHH(antNext) {
    var valmant = $("#hidHHi").val()
    if (valmant == "I") {
        navigator.notification.confirm("Existe datos sin grabar; si continúa perderá estos cambios ", function (buttonIndex) {
            if (buttonIndex == 1) {
                mantPosCodOpeNotHH(antNext)
            }
        },)
    }
    else
        mantPosCodOpeNotHH(antNext)

}

function mantPosCodOpeNotHH(antNext) {
    var posCodOpe = parseInt($("#hidPosOpePM01").val())

    var tot = parseInt($("#hidtotalOpe").val())
    if (tot == 1)
        return

    var arrayCodOpePM01 = $("#hidCodOpePM01").val().split(",")

    if (antNext == 'ANT' && posCodOpe >= 0) {
        if (posCodOpe != 0)
            posCodOpe = posCodOpe - 1
    }
    if (antNext == 'SGI') {
        if (posCodOpe <= tot - 1)
            posCodOpe = posCodOpe + 1
    }
    if (posCodOpe == tot) return
    $("#hidPosOpePM01").val(posCodOpe)
    //
    limpiarOpeNotHH()

    var dataOpe = lstOpeOM.filter(x => x.CodOpe == arrayCodOpePM01[posCodOpe])
    mantCodOpeNotHH(dataOpe)
}


function onchaEditNotiHH(campo) {

    $("#hidHHi").val("I")

    if (campo == "CEN") {
        obtenerCbxPtoTra($("#txtCentroHHOM").val(), "", "HH")
    }

    if (campo == "TRA") {

        var nroTra = $("#txtTraHHOM").val()
        var nroTraUndec = nroTra.toString().split(".")
        if (nroTraUndec[1] != undefined)
            if (nroTraUndec[1].length > 1) {
                $("#txtTraHHOM").val("")
                navigator.notification.alert("Trabajo un solo Decimal")
                return
            }
    }
}

function mantCodOpeNotHH(data) {
    $("#hidHHi").val("")
    $("#hidCodOpeHH").val(data[0].CodOpe)

    $("#hNroOpeNotHH").html("OM: " + $("#hidOrdenOM").val())
    $("#hNroOpeHH").html("Operación: " + data[0].CodOpe)


    $.mobile.changePage('#pagNotificaHH')

}


function RegistrarNotHH() {

    var lstNotiBE = [];

    var orden = $("#hidOrdenOM").val()
    var codOpe = $("#hidCodOpeHH").val();
    var fIni = $("#dateFIniHH").val()
    var hIni = $("#timeHIniHH").val()
    var fFin = $("#dateFFinHH").val()
    var hFin = $("#timeHFinHH").val()
    var puesto = $("#cbxPuestoHHOM").val()
    var centro = $("#txtCentroHHOM").val()
    var trabajo = $("#txtTraHHOM").val()
    var indTraHH = $("#checkTraHHOM").is(':checked') == true ? "1" : "0";
    var indFinHH = $("#checkIndFin").is(':checked') == true ? "1" : "0";
    var indConResv = $("#checkIndConResv").is(':checked') == true ? "1" : "0";

    if (fIni == "") {
        navigator.notification.alert("Ingresar F. Inicio")
        return
    }
    if (hIni == "") {
        navigator.notification.alert("Ingresar H. Inicio")
        return
    }

    if (fFin == "") {
        navigator.notification.alert("Ingresar F. Fin")
        return
    }
    if (hFin == "") {
        navigator.notification.alert("Ingresar H. Fin")
        return
    }

    if (centro == "") {
        navigator.notification.alert("Ingresar Centro")
        return
    }

    if (puesto == "") {
        navigator.notification.alert("Ingresar Puesto")
        return
    }

    var notiBE = {
        Orden: orden,
        CodOpe: codOpe,
        FecIni: fIni,
        HorIni: hIni,
        FecFin: fFin,
        HorFin: hFin,
        Puesto: puesto,
        Centro: centro,
        TraReal: trabajo,
        NoTrabajo: indTraHH,
        NotfFinal: indFinHH,
        IndConResv: indConResv,
        Lugar: "",
        Texto: "",
    }
    lstNotiBE.push(notiBE)

    $.ajax({
        url: getIPorHOSTApi() + "MttoChimuAPI/RegistraNotifHH",
        crossDomain: true,
        cache: false,
        type: "Post",
        timeout: 60000,
        "contentType": "application/json; charset=utf-8",
        "dataType": "json",
        data: JSON.stringify(lstNotiBE),
        beforeSend: function () {
            $("#cargando").show();
        },
        success: function (data) {
            $("#cargando").hide();
            if (data.Status != "OK")
                navigator.notification.alert(data.Mensaje)
            else if (data.Status == "OK") {
                navigator.notification.alert(data.Mensaje)
                $("#hidHHi").val("")
            }


        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Error, No se realizo el registro de Notificación")
        }
    });

    // console.log(lstNotiBE)
}

function limpiarOpeNotHH() {

    var centro = $("#txtConCentro").val()
    var puesto = $("#txtConPuesto").val()

    $("#hidCodOpeHH").val("");
    $("#dateFIniHH").val("")
    $("#timeHIniHH").val("")
    $("#dateFFinHH").val("")
    $("#timeHFinHH").val("")
    $("#txtCentroHHOM").val(centro)
    $("#cbxPuestoHHOM").val("")
    $("#txtTraHHOM").val("")
    $("#checkTraHHOM").prop('checked', false)//.checkboxradio( "refresh" )
    $("#checkIndFin").prop('checked', false)//.checkboxradio( "refresh" )
    $("#checkIndConResv").prop('checked', false)//.checkboxradio( "refresh" )

}

function servExternoOM() {

    var codOpePM3 = "";
    var data = lstOpeOM.filter(x => x.Ctrl == "PM03")

    if (data.length == 0) {
        navigator.notification.alert("No existe Operaciones para OM:" + $("#hidOrdenOM").val(), null, "Aviso", ["OK"])
        return
    }

    var count = 0
    $(data).each(function (index, row) {
        codOpePM3 = codOpePM3 == "" ? row.CodOpe : codOpePM3 + ',' + row.CodOpe
        count = count + 1
    })
    var codOpePostPM03 = ""

    $("#hidOpeExtOM").val(codOpePM3)
    if (count == 1)
        codOpePostPM03 = codOpePM3
    else if (count > 1)
        codOpePostPM03 = codOpePM3.split(",")[0]

    $("#hidTotOpeExt").val(data.length)
    $("#hidPosOpeExt").val(0)

    var dataOpe = lstOpeOM.filter(x => x.CodOpe == codOpePostPM03)

    mostrarOpeExtOM(dataOpe)

    $.mobile.changePage('#pagExternoOM')


}

function onchaEditNotExt() {

    $("#hidExtOMI").val("I")
}


function posOpeExternoOM(antNext) {

    var valmant = $("#hidExtOMI").val()


    if (valmant == "I") {
        navigator.notification.confirm("Existe datos sin grabar; si continúa perderá estos cambios: ", function (buttonIndex) {
            if (buttonIndex == 1) {
                matOpeExtornoOM(antNext)
            }
        },)
    }
    else
        matOpeExtornoOM(antNext)

}


function matOpeExtornoOM(antNext) {

    var posCodOpe = parseInt($("#hidPosOpeExt").val())

    var tot = parseInt($("#hidTotOpeExt").val())
    if (tot == 1)
        return

    var arrayCodOpePM03 = $("#hidOpeExtOM").val().split(",")

    if (antNext == 'ANT' && posCodOpe >= 0) {
        if (posCodOpe != 0)
            posCodOpe = posCodOpe - 1
    }
    if (antNext == 'SGI') {
        if (posCodOpe <= tot - 1)
            posCodOpe = posCodOpe + 1
    }
    if (posCodOpe == tot) return

    $("#hidPosOpeExt").val(posCodOpe)
    //
    limpiarOpeExt()

    var dataOpe = lstOpeOM.filter(x => x.CodOpe == arrayCodOpePM03[posCodOpe])
    mostrarOpeExtOM(dataOpe)

}

function mostrarOpeExtOM(data) {

    $("#hidExtOMI").val("")
    $("#hidCodOpeExt").val(data[0].CodOpe)

    //console.log(data)

    $("#lblOrdExtOM").html("OM: " + $("#hidOrdenOM").val())
    $("#lblCodOpeExtOM").html("Nro Ope.:" + data[0].CodOpe)
    $("#hidCodOpeExt").val(data[0].CodOpe)
    $("#lblOpeExtOM").html(data[0].Operacion)

    // $("#txtCodSolOM").val()
    // $("#txtPosSolOM").val()
    // $("#txtCodPedOM").val()
    // $("#txtPedOM").val()

    $("#txtCodServOM").val(data[0].CodServicio)
    $("#txtDesServOM").val(data[0].DServicio)

    /*$("#txtUMOM").val()
    $("#txtValOM").val()
    $("#txtCantOM").val()
    $("#txtMonOM").val()
    $("#txtUMConOM").val()
    $("#txtCanConOM").val()
    $("#txtValConOM").val()
    $("#txtMonConOM").val()
    $("#txtFIniExtOM").val()
    $("#txtFinExtOM").val()
    $("#txtTextExtOM").val()
    $("#txtLugExtOM").val()
    $("#datFCtbOM").val()
    $("#horSupOM").val()
    */


}

function registrarNotExterno() {
    lstNotiBE = []
    var orden = $("#hidOrdenOM").html()
    var codOpe = $("#hidCodOpeExt").val()
    //var canCon =  $("#txtCanConOM").val()
    var fIni = $("#txtFIniExtOM").val()
    var fFin = $("#txtFinExtOM").val()
    var text = $("#txtTextExtOM").val()
    var lugar = $("#txtLugExtOM").val()
    var fCtb = $("#datFCtbOM").val()
    var horSup = $("#horSupOM").val()

    var notiBE = {
        Orden: orden,
        CodOpe: codOpe,
        FecIni: fIni,
        FecFin: fFin,
        FecContable: fCtb,
        HorSuper: horSup,
        Puesto: "",
        Centro: "",
        TraReal: "",
        NoTrabajo: "",
        NotfFinal: "",
        IndConResv: "",
        Lugar: lugar,
        Texto: text
    }
    if (fIni == "") {
        navigator.notification.alert("Ingresar F. Inicio")
        return
    }
    if (fFin == "") {
        navigator.notification.alert("Ingresar F. Fin")
        return
    }
    if (text == "") {
        navigator.notification.alert("Ingresar texto")
        return
    }
    /* if (lugar == "") {
         navigator.notification.alert("Ingresar lugar")
         return
     }
     */

    if (fCtb == "") {
        navigator.notification.alert("Ingresar fecha ConTB")
        return
    }
    if (horSup == "") {
        navigator.notification.alert("Ingresar H. Sup")
        return
    }

    lstNotiBE.push(notiBE)

    $.ajax({
        url: getIPorHOSTApi() + "MttoChimuAPI/RegistraNotifHH",
        crossDomain: true,
        cache: false,
        type: "Post",
        timeout: 60000,
        "contentType": "application/json; charset=utf-8",
        "dataType": "json",
        data: JSON.stringify(lstNotiBE),
        beforeSend: function () {
            $("#cargando").show();
        },
        success: function (data) {
            $("#cargando").hide();
            console.log(data)
            if (data.Status != "OK")
                navigator.notification.alert(data.Mensaje)
            else if (data.Status == "OK") {
                navigator.notification.alert(data.Mensaje)
                $("#hidExtOMI").val("")
            }


        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Error, No se realizo el registro servicio Externo")
        }
    });






}

function limpiarOpeExt() {

    $("#lblOrdExtOM").html("")
    $("#lblCodOpeExtOM").html("")
    $("#hidCodOpeExt").val("")
    $("#lblOpeExtOM").html("")

    $("#txtCodSolOM").val("")
    $("#txtPosSolOM").val("")
    $("#txtCodPedOM").val("")
    $("#txtPedOM").val("")

    $("#txtUMOM").val("")
    $("#txtValOM").val("")
    $("#txtCantOM").val("")
    $("#txtMonOM").val("")
    $("#txtUMConOM").val("")

    $("#txtValConOM").val("")
    $("#txtMonConOM").val("")

    $("#txtCanConOM").val("")
    $("#txtFIniExtOM").val("")
    $("#txtFinExtOM").val("")
    $("#txtTextExtOM").val("")
    $("#txtLugExtOM").val("")
    $("#datFCtbOM").val("")
    $("#horSupOM").val("")
}




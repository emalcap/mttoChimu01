function gestionOM() {
    //var perUsu = lstPerUsu.find(x => x.SMODULO == "gestionOM")
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
        CodAviso: $("#txtAviReqOM").val(),
        Centro: $("#txtConCentro").val(),
        Puesto: $("#txtConPuesto").val(),
        Grupo: gruposOM,
        Ubicacion: ubicaciones,
        perfil: dataLogConUsu.Perfil,
        Tipo: dataLogConUsu.Tipos

    };

    $.ajax({
        url: getIPorHOSTApi() + "MttoChimuAPI/ListaAvisoOM",
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
    // console.log(data)
    $("#ulAvisosOM").html("")
    var html = ""
    var existe = false;

    $(data).each(function (i, row) {
        existe = true;
        //onclick="editarAvisoOM(\'' + row.CodAviso + ';' + row.Orden + '\')"
        html = html + '<li data-theme="b"  > ' +
            ' <button data-theme="d" style="float:right;fon;border:none;" onclick="editarAvisoOM(\'' + row.CodAviso + ';' + row.Orden + '\')"> <p><strong>' + row.CodAviso + '</strong></p></button>' +
            ' <h2>' + row.Ubicacion + '</h2> ' +
            ' <p><strong>' + row.Titulo + '</strong></p>' +
            ' <p style="float:left;">' + row.FInicio + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- &nbsp;&nbsp;&nbsp;' + row.Equipo + '</p>' +
            ' <p id="pOrden" style="float:right;">' + "OM: " + row.Orden + '</p>' +
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


function verFiltroOM(accion) {

    var lengtF = 98
    if ($('#ulAvisoOMFiltro').is(':visible')) {
        $('#ulAvisoOMFiltro').hide()
    } else {
        lengtF = 118 + $('#ulAvisoOMFiltro').height()
        $('#ulAvisoOMFiltro').show()
    }
    var content = getRealContentHeight()
    //var content = $(".ui-content").height()
    //alert(content)
    $("#ulAvisosOM").height(content - lengtF);
    if (accion == 'B')
        $('#txtFilAviOM').focus();
}


function editarAvisoOM(codAvisoOrden) {
    var codAviso = codAvisoOrden.split(";")[0];
    $("#titEditarAaviOM").html("Aviso: " + codAvisoOrden.split(";")[0])
    $("#lenEditAviOM").html("OM: " + codAvisoOrden.split(";")[1])

    $.mobile.changePage('#pagEditarOM')


    $.ajax({
        url: getIPorHOSTApi() + "MttoChimuAPI/VerOM",
        crossDomain: true,
        cache: false,
        type: "Get",
        timeout: 60000,
        data: { aviso: codAviso },
        beforeSend: function () {
            $("#cargando").show();
        },
        success: function (data) {
            $("#cargando").hide();
            console.log(data)
            $("#txtClaseOM").val(data.Clase) 
           // "ClaseAC": null,
            //"Prioridad": null,
        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Error al obtenere datos del aviso " + jqXHR)

        }
    });


}

function registrarAviOM() {
    alert('en Mantenimiento')
    var ordenBE = {
        ACCION: null,
        CUSUARIO: 0,
        CentroPM: null,
        CentroPT: null,
        Clase: null,
        ClaseAC: null,
        CodAviso: null,
        CodReq: 0,
        DUSUARIO: null,
        Descripcion: null,
        ESTADO: null,
        Equipo: null,
        FechaIni: null,
        GrupoPL: null,
        Orden: null,
        Prioridad: null,
        PuestoTR: null,
        Ubicacion: null,
        lstMat: null,
        lstOpe: null,
    }
}





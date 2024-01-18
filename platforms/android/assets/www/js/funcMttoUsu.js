var lstMttoUsuario = [];
function gestionMttoUsuario() {
    var perUsu = lstPerUsu.find(x => x.SMODULO == "GestUsuario")
    //IAGREGAR,  ICONSULTAR,    IEJECUTAR,IELIMINAR,IMODIFICAR

    var sperfil = ""
    var url = getIPorHOSTApi() + "MttoChimuAPI/ListaUsuarioPerfil";

    $.ajax({
        url: url,
        crossDomain: true,
        cache: false,
        type: "Get",
        //async: false, 
        timeout: 60000,
        data: { sperfil: sperfil },
        beforeSend: function () {
            lstMttoUsuario.length = 0;
            $("#cargando").show();
        },
        success: function (data) {
            $("#cargando").hide();
            listaMttoUsuario(data)
        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Problemas al obtener lista Usuarios Perfil" + jqXHR)
        }
    });


    verPagConfMattUsu()

}

function verPagConfMattUsu() {

    var content = getRealContentHeight() - 10
    $(".ui-content").height(content);
    $(".table-scroll").height(content - 45)
    $.mobile.changePage('#pagConfMattUsu')
}

function listaMttoUsuario(data) {
    lstMttoUsuario = data;
    var cusuario = datosUsuario.CUSUARIO
    var dataUsuario = data.filter(x => x.CUSUARIO == cusuario);
    var lstAsignar = [];

    if (dataUsuario.length > 0) {
        var perfil = dataUsuario[0].Perfil
        $("#hidConfMattUsuPerfil").val(perfil)

        if (perfil == "MTTO_JEFE") {
            $(data).each(function (i, row) {
                if (row.Perfil == "MTTO_SUPERV" || row.Perfil == "MTTO_PLANER" || row.Perfil == "MTTO_JEFE")
                    lstAsignar.push(row)
            })
        }
        else if (perfil == "MTTO_PLANER") {
            $(data).each(function (i, row) {
                if (row.Perfil == "MTTO_SUPERV" || row.Perfil == "MTTO_CLIENTE")
                    lstAsignar.push(row)
            })
        }
        else if (perfil == "MTTO_SUPERV") {
            $(data).each(function (i, row) {
                if (row.Perfil == "MTTO_TECN")
                    lstAsignar.push(row)
            })
        }
    }

    var html = ""
    var existe = false;
    $(lstAsignar).each(function (i, row) {
        var Asignar = ""
        existe = true;
        Asignar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-gear ui-btn-icon-notext ui-btn-b ui-mini" onClick="AsignarOpc((\'' + row.CUSUARIO + ";" + row.Perfil + '\'))"></a>'

        html = html + '<tr> ' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + row.DUSUARIO + '</td>' +
            '<td>' + row.Perfil + '</td>' +
            '<td>' + Asignar + '</td>' +
            '</tr>';
    })
    if (!existe) {
        html = html + '<tr><td colspan=4 style="text-align:rigth" >No hay registro...</td></tr>'
    }

    $("#tblMttoUsu").find('tbody').empty();

    $("#tblMttoUsu").find('tbody').append(html);
    $("#tblMttoUsu").trigger('create')
    $("#tblMttoUsu").table("refresh");
}

function AsignarOpc(cusuPer) {

    var usuPerfil = cusuPer.split(";")
    var cusuario = usuPerfil[0]
    var dataUsu = lstMttoUsuario.filter(x => x.CUSUARIO == cusuario)
    var usuario = dataUsu[0].DUSUARIO
    $("#legMttoUsuAsig").html("Usaurio: " + usuario)

    $("#hidAsigCusuario").val(cusuario)

    $("#txtMttoUsuCen").val("")
    $("#hidIndexAsiUT").val("0")
    // obtenere los datos del usuario selecionado MTTOUSU    
    var url = getIPorHOSTApi() + "MttoChimuAPI/Configuracion"
    $.ajax({
        url: url,
        crossDomain: true,
        cache: false,
        //async: false,
        type: "Get",
        timeout: 60000,
        data: { cusuario: cusuario },
        beforeSend: function () {
            $("#cargando").show();
        },
        success: function (data) {
            if (data.Centro != "")
                $("#hidCusuAsig").val(data.CUSUARIO)
            $("#txtMttoUsuCen").val(data.Centro)
            llenarCbxPtoTabajoUsu(data.Centro, data.Puesto)
            //$("#cbxMttoUsuPue").val(data.Puesto)
            $("select#cbxMttoUsuPue").change()

            $.mobile.changePage('#pagMattUsuAsignacion')
            //
            $("#btnAddMttoUsuAsig").html("Agregar  GP")
            $("#hidNavbarMttoUsu").val("GP")

            var perfil = $("#hidConfMattUsuPerfil").val()
            // MTTO_JEFE GP   //MTTO_PLANER GP UT // MTTO_SUPERV GP UT
            $("#tblMttoUsuGP").find('tbody').empty();
            if (perfil == "MTTO_JEFE" || perfil == "MTTO_PLANER" || perfil == "MTTO_SUPERV")
                listarMttoUsuGP(data.Grupos)
            $("#tblMttoUsuUT").find('tbody').empty();
            if ("MTTO_PLANER" || perfil == "MTTO_SUPERV")
                listarMttoUsuUT(data.Ubicaciones)

            $("#tblMttoUsuTip").find('tbody').empty();

            listarMttoUsuTipo(data.Tipos)

            $("#cargando").hide();

            verpagMattUsuAsignacion()

        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Error al recuperar los datos de usuario" + jqXHR)

        }
    })
}

function verpagMattUsuAsignacion() {
    $.mobile.changePage('#pagMattUsuAsignacion')
}

function opcTabMttoUsu(opc) {

    $("#hidNavbarMttoUsu").val(opc)
    $("#btnAddMttoUsuAsig").html("Agregar " + opc)
}

function onchaObtPtoTrabajo(obj) {

    if (obj.value == "") return

    var centro = lstCentros.find(x => x.SITEM == obj.value)
    if (centro == null) {
        $("#txtMttoUsuCen").val("")
        $("#cbxMttoUsuPue").val("")
        $("select#cbxMttoUsuPue").change()
        navigator.notification.alert("Error, el centro Ingresado no existe")
    }

    llenarCbxPtoTabajoUsu(obj.value, "")
}

function llenarCbxPtoTabajoUsu(centro, puesto) {
    $("#cbxMttoUsuPue").empty()

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
            $("#cbxMttoUsuPue").append('<option value="">Seleccione Pto. Trabajo</option>')
            var ptoTabajo = data.filter(x => x.STABLA == "PUESTO")
            $(ptoTabajo).each(function (index, row) {
                if (puesto == row.SITEM)
                    $("#cbxMttoUsuPue").append('<option selected value="' + row.SITEM + '">' + row.SITEM + '</option>')
                else
                    $("#cbxMttoUsuPue").append('<option value="' + row.SITEM + '">' + row.SITEM + '</option>')
            });
            $("select#cbxMttoUsuPue").change()
        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Problemas al obtener Tablas Pto Trabajo")
        }
    });

}

function addMttoUsuAsig() {

    var tabSelect = $("#hidNavbarMttoUsu").val()
    //var perUsu = lstPerUsu.find(x => x.SMODULO == "GestionAviso")
    //console.log(lstPerUsu)

    var html = "";
    var addRow = true;
    if (tabSelect == "GP") {

        var lstGrupos = lstMaestros.filter(x => x.STABLA == "GRUPO")
        //perfi ver grupos
        var perfil = $("#hidConfMattUsuPerfil").val()
        var gruConUsu = dataLogConUsu.Grupos.split("|")
        if (gruConUsu == null)
            return
        var opts = ""
        if (perfil == "MTTO_PLANER" || perfil == "MTTO_SUPERV") {
            $(gruConUsu).each(function (i, valor) {
                var datGrup = lstGrupos.find(x => x.SITEM == valor)
                opts = opts == "" ? '<option value="' + datGrup.SITEM + '">' + datGrup.SITEM + '</option>' : opts + '<option value="' + datGrup.SITEM + '">' + datGrup.SITEM + '</option>'
            })          
        }
        else {
            $(lstGrupos).each(function (index, row) {
                opts = opts == "" ? '<option value="' + row.SITEM + '">' + row.SITEM + '</option>' : opts + '<option value="' + row.SITEM + '">' + row.SITEM + '</option>'
            });
        }
        var cbxGrupo = '<select name = "cbxGrupUsu" data-native-menu="false" data-mini="true" data-theme="d"  class="filterable-select">' +
            '<option value="">Seleccionar Grupo</option>' + opts +
            '</select> '

        addRow = true
        $("#tblMttoUsuGP tbody tr").each(function (index, row) {
            var dValor = $(row).find("td").find("select[name='cbxGrupUsu']").val()
            if (dValor.trim() == "")
                addRow = false
        })
        if (addRow) {
            var eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliMttoGP(this)"></a>'
            html = html + '<tr> ' +
                '<td>' + cbxGrupo + '</td>' +
                '<td>' + eliminar + '</td>'
            '</tr>';
            $("#tblMttoUsuGP").find('tbody').append(html);
            $("#tblMttoUsuGP").trigger('create')
            $("#tblMttoUsuGP").table("refresh");
        }

    }
    else if (tabSelect == "UT") {

        addRow = true
        $("#tblMttoUsuUT tbody tr").each(function (index, row) {
            var dValor = $(row).find("td").find("input[name='textCodUbiTec']").val()
            if (dValor.trim() == "")
                addRow = false
        });

        if (addRow) {
            var index = parseInt($("#hidIndexAsiUT").val()) + 1;
            $("#hidIndexAsiUT").val(index)

            var eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliMttoUT(this)"></a>'
            var busUT = '<button type="button" id="' + index + '" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-search ui-btn-icon-notext ui-btn-b ui-mini"' +
                'onClick="verPagUbiTecConUsu()"></button>'
            html = html + '<tr> ' +
                '<td><input type ="text" name="textCodUbiTec" id="textCodUbiTec_'+index + '" value="" data-mini="true" style="text-transform: uppercase"onkeyup="this.value = this.value.toUpperCase();"  autocomplete="off" onchange="onchagValidaUTUsu('+index+')"></td>' +
                '<td>' + busUT + "&nbsp;&nbsp;" + eliminar + '</td>' +
                '</tr>';

            $("#tblMttoUsuUT").find('tbody').append(html);
            $("#tblMttoUsuUT").trigger('create')
            $("#tblMttoUsuUT").table("refresh");


        }
    }
    else if (tabSelect == "TIPO") {


        var lstTipos = lstMaestros.filter(x => x.STABLA == "TIPO")
        var opts = ""
        $(lstTipos).each(function (index, row) {
            opts = opts == "" ? '<option value="' + row.SITEM + '">' + row.SITEM + '</option>' : opts + '<option value="' + row.SITEM + '">' + row.SITEM + '</option>'
        });
        var cbxTiposUsu = '<select name = "cbxTipoUsu" data-native-menu="false" data-mini="true" data-theme="d"  class="filterable-select">' +
            '<option value="">Seleccionar Tipos</option>' + opts +
            '</select> '

        addRow = true
        $("#tblMttoUsuTip tbody tr").each(function (index, row) {
            var dValor = $(row).find("td").find("select[name='cbxTipoUsu']").val()
            if (dValor.trim() == "")
                addRow = false
        });
        if (addRow) {
            var eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliMttoTipo(this)"></a>'
            html = html + '<tr> ' +
                '<td>' + cbxTiposUsu + '</td>' +
                '<td>' + eliminar + '</td>' +
                '</tr>';

            $("#tblMttoUsuTip").find('tbody').append(html);
            $("#tblMttoUsuTip").trigger('create')
            $("#tblMttoUsuTip").table("refresh");
        }
    }

}

function listarMttoUsuGP(dataGP) {

    $("#navbarMttoUsuGP").addClass("ui-btn-active ui-state-persist");
    $("#navbarMttoUsuGP").click()

    if (dataGP == null || dataGP == "")
        return
    var arrayGP = dataGP.split("|");

    var data = arrayGP;
    var html = ""
    var existe = false;

    var lstGrupos = lstMaestros.filter(x => x.STABLA == "GRUPO")

    $(data).each(function (i, dValor) {
        existe = true;

        var opts = ""
        $(lstGrupos).each(function (index, row) {
            var selected = row.SITEM == dValor ? "selected" : "";
            if (opts == "")
                opts = '<option value="' + row.SITEM + '"' + selected + '>' + row.SITEM + '</option>';
            else
                opts = opts + '<option value="' + row.SITEM + '"' + selected + '>' + row.SITEM + '</option>';

        });
        var cbxGrupo = '<select name = "cbxGrupUsu"  data-native-menu="false" data-mini="true" data-theme="d" disabled>' +
            '<option value="">Seleccionar</option>' + opts +
            '</select> '


        var eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliMttoGP(this)"></a>'
        html = html + '<tr> ' +
            '<td>' + cbxGrupo + '</td>' +
            '<td>' + eliminar + '</td>'
        '</tr>';
    })
    if (!existe) {
        html = html + '<tr><td colspan= 2 style="text-align:rigth" >No hay registros...</td></tr>'
    }

    $("#tblMttoUsuGP").find('tbody').empty();
    $("#tblMttoUsuGP").find('tbody').append(html);
    $("#tblMttoUsuGP").trigger('create')
    $("#tblMttoUsuGP").table("refresh");
}

function listarMttoUsuUT(dataUt) {

    if (dataUt == null || dataUt == "")
        return

    var arrayUT = dataUt.split("|");
    var data = arrayUT;
    var html = ""
    var existe = false;
    $(data).each(function (i, dValor) {
        existe = true;
        var index = parseInt($("#hidIndexAsiUT").val()) + 1;
        $("#hidIndexAsiUT").val(index)

        var eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliMttoUT(this)"></a>'
        var busUT = '<button type="button" id="btnBusUbiEdit" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-search ui-btn-icon-notext ui-btn-b ui-mini"' +
            'disabled/></button>'
        html = html + '<tr> ' +
            '<td><input type ="text" name="textCodUbiTec" id="textCodUbiTec_' + index + '" value="' + dValor + '" data-mini="true"  autocomplete="off" onchange="onchagValidaUTUsu('+index+')"></td>' +
            '<td>' + eliminar + '</td>' +
            '</tr>';

    })
    if (!existe) {
        html = html + '<tr><td colspan=2 style="text-align:rigth" >No hay registros...</td></tr>'
    }

    $("#tblMttoUsuUT").find('tbody').empty();
    $("#tblMttoUsuUT").find('tbody').append(html);
    $("#tblMttoUsuUT").trigger('create')
    $("#tblMttoUsuUT").table("refresh");

}

function listarMttoUsuTipo(dataTipos) {

    if (dataTipos == null || dataTipos == "")
        return
    var arrayTipos = dataTipos.split("|");

    var data = arrayTipos;

    var html = ""
    var existe = false;
    var lstTipos = lstMaestros.filter(x => x.STABLA == "TIPO")
    $(data).each(function (i, dValor) {
        existe = true;
        var opts = ""
        $(lstTipos).each(function (index, row) {
            var selected = row.SITEM == dValor ? "selected" : "";
            if (opts == "")
                opts = '<option value="' + row.SITEM + '"' + selected + '>' + row.SITEM + '</option>';
            else
                opts = opts + '<option value="' + row.SITEM + '"' + selected + '>' + row.SITEM + '</option>';

        });
        var cbxTipos = '<select name = "cbxTipoUsu"  data-native-menu="false" data-mini="true" data-theme="d" disabled>' +
            '<option value="">Seleccionar</option>' + opts +
            '</select> '


        var eliminar = '<a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-e ui-mini" onClick="eliMttoTipo(this)"></a>'
        html = html + '<tr> ' +
            '<td>' + cbxTipos + '</td>' +
            '<td>' + eliminar + '</td>' +
            '</tr>';
    })
    if (!existe) {
        html = html + '<tr><td colspan=2 style="text-align:rigth" >No hay registros...</td></tr>'
    }

    $("#tblMttoUsuTip").find('tbody').empty();
    $("#tblMttoUsuTip").find('tbody').append(html);
    $("#tblMttoUsuTip").trigger('create')
    $("#tblMttoUsuTip").table("refresh");
}

function onchagValidaUTUsu(index) {
    //var index = $("#hidIndexAsiUT").val()
    var codUT = $("#textCodUbiTec_" + index).val()
    var lstConUsuUT = dataLogConUsu.Ubicaciones.split("|")
    var lstUbi = lstMaestros.filter(x => x.STABLA == "UBITEC")

    var ubicaciones = "";
    $(lstConUsuUT).each(function (i, valor) {

        $(lstUbi).each(function (index, row) {
            if (row.SITEM.indexOf(valor) == 0)
                ubicaciones = ubicaciones == "" ? row.SITEM : ubicaciones + "|" + row.SITEM
        })
    })
    var arrarUbi = ubicaciones.split("|")
    if (arrarUbi != "" || arrarUbi != null)
        if (!arrarUbi.includes(codUT)) {
            $("#textCodUbiTec_" + index).val("")
            navigator.notification.alert("El Usuario no tiene asignado esta Ubicación")
        }

}

function verPagUbiTecConUsu() {
    //perfi ver grupos
    $("#txtBusUTUsu").val("")
    var perfil = $("#hidConfMattUsuPerfil").val()

    var lstConUsuUT = dataLogConUsu.Ubicaciones.split("|")
    var lstUbi = lstMaestros.filter(x => x.STABLA == "UBITEC")
    
    var lstUT = [];
    var ubicaciones = "";
    $(lstConUsuUT).each(function (i, valor) {
        $(lstUbi).each(function (index, row) {
            if (row.SITEM.indexOf(valor) == 0)
                ubicaciones = ubicaciones == "" ? row.SITEM : ubicaciones + "|" + row.SITEM
        })
    })
    $.mobile.changePage('#pagUbiTecConUsu')
    var html = ""
    var existe = false;
    if (ubicaciones.split("|") == "" || ubicaciones.split("|") == null) {
        $("#cargando").show();   
    
        $(lstUbi).each(function (i, row) {
            existe = true;
            html = html + '<tr> ' +
                '<td>' + row.SITEM + '</td>' +
                '</tr>';
        })
    }
    else{
        $("#cargando").show();   
        lstUT = ubicaciones.split("|")
        $(lstUT).each(function (i, row) {
            existe = true;
            html = html + '<tr> ' +
                '<td>' + row + '</td>' +
                '</tr>';
        })
    }

    if (!existe) {
        html = html + '<tr><td colspan=1 style="text-align:rigth" >No hay registros...</td></tr>'
    }

    $("#tblUbiTecConUsu").find('tbody').empty();

    $("#tblUbiTecConUsu").find('tbody').append(html);
    $("#tblUbiTecConUsu").trigger('create');
    $("#tblUbiTecConUsu").table("refresh");

    $("#cargando").hide();


}

function regMttoUsuAsig() {

    var cusuario = $("#hidAsigCusuario").val()
    var centro = $("#txtMttoUsuCen").val()
    var puesto = $("#cbxMttoUsuPue").val()

    var addGrupos = "", addUbiTec = "", addTipos = "";

    $("#tblMttoUsuGP tbody tr").each(function (index, row) {
        var dValor = $(row).find("td").find("select[name='cbxGrupUsu']").val()

        if (dValor.trim() != "") {

            if (addGrupos == "")
                addGrupos = dValor;
            else {
                if (addGrupos != dValor) {
                    var arrayGru = addGrupos.split("|")
                    if (arrayGru != "" || arrayGru != null) {
                        if (!arrayGru.includes(dValor)) {
                            addGrupos = addGrupos + "|" + dValor;
                        }
                    }
                    else
                        addGrupos = addGrupos + "|" + dValor;
                }

            }
        }
    });

    $("#tblMttoUsuUT tbody tr").each(function (index, row) {

        var dValor = $(row).find("td").find("input[name='textCodUbiTec']").val()

        if (dValor.trim() != "") {
            if (addUbiTec == "")
                addUbiTec = dValor;
            else {
                if (addGrupos != dValor) {
                    var arrayUT = addUbiTec.split("|")
                    if (arrayUT != "" || arrayUT != null) {
                        if (!arrayUT.includes(dValor)) {
                            addUbiTec = addUbiTec + "|" + dValor;
                        }
                    }
                    else
                    addUbiTec = addUbiTec + "|" + dValor;
                }
            }             
        }

    });
    $("#tblMttoUsuTip tbody tr").each(function (index, row) {

        var dValor = $(row).find("td").find("select[name='cbxTipoUsu']").val()

        if (dValor.trim() != "") {
            if (addTipos == "")
                addTipos = dValor;
            else {
                if (addGrupos != dValor) {
                    var arrayTip = addTipos.split("|")
                    if (arrayTip != "" || arrayTip != null) {
                        if (!arrayTip.includes(dValor)) {
                            addTipos = addTipos + "|" + dValor;
                        }
                    }
                    else
                    addTipos = addTipos + "|" + dValor;
                }
            }               
        }
    });

    var accion = $("#hidCusuAsig").val()

    var mttoUsuAsg = {
        Puesto: puesto,
        Centro: centro,
        Grupos: addGrupos,
        Ubicaciones: addUbiTec,
        Tipos: addTipos,
        Perfil: "",
        Cusuario: cusuario,
        Accion: accion > 0 ? "U" : "I"
    }

    var url = getIPorHOSTApi() + "MttoChimuAPI/MantMttoUsuario";
    $.ajax({
        url: url,
        type: "post",
        timeout: 60000,
        data: mttoUsuAsg,
        content: "application/json",
        beforeSend: function () {
            $("#cargando").show();
        },
        success: function (data) {
            $("#cargando").hide();
            if (data.Status == "OK") {

                verPagConfMattUsu()
                navigator.notification.alert("Datos registrados correctamente")
            }
            else
                navigator.notification.alert("Error, No se realizo el registro Mtto usuaro")
        },
        error: function (jqXHR, exception) {
            $("#cargando").hide();
            navigator.notification.alert("Error, No se realizo el registro Mtto usuaro" + jqXHR)
        }
    });

}

function eliMttoGP(btn) {
    $(btn).closest("tr").remove();
}
function eliMttoUT(btn) {
    $(btn).closest("tr").remove();
}
function eliMttoTipo(btn) {
    $(btn).closest("tr").remove();
}
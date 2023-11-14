// http://GSFECCQAS01.gsf.com.pe:8000/sap/bc/srt/wsdl/srvc_0050569AE61F1EEE9FCBB1A5A6A75FC8/wsdl11/allinone/ws_policy/document?sap-client=400
function gestionOM(){
    //var perUsu = lstPerUsu.find(x => x.SMODULO == "gestionOM")


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
    

        var ubiSelCong = $("#cbxConUbicacion").val()
        var ubiConfi = dataLogConUsu.Ubicaciones	 
        if (ubiSelCong != "")
            $("#txtUbiTecLisOM").val(ubiSelCong)
        else if (ubiConfi.length > 0)
            $("#txtUbiTecLisOM").val(ubiConfi.split("|")[0])
    
        $("select#cbxConGrupo").change()
    
        var html = "";
        html = html + '<tr><td colspan=7 style="text-align:rigth" >No hay registros...</td></tr>'
        $("#tbOpeOM").find('tbody').empty();
        $("#tblOpeOM").find('tbody').append(html);
        $("#tblOpeOM").trigger('create')
      


    $.mobile.changePage('#pagGestionOM')
}

function listarGestionOM(){
   

    $.mobile.changePage('#pagListaOpeOM') 

  

        $.ajax({
            url: getIPorHOSTApi() + "MttoChimuAPI/ListaAvisoOperacion",
            crossDomain: true,
            cache: false,
            type: "Get",
            timeout: 60000,
            data: { CodAviso: '1000036652' },
            beforeSend: function () {
                $("#cargando").show();
            },
            success: function (data) {
                $("#cargando").hide();
                listaOpeOM(data)    
            },
            error: function (jqXHR, exception) {
                $("#cargando").hide();
                navigator.notification.alert("Problemas al obtenere datos de Operaciones " + jqXHR)
    
            }
        });
    


}

function listaOpeOM(data) {

    var html = ""
	var existe = false;
	$(data).each(function (i, row) {
		existe = true;
		
		html = html + '<tr> ' +
			'<td>' + row.Codigo +
			'<input type="hidden" name="reqCodOpeOM" value="' + row.CodOpe + '">' +
			'<input type="hidden" name="reqCodReqOM" value="' + row.CodReq + '">' +
			'</td>' +
			'<td>' + row.Operacion + '</td>' +
			'<td>' + row.Ctrl + '</td>' +	
            '<td>' + row.Puesto + '</td>' +	
            '<td>' + row.Personas + '</td>' +	
            '<td>' + row.Horas + '</td>' +	
			'</tr>';
	})
	if (!existe) {
		html = html + '<tr><td colspan=6 style="text-align:rigth" >No hay registro...</td></tr>'
	}
	$("#tbOpeOM").find('tbody').empty();
	$("#tbOpeOM").find('tbody').append(html);
	$("#tbOpeOM").trigger('create')
	$("#tbOpeOM").table("refresh");


}
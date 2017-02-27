$(document).ready(function(){
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        document.addEventListener("backbutton", onBackKeyDown, true);
    }
    function onBackKeyDown() {
    }
});

$(window).load(function(){
    onInit();    
    deteclenguage();
    checkDefaultActualGlobal();
    valuesGroupDate();
    GetDatesDatabase();
    downloadByStore("");
    //loadComboRegions();

    $('.opt').click(function(){
        $('.opt').removeClass('active');
        $(this).addClass('active');
        var a=$(this).attr('data-value');
        if(a=="1"){
            GlobalFilterStores="1";
            if (current_lang == 'es'){
                $('.filterStoresSales').text("Todos");
            }else{
                $('.filterStoresSales').text("All");
            }
            $('.goalStore').removeClass('hide');
            $('.saleStore').removeClass('hide');
        }else if(a=="2"){
            GlobalFilterStores="2";
            if (current_lang == 'es'){
                $('.filterStoresSales').text("↑Arriba");
            }else{
                $('.filterStoresSales').text("↑Above");
            }
            $('.saleStore').removeClass('hide');
            $('.goalStore').addClass('hide');
        }else if(a=="3"){
            GlobalFilterStores="3";
            if (current_lang == 'es'){
                $('.filterStoresSales').text("↓Abajo");
            }else{
                $('.filterStoresSales').text("↓Below");
            }
            $('.saleStore').addClass('hide');
            $('.goalStore').removeClass('hide');  
        }
    }); 

});

var GlobalFilterStores="1";

//rotation screem
$(window).resize(function () {
    responsiveReport1();
});

function responsiveReport1() {
    var windowh = $(window).height();
    var headerh = $('header').height();
    var regionh = $('#divRegion').height();
    var selectdateP = $('.select-dateP').height();
    var selectGeneral = $('.select-general').height();
    if ($('#divRegion').css('display') == 'none') {//no hay region
        if($('#divFilter').css('display') == 'none'){
            $('.list').height(windowh - headerh - selectdateP - selectGeneral -20);
        }else{
            $('.list').height(windowh - headerh - selectdateP - selectGeneral -60);
        } 
    } else {
        $('.list').height(windowh - headerh - selectdateP - selectGeneral - 70);
    }
    $('.graphic').empty();
}

function GetDatesDatabase(){
    var c_ip = "";
    var c_port = "";
    var c_site = "";
    var xurl="";
    var RCSReports_SetDate=localStorage.RCSReports_SetDate;
    if(RCSReports_SetDate=="1"){
        var query ="SELECT * FROM " + TABLE_URL + " WHERE "  + KEY_USE + " = '1'";
        localDB.transaction(function (tx) {
            tx.executeSql(query, [], function (tx, results) {
                c_ip = results.rows.item(0).ip;
                c_port = results.rows.item(0).port;
                c_site = results.rows.item(0).site;
                xurl = 'http://' + c_ip + ':' + c_port + '/' + c_site + '/reportGetDates/GET';
                $.ajax({
                    url: xurl,
                    type: 'GET',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    async: true,
                    crossdomain: true,
                    beforeSend: function () {
                        //showLoading();
                    },
                    complete: function () {
                        //hideLoading();
                    },
                    success: function (data) {
                        if(data.quantity==1){
                            $('#time').text(data.report.Today);
                            $('#today').text(data.report.Today);
                            $('#yesterday').text(data.report.Yesterday);
                            $('#week').text(data.report.WeekToDate);
                            $('#month').text(data.report.MonthToDate);
                            $('#year').text(data.report.YearToDate);
                            $('#lastYear').text(data.report.LastYear);
                        }else{
                            if (current_lang == 'es'){
                                mostrarModalGeneral("No hay fechas para mostrar, establecer fechas del móvil");
                            }else{
                                mostrarModalGeneral("No dates for show, set mobile dates");
                            }
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr.status);
                        console.log(xhr.statusText);
                        console.log(xhr.responseText);
                        if (current_lang == 'es'){
                            mostrarModalGeneral("No hay fechas para mostrar, establecer fechas del móvil");
                        }else{
                            mostrarModalGeneral("No dates for show, set mobile dates");
                        }
                    }
                });
            });
        });   
    }else{
        comboWriteDates();
    }
}

//************** descargar data por compañia, en el array en el indice principal:1 ************//
function downloadByCompany() {
    filterStoreHideCombo();
    var xurl = "";
    var c_ip = "";
    var c_port = "";
    var c_site = "";
    var c_alias = "";

    var lblCurrentSale = "";
    var lblCurrentGoal = "";
    var lblGlobalSale = "";
    var lblGlobalGoal = "";
    localStorage.RCSReports_valuesGroupStore=1;
    //verifica si esta con impuestos
    var impuesto=localStorage.getItem("check_tax");
    hideCombo();
    localDB.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ' + TABLE_URL + ' WHERE  ' + KEY_USE + ' = 1', [], function (tx, results) {
            c_ip = results.rows.item(0).ip;
            c_port = results.rows.item(0).port;
            c_site = results.rows.item(0).site;
            c_alias = results.rows.item(0).alias;
            xurl = 'http://' + c_ip + ':' + c_port + '/' + c_site + '/reportCompany/POST';
            
            var option = localStorage.RCSReports_valuesRangeDates;
            var day=todayreport();
            var employeeCode=localStorage.RCSReportsEmployeeCode;
            var array = {Day:day, Option: option, Tax:impuesto,EmployeeCode:employeeCode};

            var actual = localStorage.check_actual_report1;
            var global = localStorage.check_global_report1;

            $.ajax({
                url: xurl,
                type: 'POST',
                data: JSON.stringify(array),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                async: true,
                crossdomain: true,
                beforeSend: function () {
                    showLoading();
                },
                complete: function () {
                    hideLoading();
                },
                success: function (data) {
                    $("#items").empty();
                    if (data.quantity > 0) {
                        var mostrar = "";
                        if (current_lang == 'es') {
                            if (option == 1) {
                                lblCurrentGoal = "MH:";
                                lblCurrentSale = "VH:";
                                lblGlobalGoal = "MS:";
                                lblGlobalSale = "VS:";
                            } else if (option == 2) {
                                lblCurrentGoal = "MA:";
                                lblCurrentSale = "VA:";
                                lblGlobalGoal = "MS:";
                                lblGlobalSale = "VS:";
                            } else if (option == 3) {
                                lblCurrentGoal = "MS:";
                                lblCurrentSale = "VS:";
                                lblGlobalGoal = "MM:";
                                lblGlobalSale = "VM:";
                            } else if (option == 4) {
                                lblCurrentGoal = "MM:";
                                lblCurrentSale = "VM:";
                                lblGlobalGoal = "MAH:";
                                lblGlobalSale = "VAH:";
                            } else if (option == 5) {
                                lblCurrentGoal = "MAH:";
                                lblCurrentSale = "VAH:";
                                lblGlobalGoal = "MAC:";
                                lblGlobalSale = "VAC:";
                            }else if (option == 6) {
                                lblCurrentGoal = "MAP:";
                                lblCurrentSale = "VAP:";
                            }
                        } else {
                            if (option == 1) {
                                lblCurrentGoal = "TG:";
                                lblCurrentSale = "TS:";
                                lblGlobalGoal = "WG:";
                                lblGlobalSale = "WS:";
                            } else if (option == 2) {
                                lblCurrentGoal = "YG:";
                                lblCurrentSale = "YS:";
                                lblGlobalGoal = "WG:";
                                lblGlobalSale = "WS:";
                            } else if (option == 3) {
                                lblCurrentGoal = "WG:";
                                lblCurrentSale = "WS:";
                                lblGlobalGoal = "MG:";
                                lblGlobalSale = "MS:";
                            } else if (option == 4) {
                                lblCurrentGoal = "MG:";
                                lblCurrentSale = "MS:";
                                lblGlobalGoal = "AG:";
                                lblGlobalSale = "AS:";
                            } else if (option == 5) {
                                lblCurrentGoal = "AG:";
                                lblCurrentSale = "AS:";
                                lblGlobalGoal = "CG:";
                                lblGlobalSale = "CS:";
                            }else if (option == 6) {
                                lblCurrentGoal = "LYG:";
                                lblCurrentSale = "LYS:";
                            }
                        }

                        mostrar += "<div id='divByCompany'>";
                        mostrar += "<div class='store waves-effect waves-light' onclick='grapihcCompanyDetails()'>";
                        mostrar += "<h1>" + c_alias + '</h1>';
                        $(data.report).each(function (index, value) {
                            var goalAmount = value.goalAmount;
                            var goalAmountGlobal = value.goalAmountGlobal;
                            var payTotal = value.payTotal;
                            var payTotalGlobal = value.payTotalGlobal;
                            var percent = 0.00;
                            var percentGlobal = 0.00;
                            goalAmount = parseFloat(goalAmount.replace(",", ".")).toFixed(0);
                            goalAmountGlobal = parseFloat(goalAmountGlobal.replace(",", ".")).toFixed(0);
                            payTotal = parseFloat(payTotal.replace(",", ".")).toFixed(0);
                            payTotalGlobal = parseFloat(payTotalGlobal.replace(",", ".")).toFixed(0);


                            var color = "";
                            var colorGlobal = "";

                            //calculo de percent
                            if (payTotal > 0 && goalAmount == 0.00) {
                                percent = 0.00;
                            } else if (payTotal == 0 && goalAmount == 0.00) {
                                percent = 0.00;
                            } else {
                                percent = (payTotal * 100) / goalAmount;
                            }

                            //calculo de percentglobal
                            if (payTotalGlobal > 0.00 && goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            } else if (payTotalGlobal == 0.00 && goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            } else {
                                percentGlobal = (payTotalGlobal * 100) / goalAmountGlobal;
                            }



                            if (payTotal == 0.00 || goalAmount == 0.00) {
                                percent = 0.00;
                            }

                            if (payTotalGlobal == 0.00 || goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            }



                            if (percent < 75) {
                                color = "red";
                            }

                            if (percent > 74 && percent < 100) {
                                color = "ambar";
                            }
                            if (percent > 99) {
                                color = "green";
                            }
                            if (goalAmount == 0.00 && payTotal > 0.00) {
                                color = "green";
                            }
                            if (percentGlobal < 75) {
                                colorGlobal = "red";
                            }
                            if (percentGlobal > 74 && percentGlobal < 100) {
                                colorGlobal = "ambar";
                            }
                            if (percentGlobal > 99) {
                                colorGlobal = "green";
                            }
                            if (goalAmountGlobal == 0.00 && payTotalGlobal > 0.00) {
                                colorGlobal = "green";
                            }
                            percent = parseFloat(percent).toFixed(0);
                            percentGlobal =parseFloat(percentGlobal).toFixed(0);

                            if (actual == 1) {
                                mostrar += "<div class='actual'>";
                                mostrar += "<i>" + lblCurrentGoal + "</i>";
                                mostrar += "<p>" + parseFloat(goalAmount).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<i>" + lblCurrentSale + "</i>";
                                mostrar += "<p>" + parseFloat(payTotal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<span class='" + color + "'>" + percent + " %</span>";
                                mostrar += "</div>";
                            }
                            if (global == 1 && option!=6) {
                                mostrar += "<div class='global'>";
                                mostrar += "<i>" + lblGlobalGoal + "</i>";
                                mostrar += "<p>" + parseFloat(goalAmountGlobal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<i>" + lblGlobalSale + "</i>";
                                mostrar += "<p>" + parseFloat(payTotalGlobal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<span class='" + colorGlobal + "'>" + percentGlobal + " %</span>";
                                mostrar += "</div>";
                            }
                            
                            
                        });
                            mostrar +="<div id='graphCompanyDetails' class='graphic showGraphic'>";
                            mostrar += "</div>";
                            mostrar += "</div>";
                            mostrar += "</div>";
                            mostrar += "<hr>";
                        $("#items").append(mostrar);   
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(xhr.statusText);
                    console.log(xhr.responseText);
                    if (current_lang == 'es'){
                        mostrarModalGeneral("Error de Conexión");
                    }else{
                        mostrarModalGeneral("No Connection");
                    }
                }
            });
            responsiveReport1();
        }, null);
    });
}

function  grapihcCompanyDetails(){
    var altura = $('#graphCompanyDetails').height();
    if (altura > 0) { // esta mostrandose ; se debe ocultar
        $('.graphic').empty();
    } else { //  para toda la lista, remover el showing
        $('.graphic').empty();
        localDB.transaction(function (tx) {
            tx.executeSql('SELECT * FROM ' + TABLE_URL + ' WHERE  ' + KEY_USE + ' = 1', [], function (tx, results) {
                var c_ip = results.rows.item(0).ip;
                var c_port = results.rows.item(0).port;
                var c_site = results.rows.item(0).site;
                var xurl = 'http://' + c_ip + ':' + c_port + '/' + c_site + '/reportCompanyDetails/POST';
                var option = localStorage.RCSReports_valuesRangeDates;
                var tax=localStorage.getItem("check_tax");
                var day=todayreport();
                var employeeCode=localStorage.RCSReportsEmployeeCode;
                var array = {Day:day, Option: option, Tax: tax, EmployeeCode: employeeCode};
                /*********************/
                $.ajax({
                    url: xurl,
                    type: 'POST',
                    data: JSON.stringify(array),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    async: true,
                    crossdomain: true,
                    beforeSend: function () {
                        showLoading();
                    },
                    complete: function () {
                        hideLoading();
                    },
                    success: function (data) {

                        if(data.quantity>0){
                            $("#graphCompanyDetails").empty();
                            var array_description = [];
                            var array_total = [];
                            var mostrar="";
                            $(data.data).each(function (index, value) {
                            array_description[index] = value.Info;
                            array_total[index] = value.Total;
                            });
                            mostrar +="<div id='chartdiv' class='chartdiv'></div>";
                            mostrar += "<div class='detalle-0'>";
                            if (current_lang == 'es'){
                                mostrar += "<div class='year'>Año</div><div class='quantity'>Cantidad</div>";
                            }else{
                                mostrar += "<div class='year'>Year</div><div class='quantity'>Quantity</div>";
                            }
                            mostrar += "<i>" + array_description[0] + "</i><span>" + parseFloat(array_total[0]).toFixed().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</span>";
                            mostrar += "<i>" + array_description[1] + "</i><span>" + parseFloat(array_total[1]).toFixed().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</span>";
                            mostrar += "<i>" + array_description[2] + "</i><span>" + parseFloat(array_total[2]).toFixed().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</span>";

                            mostrar += "</div>";
                            $("#graphCompanyDetails").append(mostrar);
                            drawGraphic(array_description[0], array_description[1], array_description[2],
                            array_total[0], array_total[1], array_total[2]);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr.status);
                        console.log(xhr.statusText);
                        console.log(xhr.responseText);
                    }
                });
            });
        });
    }
}

//************** Descargar data por Region, en el array en el indice byRegion:2*********//
function downloadByRegion() {
    filterStoreShowCombo();

    var xurl = "";
    var c_ip = "";
    var c_port = "";
    var c_site = "";

    var lblCurrentSale = "";
    var lblCurrentGoal = "";
    var lblGlobalSale = "";
    var lblGlobalGoal = "";

    localStorage.RCSReports_valuesGroupStore=2;
    //verifica si esta con impuestos
    var impuesto=localStorage.getItem("check_tax");
    hideCombo();
    localDB.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ' + TABLE_URL + ' WHERE  ' + KEY_USE + ' = 1', [], function (tx, results) {

            c_ip = results.rows.item(0).ip;
            c_port = results.rows.item(0).port;
            c_site = results.rows.item(0).site;

            xurl = 'http://' + c_ip + ':' + c_port + '/' + c_site + '/reportByRegion/POST';

            var option = localStorage.RCSReports_valuesRangeDates;
            var day=todayreport();
            var employeeCode=localStorage.RCSReportsEmployeeCode;
            
            var array= {Day:day, Option: option,Tax: impuesto,EmployeeCode:employeeCode};
            var actual = localStorage.check_actual_report1;
            var global = localStorage.check_global_report1;
            $.ajax({
                url: xurl,
                type: 'POST',
                data: JSON.stringify(array),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                async: true,
                crossdomain: true,
                beforeSend: function () {
                    showLoading();
                },
                complete: function () {
                    hideLoading();
                },
                success: function (data) {
                    $("#items").empty();

                    if (data.quantity > 0) {
                        var mostrar = "";
                        //mostrar += "<div id='divByRegion'>";

                        if (current_lang == 'es') {
                            if (option == 1) {
                                lblCurrentGoal = "MH:";
                                lblCurrentSale = "VH:";
                                lblGlobalGoal = "MS:";
                                lblGlobalSale = "VS:";
                            } else if (option == 2) {
                                lblCurrentGoal = "MA:";
                                lblCurrentSale = "VA:";
                                lblGlobalGoal = "MS:";
                                lblGlobalSale = "VS:";
                            } else if (option == 3) {
                                lblCurrentGoal = "MS:";
                                lblCurrentSale = "VS:";
                                lblGlobalGoal = "MM:";
                                lblGlobalSale = "VM:";
                            } else if (option == 4) {
                                lblCurrentGoal = "MM:";
                                lblCurrentSale = "VM:";
                                lblGlobalGoal = "MAH:";
                                lblGlobalSale = "VAH:";
                            } else if (option == 5) {
                                lblCurrentGoal = "MAH:";
                                lblCurrentSale = "VAH:";
                                lblGlobalGoal = "MAC:";
                                lblGlobalSale = "VAC:";
                            }else if (option == 6) {
                                lblCurrentGoal = "MAP:";
                                lblCurrentSale = "VAP:";
                            }
                        } else {
                            if (option == 1) {
                                lblCurrentGoal = "TG:";
                                lblCurrentSale = "TS:";
                                lblGlobalGoal = "WG:";
                                lblGlobalSale = "WS:";
                            } else if (option == 2) {
                                lblCurrentGoal = "YG:";
                                lblCurrentSale = "YS:";
                                lblGlobalGoal = "WG:";
                                lblGlobalSale = "WS:";
                            } else if (option == 3) {
                                lblCurrentGoal = "WG:";
                                lblCurrentSale = "WS:";
                                lblGlobalGoal = "MG:";
                                lblGlobalSale = "MS:";
                            } else if (option == 4) {
                                lblCurrentGoal = "MG:";
                                lblCurrentSale = "MS:";
                                lblGlobalGoal = "AG:";
                                lblGlobalSale = "AS:";
                            } else if (option == 5) {
                                lblCurrentGoal = "AG:";
                                lblCurrentSale = "AS:";
                                lblGlobalGoal = "CG:";
                                lblGlobalSale = "CS:";
                            }else if (option == 6) {
                                lblCurrentGoal = "LYG:";
                                lblCurrentSale = "LYS:";
                            }
                        }


                        $(data.report).each(function (index, value) {

                            var regionName = value.region;
                            var regionCode=value.regioncode;
                            var goalAmount = value.goalamount;
                            var goalAmountGlobal = value.goalamountglobal;
                            var payTotal = value.paytotal;
                            var payTotalGlobal = value.paytotalglobal;
                            var percent = 0.00;
                            var percentGlobal = 0.00;
                            var cont=index;

                            goalAmount = parseFloat(goalAmount.replace(",", ".")).toFixed(0);
                            goalAmountGlobal = parseFloat(goalAmountGlobal.replace(",", ".")).toFixed(0);
                            payTotal = parseFloat(payTotal.replace(",", ".")).toFixed(0);
                            payTotalGlobal = parseFloat(payTotalGlobal.replace(",", ".")).toFixed(0);


                            var color = "";
                            var colorGlobal = "";

                            //calculo de percent
                            if (payTotal > 0 && goalAmount == 0.00) {
                                percent = 0.00;
                            } else if (payTotal == 0 && goalAmount == 0.00) {
                                percent = 0.00;
                            } else {
                                percent = (payTotal * 100) / goalAmount;
                            }

                            //calculo de percentglobal
                            if (payTotalGlobal > 0.00 && goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            } else if (payTotalGlobal == 0.00 && goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            } else {
                                percentGlobal = (payTotalGlobal * 100) / goalAmountGlobal;
                            }

                            if (payTotal == 0.00 || goalAmount == 0.00) {
                                percent = 0.00;
                            }

                            if (payTotalGlobal == 0.00 || goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            }

                            if (percent < 75) {
                                color = "red";
                            }

                            if (percent > 74 && percent < 100) {
                                color = "ambar";
                            }

                            if (percent > 99) {
                                color = "green";
                            }

                            if (goalAmount == 0.00 && payTotal > 0.00) {
                                color = "green";
                            }

                            if (percentGlobal < 75) {
                                colorGlobal = "red";
                            }

                            if (percentGlobal > 74 && percentGlobal < 100) {
                                colorGlobal = "ambar";
                            }

                            if (percentGlobal > 99) {
                                colorGlobal = "green";
                            }

                            if (goalAmountGlobal == 0.00 && payTotalGlobal > 0.00) {
                                colorGlobal = "green";
                            }

                            percent = parseFloat(percent).toFixed(0);
                            percentGlobal =parseFloat(percentGlobal).toFixed(0);

                            mostrar += "<div class='store waves-effect waves-light' onclick=storeWitdhGraphic2("+cont+",'"+regionCode+"') >";
                            mostrar += "<h1>" + regionName + "</h1>";
                            if (actual == 1) {
                                mostrar += "<div class='actual'>";

                                mostrar += "<i>" + lblCurrentGoal + "</i>";
                                mostrar += "<p>" + parseFloat(goalAmount).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<i>" + lblCurrentSale + "</i>";
                                mostrar += "<p>" + parseFloat(payTotal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<span class='" + color + "'>" + percent + " %</span>";

                                mostrar += "</div>";
                            }
                            if (global == 1 && option!=6) {
                                mostrar += "<div class='global'>";

                                mostrar += "<i class='type'>" + lblGlobalGoal + "</i>";
                                mostrar += "<p class='gol-number'>" + parseFloat(goalAmountGlobal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<i class='type'>" + lblGlobalSale + "</i>";
                                mostrar += "<p class='sale-number'>" + parseFloat(payTotalGlobal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<span class='" + colorGlobal + "'>" + percentGlobal + " %</span>";

                                mostrar += "</div>";
                            }
                            

                            
                            mostrar += "<div class='region_store regionList' id='graph_region"+cont+"' >"
                           
                            mostrar += "</div>";

                            
                            mostrar += "</div><hr>";

                           

                        });
                        //mostrar += "</div>";
                        $("#items").append(mostrar);
                        
                    }
                    responsiveReport1();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(xhr.statusText);
                    console.log(xhr.responseText);
                    //hideLoading();
                    if (current_lang == 'es'){
                        mostrarModalGeneral("Error de Conexión");
                    }     
                    else{
                        mostrarModalGeneral("No Connection");
                    }
                }
            });
        });
    });
}

//muestra el combo de regiones
function loadComboRegions() {
    var yurl = "";
    var c_ip = "";
    var c_port = "";
    var c_site = "";
    var selectRegion = "ALL REGION";
    localStorage.RCSReports_valuesGroupStore=3;
    //pinta el titulo del reporte1
    $('#txt_title').text(localStorage.getItem("titleReport1"));
    
      localDB.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ' + TABLE_URL + ' WHERE  ' + KEY_USE + ' = 1', [], function (tx, results) {
            c_ip = results.rows.item(0).ip;
            c_port = results.rows.item(0).port;
            c_site = results.rows.item(0).site;
            yurl = 'http://' + c_ip + ':' + c_port + '/' + c_site + '/region/';

            $.ajax({
                url: yurl,
                type: 'get',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                timeout: 15000,
                crossdomain: true,
                async: true,
                beforeSend: function () {
                    //showLoading();
                },
                complete: function () {
                    //hideLoading();
                },
                success: function (data, textStatus, XMLHttpRequest) {
                    $("#selectRegion").empty();  
                    $('.region .section_content .select-region').empty();
                    
                    if (data.quantity ==1) { //este objeto data es el object que devuelve el webservice(2 atributos (1jsonarray y el otro un entero))
                        
                        if (current_lang == 'es'){
                            selectRegion = "TODAS LAS REGIONES";
                        }

                        $("#selectRegion").append("<div data-value='R-1' class='init item innerLi' onclick='moveToLeft(4);'>" + selectRegion + "</div>");

                        $('.region .section_content .select-region').append("<div class='item selected' data-value='R-1' onclick=downloadByStore('')>" + selectRegion + "</div>");

                        $(data.data).each(function (index, value) {
                            var regionCode = value.regionCode;
                            var regionName = value.regionName;
                            $('.region .section_content .select-region').append("<hr>");
                            $('.region .section_content .select-region')
                            .append($("<div class='item' id=" + regionCode + " onclick=downloadByStore('"+regionCode+"')>" + regionName + "</div>")
                                    .attr("data-value", regionCode)
                                    .text(regionName));

                        });
                        showCombo();
                        downloadByStore("");
                    } else {
                        hideCombo();
                        downloadByStore("");
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(xhr.statusText);
                    console.log(xhr.responseText);
                    if (current_lang == 'es'){
                        mostrarModalGeneral("Error de Conexión");
                    }
                    else{
                        mostrarModalGeneral("No Connection");
                    }
                }
            });
        });
    });
}

//************ Descargar data por Store, en el arrary su indice vale***********//
function downloadByStore(regionCode) {
    hideCombo();
    filterStoreShowCombo();
    $('#txt_title').text(localStorage.getItem("titleReport1"));
    localStorage.RCSReports_valuesGroupStore=3;

    var xurl = "";
    var c_ip = "";
    var c_port = "";
    var c_site = "";

    var lblCurrentSale = "";
    var lblCurrentGoal = "";
    var lblGlobalSale = "";
    var lblGlobalGoal = "";

    var option = localStorage.RCSReports_valuesRangeDates;
    
    var regioncode=regionCode;
    // localStorage.RCSReports_regioncode=regionCode;
    //verifica si esta con impuestos
    var impuesto=localStorage.getItem("check_tax");

    var day=todayreport();
    var employeeCode=localStorage.RCSReportsEmployeeCode;
    var array = {Option: option, RegionCode: regionCode,Tax: impuesto,Day:day,EmployeeCode:employeeCode};
    var actual = localStorage.check_actual_report1;
    var global = localStorage.check_global_report1;


    localDB.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ' + TABLE_URL + ' WHERE  ' + KEY_USE + ' = 1', [], function (tx, results) {
            c_ip = results.rows.item(0).ip;
            c_port = results.rows.item(0).port;
            c_site = results.rows.item(0).site;
            xurl = 'http://' + c_ip + ':' + c_port + '/' + c_site + '/reportgoal/post';


            /*********************/
            $.ajax({
                url: xurl,
                type: 'POST',
                data: JSON.stringify(array),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                async: true,
                crossdomain: true,
                beforeSend: function () {
                    showLoading();
                },
                complete: function () {
                    hideLoading();
                },
                success: function (data) {
                    $("#items").empty();

                    if (data.quantity > 0) {
                        var mostrar = "";
                        var indice = 0;

                        if (current_lang == 'es') {
                            if (option == 1) {
                                lblCurrentGoal = "MH:";
                                lblCurrentSale = "VH:";
                                lblGlobalGoal = "MS:";
                                lblGlobalSale = "VS:";
                            } else if (option == 2) {
                                lblCurrentGoal = "MA:";
                                lblCurrentSale = "VA:";
                                lblGlobalGoal = "MS:";
                                lblGlobalSale = "VS:";
                            } else if (option == 3) {
                                lblCurrentGoal = "MS:";
                                lblCurrentSale = "VS:";
                                lblGlobalGoal = "MM:";
                                lblGlobalSale = "VM:";
                            } else if (option == 4) {
                                lblCurrentGoal = "MM:";
                                lblCurrentSale = "VM:";
                                lblGlobalGoal = "MAH:";
                                lblGlobalSale = "VAH:";
                            } else if (option == 5) {
                                lblCurrentGoal = "MAH:";
                                lblCurrentSale = "VAH:";
                                lblGlobalGoal = "MAC:";
                                lblGlobalSale = "VAC:";
                            }else if (option == 6) {
                                lblCurrentGoal = "MAP:";
                                lblCurrentSale = "VAP:";
                            }
                        } else {
                            if (option == 1) {
                                lblCurrentGoal = "TG:";
                                lblCurrentSale = "TS:";
                                lblGlobalGoal = "WG:";
                                lblGlobalSale = "WS:";
                            } else if (option == 2) {
                                lblCurrentGoal = "YG:";
                                lblCurrentSale = "YS:";
                                lblGlobalGoal = "WG:";
                                lblGlobalSale = "WS:";
                            } else if (option == 3) {
                                lblCurrentGoal = "WG:";
                                lblCurrentSale = "WS:";
                                lblGlobalGoal = "MG:";
                                lblGlobalSale = "MS:";
                            } else if (option == 4) {
                                lblCurrentGoal = "MG:";
                                lblCurrentSale = "MS:";
                                lblGlobalGoal = "AG:";
                                lblGlobalSale = "AS:";
                            } else if (option == 5) {
                                lblCurrentGoal = "AG:";
                                lblCurrentSale = "AS:";
                                lblGlobalGoal = "CG:";
                                lblGlobalSale = "CS:";
                            }else if (option == 6) {
                                lblCurrentGoal = "LYG:";
                                lblCurrentSale = "LYS:";
                            }
                        }

                        $(data.report).each(function (index, value) {

                            var storeName = value.storeName;
                            var goalAmount = value.goalAmount;
                            var goalAmountGlobal = value.goalAmountGlobal;
                            var payTotal = value.payTotal;
                            var payTotalGlobal = value.payTotalGlobal;
                            var storeNo=value.storeNo;
                            var lastConexion = value.lastConexion;
                            var percent = 0.00;
                            var percentGlobal = 0.00;


                            goalAmount = parseFloat(goalAmount.replace(",", ".")).toFixed(0);
                            goalAmountGlobal = parseFloat(goalAmountGlobal.replace(",", ".")).toFixed(0);
                            payTotal = parseFloat(payTotal.replace(",", ".")).toFixed(0);
                            payTotalGlobal = parseFloat(payTotalGlobal.replace(",", ".")).toFixed(0);
                            var color = "";
                            var colorGlobal = "";



                            //calculo de percent
                            if (payTotal > 0 && goalAmount == 0.00) {
                                percent = 0.00;
                            } else if (payTotal == 0 && goalAmount == 0.00) {
                                percent = 0.00;
                            } else {
                                percent = (payTotal * 100) / goalAmount;
                            }


                            //calculo de percentglobal
                            if (payTotalGlobal > 0.00 && goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            } else if (payTotalGlobal == 0.00 && goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            } else {
                                percentGlobal = (payTotalGlobal * 100) / goalAmountGlobal;
                            }

                            if (payTotal == 0.00 || goalAmount == 0.00) {
                                percent = 0.00;
                            }

                            if (payTotalGlobal == 0.00 || goalAmountGlobal == 0.00) {
                                percentGlobal = 0.00;
                            }

                            if (percent < 75) {
                                color = "red";
                            }

                            if (percent > 74 && percent < 100) {
                                color = "ambar";
                            }

                            if (percent > 99) {
                                color = "green";
                            }

                            if (goalAmount == 0.00 && payTotal > 0.00) {
                                color = "green";
                            }

                            if (percentGlobal < 75) {
                                colorGlobal = "red";
                            }
                            if (percentGlobal > 74 && percentGlobal < 100) {
                                colorGlobal = "ambar";
                            }

                            if (percentGlobal > 99) {
                                colorGlobal = "green";
                            }

                            if (goalAmountGlobal == 0.00 && payTotalGlobal > 0.00) {
                                colorGlobal = "green";
                            }

                            percent = parseFloat(percent).toFixed(0);
                            percentGlobal = parseFloat(percentGlobal).toFixed(0);


                            if(goalAmount-payTotal>0){
                                if(GlobalFilterStores=="1"){
                                    mostrar += "<div onclick=\"storeWitdhGraphic(" + indice + ","+storeNo+")\" class='store waves-effect waves-light goalStore'>";
                                }else if(GlobalFilterStores=="2"){
                                    mostrar += "<div onclick=\"storeWitdhGraphic(" + indice + ","+storeNo+")\" class='store waves-effect waves-light goalStore hide'>";
                                }else if(GlobalFilterStores=="3"){
                                    mostrar += "<div onclick=\"storeWitdhGraphic(" + indice + ","+storeNo+")\" class='store waves-effect waves-light goalStore'>";
                                }
                            }else{
                                if(GlobalFilterStores=="1"){
                                    mostrar += "<div onclick=\"storeWitdhGraphic(" + indice + ","+storeNo+")\" class='store waves-effect waves-light saleStore'>";
                                }else if(GlobalFilterStores=="2"){
                                    mostrar += "<div onclick=\"storeWitdhGraphic(" + indice + ","+storeNo+")\" class='store waves-effect waves-light saleStore'>";
                                }else if(GlobalFilterStores=="3"){
                                    mostrar += "<div onclick=\"storeWitdhGraphic(" + indice + ","+storeNo+")\" class='store waves-effect waves-light saleStore hide'>";
                                }                                
                            }

                            // mostrar += "<div onclick=\"storeWitdhGraphic(" + indice + ","+storeNo+")\" class='store waves-effect waves-light'>";
                            mostrar += "<h1 class='storeNameR1'>" + storeName + "</h1>";
                            // if (current_lang == 'es'){
                            //     mostrar += "<div class='lastConexion'><div class='dataLastConexion'>" + lastConexion + "</div></div>";
                            // }else{
                            mostrar += "<div class='lastConexion'><div class='dataLastConexion'>" + lastConexion + "</div></div>";
                            // }


                            if (actual == 1) {
                                mostrar += "<div class='actual'>";
                                mostrar += "<i>" + lblCurrentGoal + "</i>";
                                mostrar += "<p>" + parseFloat(goalAmount).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<i>" + lblCurrentSale + "</i>";
                                mostrar += "<p>" + parseFloat(payTotal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<span class='" + color + "'>" + percent + " %</span>";

                                mostrar += "</div>";
                            }

                            if (global == 1 && option!=6) {
                                mostrar += "<div class='global'>";
                                mostrar += "<i>" + lblGlobalGoal + "</i>";
                                mostrar += "<p>" + parseFloat(goalAmountGlobal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<i>" + lblGlobalSale + "</i>";
                                mostrar += "<p>" + parseFloat(payTotalGlobal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                mostrar += "<span class='" + colorGlobal + "'>" + percentGlobal + " %</span>";

                                mostrar += "</div>";
                            }


                            mostrar +="<div id='graph" + indice + "' class='graphic showGraphic'>";
                            mostrar += "</div>";
                            // mostrar += "</div><hr>";
                            mostrar += "</div>";
                            $("#items").append(mostrar);
                            
                            mostrar = "";
                            indice++;

                        });
                        responsiveReport1();
                        //deteclenguage();
                    }
                 
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(xhr.statusText);
                    console.log(xhr.responseText);
                    
                    if (current_lang == 'es'){
                        mostrarModalGeneral("Error de Conexión");
                    }else{
                        mostrarModalGeneral("No Connection");
                    }
                }
            });
            /**********************/
        });
    });
}

function storeWitdhGraphic(indice,storeno) {
    var altura = $('#graph' + indice).height();
    if (altura > 0) { // esta mostrandose ; se debe ocultar
        $('.graphic').empty();
    } else { //  para toda la lista, remover el showing
        $('.graphic').empty();
        localDB.transaction(function (tx) {
            tx.executeSql('SELECT * FROM ' + TABLE_URL + ' WHERE  ' + KEY_USE + ' = 1', [], function (tx, results) {
                var c_ip = results.rows.item(0).ip;
                var c_port = results.rows.item(0).port;
                var c_site = results.rows.item(0).site;
                var xurl = 'http://' + c_ip + ':' + c_port + '/' + c_site + '/reportgoalDetails/post';
                var option = $(".select-dateP .init").attr("data-value");
                var impuesto=localStorage.getItem("check_tax");
                var day=todayreport();

                var array = {Option: option, StoreNo: storeno,Tax: impuesto,Day:day};
                /*********************/
                $.ajax({
                    url: xurl,
                    type: 'POST',
                    data: JSON.stringify(array),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    async: true,
                    crossdomain: true,
                    beforeSend: function () {
                        showLoading();
                    },
                    complete: function () {
                        hideLoading();
                    },
                    success: function (data) {

                        if(data.quantity>0){
                            var array_description = [];
                            var array_total = [];
                            $("#graph"+indice).empty();
                            var mostrar="";
                            $(data.info).each(function (index, value) {
                            var info = value.info;
                            var total = value.total;
                            array_description[index] = info;
                            array_total[index] = total;
                            });
                            mostrar +="<div id='chartdiv' class='chartdiv'></div>";
                            mostrar += "<div class='detalle-" + indice + "'>";
                            if (current_lang == 'es'){
                                mostrar += "<div class='year'>Año</div><div class='quantity'>Cantidad</div>";
                            }else{
                                mostrar += "<div class='year'>Year</div><div class='quantity'>Quantity</div>";
                            }
                            mostrar += "<i>" + array_description[0] + "</i><span>" + parseFloat(array_total[0]).toFixed().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</span>";
                            mostrar += "<i>" + array_description[1] + "</i><span>" + parseFloat(array_total[1]).toFixed().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</span>";
                            mostrar += "<i>" + array_description[2] + "</i><span>" + parseFloat(array_total[2]).toFixed().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</span>";

                            mostrar += "</div></div>";
                            mostrar += "</div>";
                            $("#graph"+indice).append(mostrar);
                            drawGraphic(array_description[0], array_description[1], array_description[2],
                            array_total[0], array_total[1], array_total[2], indice);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr.status);
                        console.log(xhr.statusText);
                        console.log(xhr.responseText);
                        ///hideLoading();
                        if (current_lang == 'es'){
                            mostrarModalGeneral("Error de Conexión");
                        }else{
                            mostrarModalGeneral("No Connection");
                        }
                    }
                });
            });
        });
    }
}

function storeWitdhGraphic2(indice,regionCode) {
    var altura = $('#graph_region'+indice).height();
    if (altura > 0) { // esta mostrandose ; se debe ocultar
        $('.region_store').empty();
    } else {    
        $('.region_store').empty();
        var option = $(".select-dateP .init").attr("data-value");
        var impuesto=localStorage.getItem("check_tax");
        var day=todayreport();
        var employeeCode=localStorage.RCSReportsEmployeeCode;

        var array = {Option: option, RegionCode: regionCode,Tax: impuesto,Day:day,EmployeeCode:employeeCode};

        localDB.transaction(function (tx) {
            tx.executeSql('SELECT * FROM ' + TABLE_URL + ' WHERE  ' + KEY_USE + ' = 1', [], function (tx, results) {
                var c_ip = results.rows.item(0).ip;
                var c_port = results.rows.item(0).port;
                var c_site = results.rows.item(0).site;
                var actual = localStorage.check_actual_report1;
                var global = localStorage.check_global_report1;
                
                var xurl = 'http://' + c_ip + ':' + c_port + '/' + c_site + '/reportgoal/post';

                /*********************/
                $.ajax({
                    url: xurl,
                    type: 'POST',
                    data: JSON.stringify(array),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    async: true,
                    crossdomain: true,
                    beforeSend: function () {
                        showLoading();
                    },
                    complete: function () {
                        hideLoading();
                    },
                    success: function (data) {
                        $("#graph_region"+indice).empty();

                        if (data.quantity > 0) {

                            if (current_lang == 'es') {
                                if (option == 1) {
                                    lblCurrentGoal = "MH:";
                                    lblCurrentSale = "VH:";
                                    lblGlobalGoal = "MS:";
                                    lblGlobalSale = "VS:";
                                } else if (option == 2) {
                                    lblCurrentGoal = "MA:";
                                    lblCurrentSale = "VA:";
                                    lblGlobalGoal = "MS:";
                                    lblGlobalSale = "VS:";
                                } else if (option == 3) {
                                    lblCurrentGoal = "MS:";
                                    lblCurrentSale = "VS:";
                                    lblGlobalGoal = "MM:";
                                    lblGlobalSale = "VM:";
                                } else if (option == 4) {
                                    lblCurrentGoal = "MM:";
                                    lblCurrentSale = "VM:";
                                    lblGlobalGoal = "MAH:";
                                    lblGlobalSale = "VAH:";
                                } else if (option == 5) {
                                    lblCurrentGoal = "MAH:";
                                    lblCurrentSale = "VAH:";
                                    lblGlobalGoal = "MAC:";
                                    lblGlobalSale = "VAC:";
                                }else if (option == 6) {
                                    lblCurrentGoal = "MAP:";
                                    lblCurrentSale = "VAP:";
                                }
                            } else {
                                if (option == 1) {
                                    lblCurrentGoal = "TG:";
                                    lblCurrentSale = "TS:";
                                    lblGlobalGoal = "WG:";
                                    lblGlobalSale = "WS:";
                                } else if (option == 2) {
                                    lblCurrentGoal = "YG:";
                                    lblCurrentSale = "YS:";
                                    lblGlobalGoal = "WG:";
                                    lblGlobalSale = "WS:";
                                } else if (option == 3) {
                                    lblCurrentGoal = "WG:";
                                    lblCurrentSale = "WS:";
                                    lblGlobalGoal = "MG:";
                                    lblGlobalSale = "MS:";
                                } else if (option == 4) {
                                    lblCurrentGoal = "MG:";
                                    lblCurrentSale = "MS:";
                                    lblGlobalGoal = "AG:";
                                    lblGlobalSale = "AS:";
                                } else if (option == 5) {
                                    lblCurrentGoal = "AG:";
                                    lblCurrentSale = "AS:";
                                    lblGlobalGoal = "CG:";
                                    lblGlobalSale = "CS:";
                                }else if (option == 6) {
                                    lblCurrentGoal = "LYG:";
                                    lblCurrentSale = "LYS:";
                                }
                            }

                            $(data.report).each(function (index, value) {
                                var mostrar = "";
                                var storeName = value.storeName;
                                var goalAmount = value.goalAmount;
                                var goalAmountGlobal = value.goalAmountGlobal;
                                var payTotal = value.payTotal;
                                var payTotalGlobal = value.payTotalGlobal;
                                var lastConexion = value.lastConexion;
                                var percent = 0.00;
                                var percentGlobal = 0.00;


                                goalAmount = parseFloat(goalAmount.replace(",", ".")).toFixed(0);
                                goalAmountGlobal = parseFloat(goalAmountGlobal.replace(",", ".")).toFixed(0);
                                payTotal = parseFloat(payTotal.replace(",", ".")).toFixed(0);
                                payTotalGlobal = parseFloat(payTotalGlobal.replace(",", ".")).toFixed(0);

                                var color = "";
                                var colorGlobal = "";



                                //calculo de percent
                                if (payTotal > 0 && goalAmount == 0.00) {
                                    percent = 0.00;
                                } else if (payTotal == 0 && goalAmount == 0.00) {
                                    percent = 0.00;
                                } else {
                                    percent = (payTotal * 100) / goalAmount;
                                }


                                //calculo de percentglobal
                                if (payTotalGlobal > 0.00 && goalAmountGlobal == 0.00) {
                                    percentGlobal = 0.00;
                                } else if (payTotalGlobal == 0.00 && goalAmountGlobal == 0.00) {
                                    percentGlobal = 0.00;
                                } else {
                                    percentGlobal = (payTotalGlobal * 100) / goalAmountGlobal;
                                }

                                if (payTotal == 0.00 || goalAmount == 0.00) {
                                    percent = 0.00;
                                }

                                if (payTotalGlobal == 0.00 || goalAmountGlobal == 0.00) {
                                    percentGlobal = 0.00;
                                }

                                if (percent < 75) {
                                    color = "red";
                                }

                                if (percent > 74 && percent < 100) {
                                    color = "ambar";
                                }

                                if (percent > 99) {
                                    color = "green";
                                }

                                if (goalAmount == 0.00 && payTotal > 0.00) {
                                    color = "green";
                                }

                                if (percentGlobal < 75) {
                                    colorGlobal = "red";
                                }
                                if (percentGlobal > 74 && percentGlobal < 100) {
                                    colorGlobal = "ambar";
                                }

                                if (percentGlobal > 99) {
                                    colorGlobal = "green";
                                }

                                if (goalAmountGlobal == 0.00 && payTotalGlobal > 0.00) {
                                    colorGlobal = "green";
                                }

                                percent = parseFloat(percent).toFixed(0);
                                percentGlobal = parseFloat(percentGlobal).toFixed(0);

                                
                                if(goalAmount-payTotal>0){
                                    if(GlobalFilterStores=="1"){
                                        mostrar += "<div class='goalStore'>";
                                    }else if(GlobalFilterStores=="2"){
                                        mostrar += "<div class='goalStore hide'>";
                                    }else if(GlobalFilterStores=="3"){
                                        mostrar += "<div class='goalStore'>";
                                    }
                                }else{
                                    if(GlobalFilterStores=="1"){
                                        mostrar += "<div class='saleStore'>";
                                    }else if(GlobalFilterStores=="2"){
                                        mostrar += "<div class='saleStore'>";
                                    }else if(GlobalFilterStores=="3"){
                                        mostrar += "<div class='saleStore hide'>";
                                    }   
                                }
                                mostrar += "<h1 class='storeNameR1'>" + storeName + "</h1>";
                                
                                mostrar += "<div class='lastConexion'><div class='lblLastConexion'></div><div class='dataLastConexion'>" + lastConexion + "</div></div>";
                                
                               

                                if (actual == 1) {
                                    mostrar += "<div class='actual'>";
                                    mostrar += "<i>" + lblCurrentGoal + "</i>";
                                    mostrar += "<p>" + parseFloat(goalAmount).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                    mostrar += "<i>" + lblCurrentSale + "</i>";
                                    mostrar += "<p>" + parseFloat(payTotal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                    mostrar += "<span class='" + color + "'>" + percent + " %</span>";

                                    mostrar += "</div>";
                                }

                                if (global == 1 && option!=6) {
                                    mostrar += "<div class='global'>";
                                    mostrar += "<i>" + lblGlobalGoal + "</i>";
                                    mostrar += "<p>" + parseFloat(goalAmountGlobal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                    mostrar += "<i>" + lblGlobalSale + "</i>";
                                    mostrar += "<p>" + parseFloat(payTotalGlobal).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "</p>";
                                    mostrar += "<span class='" + colorGlobal + "'>" + percentGlobal + " %</span>";

                                    mostrar += "</div>";
                                }

                                mostrar += "</div>";
                                mostrar += "</div>";
                                mostrar += "</div>"
                                $("#graph_region"+indice).append(mostrar);
                                
                            });
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr.status);
                        console.log(xhr.statusText);
                        console.log(xhr.responseText);
                        ///hideLoading();
                        if (current_lang == 'es'){
                            mostrarModalGeneral("Error de Conexión");
                        }else{
                            mostrarModalGeneral("No Connection");
                        }
                    }
                });
            });
        }); 
    }
}

//verifica los los switch si estan activos
function checkDefaultActualGlobal(){
    if(null==localStorage.getItem("check_actual_report1")){
        $('.check_actual').addClass("checked");
        localStorage.setItem("check_actual_report1",1);
    }else{
        if(localStorage.getItem("check_actual_report1")==1){
            $('.check_actual').addClass("checked");
        }else{
            $('.check_actual').removeClass("checked");
        }
    }

    if(null==localStorage.getItem("check_global_report1")){
        $('.check_global').addClass("checked");
        localStorage.setItem("check_global_report1",1);
    }else{
        if(localStorage.getItem("check_global_report1")==1){
            $('.check_global').addClass("checked");
        }else{
            $('.check_global').removeClass("checked");
        }
    }
}


function updateActual() {
    var principal = $(".select-general div:first-child()").attr("data-value");
    ch_principal = principal;
    if ($('.check_actual').hasClass('checked')) {
        $('.check_actual').removeClass('checked');
        localStorage.setItem("check_actual_report1",0);
    } else {
        $('.check_actual').addClass('checked');
        localStorage.setItem("check_actual_report1",1);
    }    
}

function updateGlobal() {
    var principal = $(".select-general div:first-child()").attr("data-value");
    ch_principal = principal;
    if ($('.check_global').hasClass('checked')) {
        $('.check_global').removeClass('checked');
        localStorage.setItem("check_global_report1",0);
    } else {
        $('.check_global').addClass('checked');
        localStorage.setItem("check_global_report1",1);;
    }
}

function rangeOfToday(){
    localStorage.RCSReports_valuesRangeDates=1;
    selectRangeGroup();
}
function rangeOfYesterday(){
    localStorage.RCSReports_valuesRangeDates=2;
    selectRangeGroup();  
}

function rangeOfWeek(){
    localStorage.RCSReports_valuesRangeDates=3;
    selectRangeGroup();
}

function rangeOfMonth(){
    localStorage.RCSReports_valuesRangeDates=4;
    selectRangeGroup();
}

function rangeOfYear(){
    localStorage.RCSReports_valuesRangeDates=5;
    selectRangeGroup();
}

function rangeOfLastYear(){
    localStorage.RCSReports_valuesRangeDates=6;
    selectRangeGroup();
}

function selectRangeGroup(){
    if(localStorage.RCSReports_valuesGroupStore==1){
        downloadByCompany();
    }
    if(localStorage.RCSReports_valuesGroupStore==2){
        downloadByRegion();
    }
    if(localStorage.RCSReports_valuesGroupStore==3){
        downloadByStore('');
    }
}

function filterStoreHideCombo() {
    $("#divFilter").hide();
}
function filterStoreShowCombo() {
    $("#divFilter").show();
}

//verifica los los switch si estan activos
function valuesGroupDate(){
    if(null==localStorage.getItem("RCSReports_valuesGroupStore")){
        localStorage.setItem("RCSReports_valuesGroupStore",3);
    }else{
        localStorage.setItem("RCSReports_valuesGroupStore",3);
    }

    if(null==localStorage.getItem("RCSReports_valuesRangeDates")){
        localStorage.setItem("RCSReports_valuesRangeDates",1);
    }else{
        localStorage.setItem("RCSReports_valuesRangeDates",1);
    }
}

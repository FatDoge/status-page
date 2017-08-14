var Title = '';
        var MasterTestID = 0;
        var SetPassword = '';

        !function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (!d.getElementById(id)) {
                js = d.createElement(s);
                js.id = id;
                js.src = "./js/widgets.js";
                fjs.parentNode.insertBefore(js, fjs);
            }
        }(document, "script", "twitter-wjs");




                var PublicID = 'your_own_id';/*你自己的publicID*/



        function UptimeToIcons(Uptime) {
            var Icon = 'Green';
            var Uptime = parseFloat(Uptime);
            if (Uptime == 100) {
                Icon = 'Green';
            } else if (Uptime < 100 && Uptime > 98) {
                Icon = 'Yellow';
            } else if (Uptime <= 98) {
                Icon = 'Red';
            }
            return '<div style="text-align:center;" title="' + Uptime + '" class="Uptime"><div class="Blob Blob_' + Icon + '"></div></div>';
        }

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function UptimeData() {
            var Count = 0;
            var Total = 0;
            $(".Uptime").each(function (index) {
                var Uptime = parseFloat($(this).attr('title'));
                if (isNumeric(Uptime)) {
                    Total = Total + Uptime;
                    Count++
                }
            });

            var Uptime = (Total / Count).toFixed(2);
            $('#7Day').html('<div class="UptimeNumber">' + Uptime + '%</div>');
        }

        $(".PassBox").keyup(function (e) {
            if (e.keyCode == 13) {
                SetPassword = $(".PassBox").val();
                Runner();
            }
        });


        function Period(TestID) {
            $.getJSON('https://app.statuscake.com/Workfloor/Get.Status.Perioids.php?callback=?&PublicID=' + PublicID + '&VID=' + TestID, function (data) {
                $.each(data, function (key, val) {

                    var Status = '';

                    if (val.Status == 'Up') {
                        Status = '<div class="alert success" style="padding:0px; margin:0px;">Up</div>';
                    } else {
                        Status = '<div class="alert error" style="padding:0px; margin:0px;">Down</div>';
                    }

                    $('#HistoryTable tbody').append("<tr><td>" + Status + "</td><td>" + val.Start + "</td><td>" + val.End + "</td><td>" + val.Period + "</td></tr>");

                    if (val.Anno != '' && val.Anno) {
                        $('#HistoryTable tbody').append("<tr class='anno anno_" + val.Status + "'><td colspan='4' style='color: #727272; padding-left: 25px;'><span style='font-size:22px'>&#x25B2;</span> " + val.Anno + "</td></tr>");
                    }

                });
            });
        }

        function ViewSingle(TestID) {
            $("#HistoryTable > tbody").html("");
            $('#map').empty();
            MasterTestID = TestID;

            $('#AllData').css("display", "none");
            $('.showonhome').css("display", "none");
            $('.showonsingle').css("display", "block");
            $('#SingleData').css("display", "block");
            LoadTime(TestID);
            GenerateMap(TestID);
            Period(TestID);
            $.getJSON('https://app.statuscake.com/Workfloor/PublicReportHandler.php?PublicID=' + PublicID + '&callback=?&TestID=' + TestID, function (data) {
                $('#CurrentStatus').text(data.Status);
                $('#TestName').text(data.SiteName);
                document.title = Title + " - " + data.SiteName;
                var CheckMinutes = parseInt(data.CheckRate) / 60;
                $('#CheckRate').text("每" + CheckMinutes + "分钟更新");
                $('#TestType').text(data.TestType);
            });
        }

        var LastSelected = 0;

        function ViewSingleExpand(TestID) {
            $('#DisplayBlock').remove();
            if (LastSelected != TestID) {
                LastSelected = TestID;

                $('#row_' + TestID).after('<tr id="DisplayBlock" data-DisplayID="' + TestID  + '" ><td style="padding:30px;" colspan="10"><div class="page-header text-center"> <h1 id="TestName">加载中...</h1> <p id="CheckRate" class="lead"></p> </div><div class="row"><div class="col-md-12"><div class="panel panel-success"> <div class="panel-heading">运行历史</div> <div class="panel-bodys"><div id="LoadTime" style="height:300px;"></div></div></div></div></div></div><div class="row"><div class="col-md-12"><div class="panel panel-info"> <div class="panel-heading">运行历史</div> <div class="panel-bodys"><table cellpadding="0" cellspacing="0" class="table table-full table-striped" width="100%" id="HistoryTable"><thead><tr><th width="5%">Status</th><th width="25%">起始</th><th width="25%">结束</th><th width="25%">时长</th></tr></thead><tbody></tbody></table></div></div></div></div></div></div></td></tr>');
                ViewSingle(TestID);
            } else {
                LastSelected = 0;
            }

        }

        if (window.location.hash) {
            var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
            ViewSingle(hash);
            // hash found
        } else {
            // No hash found
        }

        function ViewHome() {
            $('#AllData').css("display", "block");
            $('.showonhome').css("display", "block");
            $('.showonsingle').css("display", "none");
            $('#SingleData').css("display", "none");
        }


        function LoadTime() {

            $.getJSON('https://app.statuscake.com/Workfloor/Influx.php?Type=Chart&TestID=' + MasterTestID + '&All=true&TestType=HTTP&callback=?', function (data) {

                var dataseries = [];
                var dataitems = [];
                for (var key in data['All']) {
                    dataitems.push({"x": data['All'][key][0], "y": data['All'][key][1], "color": data['All'][key]['color']});
                }
                dataseries.push({
                    name: 'All Data',
                    type: 'area',
                    data: dataitems,
                    threshold: null,
                    visible: true,
                    step: false,
                    dataGrouping: {enabled: false},
                    shadow: false,
                    tooltip: {valueDecimals: 2}
                });

                // Create the chart
                window.chart = new Highcharts.StockChart({
                    chart: {
                        backgroundColor: null,
                        plotBackgroundColor: "rgba(255, 255, 255, 1)",
                        plotBorderWidth: 1,
                        plotBorderColor: "#d2d2d2",
                        renderTo: 'LoadTime'
                    },

                    yAxis: {
                        labels: {
                            formatter: function () {
                                return this.value + "s";
                            },
                            style: {
                                color: "#000",
                                textShadow: "0 1px 2px #EEEEEE",
                            }
                        },
                        min: -0
                    },

                    navigator: {
                        enabled: true,
                        adaptToUpdatedData: false,
                    },

                    scrollbar: {
                        liveRedraw: false
                    },

                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0,
                        enabled: false
                    },

                    rangeSelector: {
                        selected: 2,
                        enabled: true,
                        buttons: [{
                            type: 'hour',
                            count: 1,
                            text: '1h'
                        }, {
                            type: 'hour',
                            count: 12,
                            text: '12h'
                        }, {
                            type: 'day',
                            count: 1,
                            text: '1d'
                        }, {
                            type: 'week',
                            count: 1,
                            text: '1w'
                        }, {
                            type: 'year',
                            count: 1,
                            text: '1y'
                        }]
                    },

                    plotOptions: {
                        series: {
                            turboThreshold: 10000
                        }
                    },

                    xAxis: {

                        minRange: 3600 // one hour
                    },


                    credits: {
                        enabled: false
                    },

                    title: {
                        text: ''

                    },


                    series: dataseries

                });
            });

        }
        ;



        var Times = 0;

        function Runner() {

            $.getJSON('https://app.statuscake.com/Workfloor/PublicReportHandler.php?PublicID=' + PublicID + '&SetPassword=' + encodeURIComponent(SetPassword) + '&callback=?', function (data) {

                if (data.Protected == true) {
                    if (Times > 0) {
                        $('.PassBox').css('border', '1px dashed #F37D7D')
                    }
                    $('.MainTitle').text('Password Required');
                    $('.PasswordReq').css('display', 'block');
                    $('.DetailArea').css('display', 'none');
                    Times++;
                } else {
                    $('.PasswordReq').css('display', 'none');
                    $('.DetailArea').css('display', 'block');

                    // Set the custom background image
                    if (data.BG) {
                        $('body').css('background-color', data.BG);
                    }
                    if (data.HeadBG) {
                        $('#content-header').css('background-color', data.HeadBG);
                    }
                    if (data.BlockHead) {
                        $('.Title h1').css('background-color', data.BlockHead);
                    }
                    if (data.Announce) {
                        $('#Announce').html(data.Announce);
                    }
                    // Set Google Analytics Code
                    if (data.GA) {

                    }


                    if (data.Skin) {
                        $("#Skin").attr("href", "css/" + data.Skin + ".css");
                    }

                    $('.MainTitle').html(data.Title);
                    Title = data.Title
                    document.title = Title;

                    if (data.LogoImage) {
                        $('.MainTitle').html("<img src='" + data.LogoImage + "' />");
                        $('#header').css("padding", "12px");
                    }

                    if (data.ShowAd === true) {
                        $('.BlockView').css("display", "block");
                    }

                    // Setup the date headers
                    $.each(data.Dates, function (key, val) {
                        $('#MainData thead tr').append('<th class="AlignCentre">' + val + '</th>');
                    });

                    if (data.Twitter) {
                        $('.Twitter').css("display", "block");
                        $('#Tweets').css("display", "block");
                        $('#Tweets').html('<a class="twitter-timeline"   data-chrome="nofooter noborders noheader"  width="99.8%" href="https://twitter.com/twitterapi" data-screen-name="' + data.Twitter + '" height="400px" data-widget-id="309384188749025280"></a>');
                        twttr.widgets.load();
                        $('.twitter-timeline').css("width", "100%");
                    }
                    $.each(data.TestData, function (key, val) {

                        // alert(val.Uptime);
                        // Each Test Date
                        var Status = '';

                        if (val.Status == 'Up') {
                            Status = '<i class="fa fa-arrow-circle-up statusicon up"></i>';
                        } else {
                            Status = '<i class="fa fa-arrow-circle-down statusicon down"></i>';
                        }

                        var CheckMinutes = parseInt(val.CheckRate) / 60;
                        var Row = '<tr id="row_' + val.TestID + '" class="Clickable" onclick="ViewSingleExpand(' + val.TestID + ')"><td>' + Status + '</td><td>' + val.Name + '</td><td>' + CheckMinutes + '<span class="subtext">m</span></td>';

                        $.each(val.Uptime, function (key, val) {
                            if (val != 'N/A') {

                                if (data.Orbs == 1) {
                                    var UptimeHTML = UptimeToIcons(val);
                                } else {
                                    var UptimeHTML = '<span class="Uptime" title="' + val + '">' + val + '%</span>';
                                }

                                Row += '<td class="AlignCentre">' + UptimeHTML + '</td>';
                            } else {
                                Row += '<td class="AlignCentre"><span class=" Uptime" title="' + val + '"><span class="subtext"></span></td>';
                            }
                        });

                        $('#MainData tbody').append(Row + '</tr>');

                        UptimeData();

                        if (data.Orbs == 1) {
                            UptimeToIcons();
                        }
                    });
                }

            });
        }

        Runner();

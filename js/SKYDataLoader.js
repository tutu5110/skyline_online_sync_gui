class SKYDataLoader {

  constructor(codes, params, GRAPH_ID) {
    this._code= codes;
    this._duration = params['duration'];
    this.graphDiv = params['div'];
    this.updateRealtime = params['updateRealtime'];
    this.automateHedge = params['automateHedge'];
    this.usStockReady = false;
    this.cnStockReady = false;
    this.usStockContent = [];
    this.cnStockContent = [];
    this.realtimeDataCache = {};
    this.realtimeDataCache['data'] = Array();
    this.realtimeDataCache['currentPrice'] = Array();
    this.realtimeDataCache['counter'] = 0;
    this.realtimeDataCache['total'] = params['NumOfEntry'] ? params['NumOfEntry'] : 2;
    this.totalItems = 0;
    this.graphID = GRAPH_ID;
    this.purchasePrice = {};
    this.purchaseDate = {};
 }

   load(){

        var current;
        var target;
        if(this.automateHedge){
            current = this._code[0];
            target = this_code[1];
        }
        
        if(current.isFuture())
            loadFuture(current)
   }

   createGraph() {
        //dataPeriod = dataPeriod || 'hy'; //initialize
        //check code type
        // type array
        // create empty div if not exist
        var currentGraphDiv = "graph_"+this.graphID;
        if($('#'+currentGraphDiv).length ==0){
            // create graph
             $('#'+this.graphDiv).append("<div class='stockHolder'>"+
                "<div class='stockHolderfonts' id='graphHolder_"+this.graphID+"'>#stocknames##sym#</div>"+
                "<div class='chartlegend' id='g_legend_"+this.graphID+"'>haha</div>"+
                "<div class='chartmsg' id='msg_"+this.graphID+"'>Test Message</div><br><div class='stockGraphs' id='"+currentGraphDiv+"'></div>"+
                "<div class='chartDetails'><div class='chartDonnut'><div class='chartDonnutTitle'>Sucess</div><div class='chartDonnutLabel' id='g_label_"+this.graphID+"'>#su#</div><canvas id='chartDonutSuccess_"+this.graphID+"'></canvas></div>"+
                "<div class= 'chartInfo' id='g_detail_"+this.graphID+"'><div class='chartDonnutTitle'>Statistics</div><div class='chartPriceClass' id='chartPrice_"+this.graphID+"'><span class='legend_label_color_0'>-99</span>&nbsp;&nbsp;&nbsp;<span class='legend_label_color_1'>-90</span></div>#stat#</div></div></div>");
              var data = "T,C,T\nJan/01/2016,0.1,0.1";
            // begin DummyGraph
            inigraph(data,currentGraphDiv,this.graphID);
        }

        var code = this._code;
        var duration = this._duration;
        var isCodeString = code instanceof String;
        if (!isCodeString) {
            //console.log("is array!!!");
            var len = code.length;
            // group stocks
            var usStocks = new Array();
            var cnStocks = new Array();
            var cnFuture = new Array();
            this.totalItems = len;
            
            for(var i = 0 ; i < len; i ++){
                if(code[i].indexOf("us") != -1)
                    usStocks.push(code[i]);
                else if(code[i].indexOf("sz") != -1 || code[i].indexOf("sh") !=-1 || code[i].indexOf("jj") != -1)
                    cnStocks.push(code[i]);
                else
                    cnFuture.push(code[i]);
            }

            //var t = Math.floor(new Date().getTime()) ; 
            var t =  this.graphID;
            //console.log("timestamp for "+ code + " is "+t);
             // loading stocks
            if(cnStocks.length>0)
                for(var i = 0 ; i < cnStocks.length; i ++)
                    this.loadStockHistory(cnStocks[i],this.totalItems,t,this.graphID);
            if(usStocks.length>0)
                for(var i = 0; i < usStocks.length; i ++)
                    this.loadStockHistory(usStocks[i],this.totalItems,t,this.graphID);
            if(cnFuture.length>0)
                    for(var i = 0; i < cnFuture.length; i ++)
                    this.loadFuture(cnFuture[i],this.totalItems,t,this.graphID);

        } 
    }
    /*
    
    Function used to fetch historical stock data for 

        -   US Comodity Futures
        -   Chinese Comodity Futures
    
    */

    loadFuture(code,totalItems, id, updateToGraph){
        // sanity check
        if(code.contains('F_'))
            var serverCode = code.substring(2,code.length);
        var graphID = id;
        $.get("FutureServer.php?sym=" + serverCode, function(data) {
            var result = JSON.parse(data);
            var dataHolder = new Array();
            var datalen = result.length;
            name = serverCode;
            //start from 1, index 0 is for system 
            for (var i = 1; i < datalen; i++) {
                //str += formatDate(pdata[0].data[i][0]) + "," + pdata[0].data[i][1] +  "," + pdata[2].data[i][1] + "," + (pdata[0].data[i][1] + pdata[2].data[i][1]) + "\n";
                    dataHolder[i-1] = [];
                    dataHolder[i-1][0] = toUnivfiedMMDDYYYY(result[i][0]);//fastfind
                    dataHolder[i-1][1] = parseFloat(result[i][4]);
                    dataHolder[i-1][2] = parseFloat(result[i][4]);
            }
            var param = {};
            param['type'] = getStockType(serverCode);
            param['name'] = name;
            param['code'] = serverCode;
            param['totalItems'] = totalItems;

            saveResults(graphID,dataHolder,param);
        });
    }

    /*
    
    Function used to fetch historical stock data for 

        -   US Stocks
        -   Chinese Stocks
        -   US ETFS
        -   Chinese ETFs
    */
    loadStockHistory(code,totalItems, id, graphID){
                 
                 // load chinese stock
                 if(code.indexOf("us") == -1){
                     // CN STOCKS, Fund
                     if (code.indexOf("jj") != -1) {
                        // type is Chinese Fund
                        // remove header
                        if(USE_SKYLINE_CACHE_SERVICE){
                        var server = SKYLINE_CACHE_SERVER.replace("#SYMBOL#", code);
                        } else {
                        code =code.substring(2,code.length);
                        var server = "engine.php?cadd=" + encodeURIComponent(FUND_SERVER_TENCENT.replace("#fundcode#", code));
                        }
                        //console.log("parsing URL: " + server);
                        var dataHolder = new Array();
                        $.get(server, function(data) {
                             //console.log(data);
                             // clean up
                             var _cnStockContent =  data.substring(data.lastIndexOf("[[")+1,data.lastIndexOf("]]")); 
                             var name = data.substring(data.lastIndexOf("name")+8,data.lastIndexOf("}")-1); 
                             name = convert2UTF8(name);
                             _cnStockContent = _cnStockContent.replaceAll("\"", '');
                             _cnStockContent = _cnStockContent.split("], [");
                            // packaging
                            var dataHolder = new Array();
                            var datalen = _cnStockContent.length;
                            //fix for fund tomorrow
                            for (var i = 0; i < datalen; i++) {
                                //str += formatDate(pdata[0].data[i][0]) + "," + pdata[0].data[i][1] +  "," + pdata[2].data[i][1] + "," + (pdata[0].data[i][1] + pdata[2].data[i][1]) + "\n";
                                     _cnStockContent[i] = _cnStockContent[i].replaceAll(",\\[", '').replaceAll("\\[",'');
                                    var tmp = _cnStockContent[i].split(",");
                                    dataHolder[i] = [];
                                    dataHolder[i][0] = toUnivfiedMMDDYYYY(tmp[0].trim().insert('/',4).insert('/',7));//fastfind
                                    dataHolder[i][1] = parseFloat(tmp[2]);
                                    dataHolder[i][2] = parseFloat(tmp[2]);
                            }
                            //save and send result to main

                            //Realtime

                            var param = {};
                            param['type'] = getStockType(code);
                            param['name'] = name;
                            param['code'] = code;
                            param['totalItems'] = totalItems;
                            
                            saveResults(graphID,dataHolder,param);
                        
                            // REALTIME:
                            
                            /*
                            $.get("engine.php?cadd=" + encodeURIComponent('http://qt.gtimg.cn/q=s_sz'+code+',s_sz399300'), function(data) {
                                // console.log("parsing real-time URL: " +FUND_SERVER + code + "&indexcode=000300&type=" + dataPeriod);
                                var response = data.split(";");
                                var tmpRealtime = response[0].substring(response[0].indexOf("\"") , response[0].length - 2).replaceAll("\"", '');
                                tmpRealtime = tmpRealtime.split("~");
                                    console.log(tmpRealtime);
                                var _date = calcTime('beijing','+8');
                                var currentPercent = parseFloat(tmpRealtime[5]);
                                var HistoryCurrentPercent = currentPercent + parseFloat(pdata[0].data[datalen-1][1]);
                                tmpRealtime = response[1].substring(response[1].indexOf("\"") , response[1].length - 2).replaceAll("\"", '');
                                tmpRealtime = tmpRealtime.split("~");
                                     console.log(tmpRealtime);
                                // str += _date + "," + HistoryCurrentPercent + ","+  HistoryHS300Percent + "," +currentOverall;
                                
                            });
                            */
                        });

                    
                    } else if (code.contains('if')){
                        console.log("if stocks");
                    } else {
                    // Chinese stock
                         if(USE_SKYLINE_CACHE_SERVICE)
                            var server = SKYLINE_CACHE_SERVER.replace(new RegExp("#SYMBOL#", 'g'),code).replace("#begin#",toChineseYYYYMMDD(getDataLength('2y'))).replace("#end#",toChineseYYYYMMDD(getDayInChina()));
                         else
                            var server = "engine.php?cadd="+encodeURIComponent(CNSTOCK_HISTORY_SERVER.replace(new RegExp("#SYMBOL#", 'g'),code).replace("#begin#",toChineseYYYYMMDD(getDataLength('2y'))).replace("#end#",toChineseYYYYMMDD(getDayInChina())));
                         //console.log("loading stock "+server);
                         $.get(server, function(data) {
                                // filtering unncessary things
                                var _cnStockContent =  data.substring(data.lastIndexOf("[[")+1,data.lastIndexOf("]]")); 
                                _cnStockContent = _cnStockContent.replaceAll("\"", '');
                                _cnStockContent = _cnStockContent.split("]");
                                var name = data.substring(data.lastIndexOf("qt"),data.lastIndexOf("}")).split(",")[1]; 
                                name =convert2UTF8(name)
                                // packaging
                                this.cnStockContent = new Array(_cnStockContent.length);
                                var initialPrice = parseFloat(_cnStockContent[0].split(",")[2]);
                                for(var i = 0 ; i < _cnStockContent.length; i ++){
                                    _cnStockContent[i] = _cnStockContent[i].replaceAll(",\\[", '').replaceAll("\\[",'');
                                    var tmp = _cnStockContent[i].split(",");
                                    this.cnStockContent[i] = [];
                                    this.cnStockContent[i][0] = tmp[0].convert2USDateFromCN();
                                    this.cnStockContent[i][1] = ((parseFloat(tmp[2]) - initialPrice) / initialPrice * 100).toFixed(1)+"%" 
                                    this.cnStockContent[i][2] = parseFloat(tmp[2]);
                                }
                                //save and send result to main
                                var param = {};
                                param['type'] = getStockType(code);
                                param['name'] = name;
                                param['code'] = code;
                                param['totalItems'] = totalItems;
                            
                                saveResults(graphID,this.cnStockContent,param);
                                
                       
                         });
                    }//End of Chinese stocks
                // Begining of processing us stocks  
                } else {
                    // us stocks
                    if(USE_SKYLINE_CACHE_SERVICE){
                        var server =  SKYLINE_CACHE_SERVER.replace('#SYMBOL#',code).replace("#begin#",getDataLength('2y').toTimeStamp()).replace("#end#",getDayInChina().toTimeStamp());
                    } else{
                        code = code.split("_")[1];
                        var server =  "engine.php?cadd=" + encodeURIComponent(USSTOCK_HISTORY_SERVER.replace('#SYMBOL#',code).replace("#begin#",getDataLength('2y').toTimeStamp()).replace("#end#",getDayInChina().toTimeStamp()));
                    }
                     $.get(server, function(data) {
                            //parsing yahoo
                             //console.log("loging raw data ------------ " + code+" :" + data);
                            var _content = JSON.parse(data);
                            var len = _content.chart.result[0]['timestamp'].length;
                            var initialPrice = parseFloat(_content.chart.result[0]['indicators']['quote'][0]['close'][0]);
                            var name = code;
                            var temp = new Array();
                            for(var i = 0 ; i < len; i ++){
                                temp[i] = [];
                                temp[i][0] = getTime(_content.chart.result[0]['timestamp'][i]);
                                var c = parseFloat(_content.chart.result[0]['indicators']['quote'][0]['close'][i]);
                                temp[i][1] = ((c - initialPrice)/initialPrice*100).toFixed(2) + "%";
                                temp[i][2] = c;
                             }
                              //console.log("loading "+code+" complete!");
                             // console.log(temp);
                              var param = {};
                                param['type'] = getStockType(code);
                                param['name'] = name;
                                param['code'] = code;
                                param['totalItems'] = totalItems;
                            
                                saveResults(graphID,temp,param);

                     });
          }
    }

   
    getStringBetween(str, begin,end){
        var re = str.substring(str.lastIndexOf(begin)+1,str.lastIndexOf(end));
        return re;
    }

    isReady(){
        if(this.cnStockReady && this.usStockReady)
            return true;
        return false;
    }

}

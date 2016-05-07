class SKYDataLoader {

  constructor(codes, d) {
    this._code= codes;
    this._duration = d;
    this.usStockReady = false;
    this.cnStockReady = false;
    this.usStockContent = [];
    this.cnStockContent = [];
    this.totalItems = 1;

  }


   createGraph() {
        //dataPeriod = dataPeriod || 'hy'; //initialize
        //check code type
        // type array
        var code = this._code;
        var duration = this._duration;
        var isCodeString = code instanceof String;
        if (!isCodeString) {
            //console.log("is array!!!");
            var len = code.length;
            // group stocks
            var usStocks = "";
            var cnStocks = "";
            this.totalItems = len;
            
            for(var i = 0 ; i < len; i ++){
                if(code[i].indexOf("us") != -1)
                    usStocks += code[i]+",";
                else
                    cnStocks += code[i]+",";
            }

            if(usStocks.length>0)
                usStocks = usStocks.substring(0,usStocks.length-1);
            if(cnStocks.length>0)
                cnStocks = cnStocks.substring(0,cnStocks.length-1);
            
            var t = Math.floor(new Date().getTime()) ; 
            //console.log("timestamp for "+ code + " is "+t);
             // loading stocks
            if(cnStocks.length>0)
                this.loadStockHistory(cnStocks,2,t);
            if(usStocks.length>0)
                this.loadStockHistory(usStocks,2,t);

          
            //console.log(usStocks);
            //console.log(cnStocks);

        } else {

            // only one stock
            if (code.indexOf("51") != -1 || code.indexOf("52") != -1 || code.indexOf("15") != -1 || code.indexOf("16") != -1) {
                // type is Chinese Fund
                dataPeriod = FUND_TIME_MAPPING[dataPeriod] || 'hy'; //initialize
                console.log("parsing URL: " +FUND_SERVER + code + "&indexcode=000300&type=" + dataPeriod);
                $.get("engine.php?cadd=" + encodeURIComponent(FUND_SERVER + code + "&indexcode=000300&type=" + dataPeriod), function(data) {
                    //console.log(data);
                    var calculation = 0;
                    var pdata = JSON.parse(data);
                    var datalen = pdata[0].data.length;
                    console.log(" Found Funding : " + code + "dataLength :" + datalen);
                    var str = "";
                    if (calculation == 1)
                        str = "Date," + pdata[0].name + ",$SIMILAR$" + pdata[2].name + ',对冲\n';
                    else
                        str = "Date," + pdata[0].name + ",$SIMILAR$" + pdata[2].name + ',差价\n';

                    if(SHOW_SIMILAR_TYPE_AVERAGE)
                        // add end line
                        str = str.replace("$SIMILAR$",pdata[1].name+",");
                    else
                        str = str.replace("$SIMILAR$","");
    
                    for (var i = 0; i < datalen; i++) {
                        if(SHOW_SIMILAR_TYPE_AVERAGE)
                            if (calculation == 1)
                                str += formatDate(pdata[0].data[i][0]) + "," + pdata[0].data[i][1] + "," + pdata[1].data[i][1] + "," + pdata[2].data[i][1] + "," + (pdata[0].data[i][1] + pdata[2].data[i][1]) + "\n";
                            else
                                str += formatDate(pdata[0].data[i][0]) + "," + pdata[0].data[i][1] + "," + pdata[1].data[i][1] + "," + pdata[2].data[i][1] + "," + (pdata[0].data[i][1] - pdata[2].data[i][1]) + "\n";
                         else
                            if (calculation == 1)
                                str += formatDate(pdata[0].data[i][0]) + "," + pdata[0].data[i][1] +  "," + pdata[2].data[i][1] + "," + (pdata[0].data[i][1] + pdata[2].data[i][1]) + "\n";
                            else
                                str += formatDate(pdata[0].data[i][0]) + "," + pdata[0].data[i][1] +  "," + pdata[2].data[i][1] + "," + (pdata[0].data[i][1] - pdata[2].data[i][1]) + "\n";

                    }

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
                        var HS300Percent = parseFloat(tmpRealtime[5]);
                        var HistoryHS300Percent = HS300Percent + parseFloat(pdata[2].data[datalen-1][1]);

                        var currentOverall = 0;
                            if (calculation == 1)
                                currentOverall = HistoryCurrentPercent + HistoryHS300Percent;
                            else
                                currentOverall = HistoryCurrentPercent - HistoryHS300Percent;
                         if(SHOW_SIMILAR_TYPE_AVERAGE)
                             str += _date + "," + HistoryCurrentPercent + "," + pdata[1].data[datalen - 1][1] + "," 
                             +  HistoryHS300Percent + "," +currentOverall;
                         else
                             str += _date + "," + HistoryCurrentPercent + ","+  HistoryHS300Percent + "," +currentOverall;
                        
                    });
                });
            } else if(code.indexOf("us")){
                // us stock

            }
        }
    }

    loadStockHistory(code,totalItems, id){
                 
                 // load chinese stock
                 if(code.indexOf("us") == -1){
                     // CN STOCKS, Fund
                     if (code.indexOf("51") != -1 || code.indexOf("52") != -1 || code.indexOf("15") != -1 || code.indexOf("16") != -1) {
                             // type is Chinese Fund
                        var dataPeriod =  'y'; //initialize
                        console.log("parsing URL: " +FUND_SERVER + code + "&indexcode=000300&type=" + dataPeriod);
                        var dataHolder = new Array();
                        $.get("engine.php?cadd=" + encodeURIComponent(FUND_SERVER + code + "&indexcode=000300&type=" + dataPeriod), function(data) {
                            //console.log(data);
                            var calculation = 0;
                            var pdata = JSON.parse(data);
                            var datalen = pdata[0].data.length;
                            //fix for fund tomorrow
                            for (var i = 0; i < datalen; i++) {
                                //str += formatDate(pdata[0].data[i][0]) + "," + pdata[0].data[i][1] +  "," + pdata[2].data[i][1] + "," + (pdata[0].data[i][1] + pdata[2].data[i][1]) + "\n";
                                dataHolder[i]= [];
                                dataHolder[i][0] = toUnivfiedMMDDYYYY(pdata[0].data[i][0]);
                                dataHolder[i][1] = parseFloat(pdata[0].data[i][1]);
                                dataHolder[i][2] = parseFloat(pdata[0].data[i][1]);
                                dataHolder[i][3] = parseFloat(pdata[2].data[i][1]);
                                

                            }

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
                                var HS300Percent = parseFloat(tmpRealtime[5]);
                                var HistoryHS300Percent = HS300Percent + parseFloat(pdata[2].data[datalen-1][1]);

                                var currentOverall = 0;
                                // get overall hs300 percent
                                currentOverall = HistoryCurrentPercent + HistoryHS300Percent;
                                // insert the realtime data
                                dataHolder.push([_date,HistoryCurrentPercent,HistoryHS300Percent]);
                                // str += _date + "," + HistoryCurrentPercent + ","+  HistoryHS300Percent + "," +currentOverall;
                                saveResults(id,totalItems,dataHolder,"cn_fund_"+code);
                            });
                        });
                    // if not Fund, but Chinese stock
                    } else {
                         var server = CNSTOCK_HISTORY_SERVER.replace(new RegExp("#SYMBOL#", 'g'),code).replace("#begin#",toChineseYYYYMMDD(getDayOneYearAgo())).replace("#end#",toChineseYYYYMMDD(getDayInChina()));
                         $.get("engine.php?cadd=" + encodeURIComponent(server), function(data) {
                                // filtering unncessary things
                                var _cnStockContent =  data.substring(data.lastIndexOf("[[")+1,data.lastIndexOf("]]")); 
                                _cnStockContent = _cnStockContent.replaceAll("\"", '');
                                _cnStockContent = _cnStockContent.split("]");
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

                                //console.log("loading "+code+" complete!");
                                //console.log(this.cnStockContent);
                                saveResults(id,totalItems,this.cnStockContent, "cn_"+code);
                       
                         });
                    }//End of Chinese stocks
                } else {
                    // us stocks
                    code = code.split("_")[1];
                    var server =  USSTOCK_HISTORY_SERVER.replace('#SYMBOL#',code).replace("#begin#",getDayOneYearAgo().toTimeStamp()).replace("#end#",getDayInChina().toTimeStamp());
                     $.get("engine.php?cadd=" + encodeURIComponent(server), function(data) {
                            //parsing yahoo
                             //console.log("loging raw data ------------ " + code+" :" + data);
                            var _content = JSON.parse(data);
                            var len = _content.chart.result[0]['timestamp'].length;
                            var initialPrice = parseFloat(_content.chart.result[0]['indicators']['quote'][0]['close'][0]);
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
                             saveResults(id,totalItems,temp, "us_"+code);

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

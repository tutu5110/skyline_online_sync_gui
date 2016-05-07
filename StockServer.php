<?php
/*

CN Stock Server

this server will fetch and cache similar results


*/



$GLOBALS['DATA_FOLDER'] = 'data/';

$GLOBALS['UPDATE_PERIOD_DATE'] = 3;

$GLOBALS['UPDATE_PERIOD'] = 86400 * $GLOBALS['UPDATE_PERIOD_DATE'];

$GLOBALS['INDEXFUTURE_SERVER'] = 'http://stock2.finance.sina.com.cn/futures/api/json.php/CffexFuturesService.getCffexFuturesDailyKLine?symbol=';

$GLOBALS['CN_FUND_SERVER'] = 'http://stockjs.finance.qq.com/fundUnitNavAll/data/year_all/#fundcode#.js';

$GLOBALS['USSTOCK_HISTORY_SERVER'] = 'https://finance-yql.media.yahoo.com/v7/finance/chart/#SYMBOL#?period2=#end#&period1=#begin#&interval=1d&indicators=quote&includeTimestamps=true';

$GLOBALS['CNSTOCK_HISTORY_SERVER'] = 'http://web.ifzq.gtimg.cn/appstock/app/fqkline/get?_var=kline_dayqfq2013&param=#SYMBOL#,day,#begin#,#end#,640,qfq';

$sym = isset($_GET['sym']) ? $_GET['sym'] : '';

$period = isset($_GET['p']) ? $_GET['p'] : 'y';

$begin = isset($_GET['begin']) ? $_GET['begin']: '';

$end = isset($_GET['end']) ? $_GET['end']: '';

$param = isset($_GET['param']) ? $_GET['param'] : NULL;

// system check
// check if the symbol is empty
if($sym == ''){
	echo 'NULL RESULT, NO SYMBOL';
	exit();
}


if($param){
	$r = explode(',', $param);
	$begin = $r[1];
	$end = $r[2];
}


//load raw
$rawData = loadRawData($sym);

//parse
$_file = explode('#cachVar#',$rawData);

$file = array();
if(isset($_file[1]) && is_array($_file)){
	$file['rawData'] = $_file[0];
	$file['lastestDay'] = $_file[1];
}

$fileLen = count($file);


// if no local or local.last day is not china day today
if($fileLen==0) {
	$rawData = fetchStock($sym,$begin,$end);
	SaveFutureData2CSV($sym,$rawData);
	echo $rawData;
	exit();
} else {
// there is local file, check for update
	if(!isUptoDate(time(), $file['lastestDay'])){
		$file['rawData'] = fetchStock($sym,$begin,$end);
		if(SaveFutureData2CSV($sym,$file['rawData']))
			echo $file['rawData'];
	} else{
	
		echo $file['rawData'];
	}
}


function fetchStock($sym, $begin = '', $end = ''){

    $url = getServerAdd($sym,$begin,$end);
 
	$data = @file_get_contents($url);

	return $data;
}

function getServerAdd($sym, $begin = '',  $end = ''){
	if(strpos($sym,'IF') !== false || strpos($sym,'IH') !== false || strpos($sym,'IC') !== false)
		// chinese futures
		return ($GLOBALS['INDEXFUTURE_SERVER'].getIndexFutureSymbol($sym));
	else if(strpos($sym,'jj') !== false){
		// chinese fund
		$sym = str_replace('jj', '', $sym);
		$server = $GLOBALS['CN_FUND_SERVER'];
		$server = str_replace('#fundcode#',$sym,$server);
		return $server;
	} else if(strpos($sym,'us') !== false){
		//us stock
		$sym = str_replace('us_', '', $sym);
		$server = $GLOBALS['USSTOCK_HISTORY_SERVER'];
		$server = str_replace('#SYMBOL#', $sym, $server);
		$server = str_replace('#end#', $end, $server);
		$server = str_replace('#begin#', $begin, $server);
		return $server;
	} else{
		//chinese stock
		$server = $GLOBALS['CNSTOCK_HISTORY_SERVER'];
		$server = str_replace('#SYMBOL#', $sym, $server);
		$server = str_replace('#end#', $end, $server);
		$server = str_replace('#begin#', $begin, $server);
		return $server;
	}

	return '-1';
}


function loadRawData($s){
	$filename = $s;

	switch ($s) {
		case 'IF':
			$filename =  $GLOBALS['DATA_FOLDER'].'ZJIFMI.csv';
			break;
		case 'IH':
			$filename = $GLOBALS['DATA_FOLDER'].'ZJIHMI.csv';
			break;
		default:
		   $filename = $GLOBALS['DATA_FOLDER'].'F_'.$s.'.rtu';
			# code...
			break;
	}

	$file = @file_get_contents($filename);

	return $file;
}



function SaveFutureData2CSV($symbol, $rawData){
	$filename = '';
	switch ($symbol) {
		case 'IF':
			# code...
			$filename = $GLOBALS['DATA_FOLDER'].'ZJIFMI.csv';
			break;
		case 'IH':
		$filename = $GLOBALS['DATA_FOLDER'].'ZJIHMI.csv';
			break;
		default:
			$filename = $GLOBALS['DATA_FOLDER'].'F_'.$symbol.'.rtu';
			# code...
			break;
	}

	//add timestamp
	$rawData.='#cachVar#'.date('m/d/Y');
	return file_put_contents($filename, $rawData);
}

function flatten($dataArr){
	if(!is_array($dataArr))
		return $dataArr;
	$len = count($jsonArr);
	$str = '';
	for($i = 0 ; $i< $len; $i ++)
		$str .= implode($jsonArr[$i], ',')."\n";
	return $str;
}

function isUptoDate($today, $pastDay){
	if($today - strtotime($pastDay) > $GLOBALS['UPDATE_PERIOD'])
		return false;
	return true; 
}

?>
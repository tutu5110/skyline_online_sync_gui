<?php

//  Accepted Query Strings

/*	sym ->{
			IF, IH, IC	
}
*/

date_default_timezone_set('Asia/Shanghai');

$GLOBALS['INDEXFUTURE_SERVER'] = 'http://stock2.finance.sina.com.cn/futures/api/json.php/CffexFuturesService.getCffexFuturesDailyKLine?symbol=';

$GLOBALS['FUTURE_SERVER'] = 'http://stock.finance.sina.com.cn/futures/api/json.php/InnerFuturesService.getInnerFuturesDailyKLine?symbol=';

$GLOBALS['FUTURE_SERVER_REALTIME'] = 'http://hq.sinajs.cn/?list=';

$GLOBALS['IF_REALTIME_PREFIX'] = 'CFF_RE_';

$GLOBALS['DATA_FOLDER'] = 'data/';

$GLOBALS['UPDATE_PERIOD_DATE'] = 3;

$GLOBALS['UPDATE_PERIOD'] = 86400 * $GLOBALS['UPDATE_PERIOD_DATE'];

$GLOBALS['FUTURE_SYMBOL'] =  array(
    'AU0', //  金
    'AG0',	// 银
    'A0', // 豆一
    'C0', // 玉米
    'CS0', // 淀粉，
    'I0', //铁矿
    'J0', //焦炭
    'JD0', // 鸡蛋
    'JM0', // 焦煤
    'M0',  //豆粕
    'P0',   // 棕榈
    'PP0',  // PVC
    'Y0'	// 豆油
);

define("FUTURE_ARRAY_MASTER_LENGTH", 7);

define("isDebug", false);

//get query string

$symbol = isset($_GET['sym']) ? $_GET['sym'] : 'IF';

$period = isset($_GET['p']) ? $_GET['p'] : '';

$type = isset($_GET['type']) ? $_GET['type'] : '';

if($type != 'realtime'){
		// History content
		// load local
		$file = loadContents($symbol);

		// get length
		$fileLen = count($file);
		$originalFileLen = count($file);
		// if no local or local.last day is not china day today
		if($fileLen==0) {
			$file = fetchFuture($symbol);
			$fileLen = count($file);
		}
		//initialize target time
		$targetTime = isset($file[$fileLen-1][0]) ? $file[$fileLen-1][0] : time();

		if(isUptoDate(time(), $targetTime)){
			if(isDebug)
				echo 'data up to date (Record Date:'.$file[$fileLen-1][0].')';

			if($originalFileLen < 2)
				SaveFutureData2CSV($symbol,$file);
		} else{
			 $file = fetchFuture($symbol,$file);
			//save locally
			if(isDebug)
				echo 'not up to date, fetching....';
			
			SaveFutureData2CSV($symbol,$file);

		}

		//insert into first, settings
		array_unshift($file,array(
			getIndexFutureSymbol($symbol),
			count($file),
			));

		// server return result
		if(count($file)> 0)
			echo json_encode($file);	
		else
			echo json_encode(array(
				getIndexFutureSymbol($symbol),
				count($file),
				'Unable to Locate Data'
		));

} else {
	// Realtime content
	if(strpos($symbol,'IF') !== false ||
	   strpos($symbol,'IH') !== false || 
	    strpos($symbol,'IC')!== false){
		// case index future
		$server = $GLOBALS['FUTURE_SERVER_REALTIME'].$GLOBALS['IF_REALTIME_PREFIX'].getIndexFutureSymbol($symbol);
	    echo file_get_contents($server);
	    
	} else {
		// commodity future
		$server = $GLOBALS['FUTURE_SERVER_REALTIME'].$symbol;
	  
	    echo file_get_contents($server);
	}
}

function ckDataIntegraty($file){
	$len = count($file);
	for($i =0 ; $i < $len; $i ++)
			if(count($file[$i]) != FUTURE_ARRAY_MASTER_LENGTH)
				unset($file[$i]);
	return $file;
}
function isUptoDate($today, $pastDay){
	if(($today - strtotime($pastDay)) < $GLOBALS['UPDATE_PERIOD'])
		return true;
	return false; 
}

function fetchFuture($sym,$file = ''){
	// continue here
	// fetching raw
	if(isDebug)
		echo 'Fetching!...<br>';
	$data = file_get_contents(getServerAdd($sym));

	//sanitize
	//echo  'data length is '.count($data).'<br>';
	$data = str_replace('{', '[', $data);
	$data = str_replace('}', ']', $data);
	$data = str_replace('date:', '', $data);
	$data = str_replace('open:', '', $data);
	$data = str_replace('high:', '', $data);
	$data = str_replace('close:', '', $data);
	$data = str_replace('low:', '', $data);
	$data = str_replace('volume:', '', $data);

	$data = json_decode($data,true);

	$fileLen = count($file);
	$datalen = count($data);

	//sanitation for date
	for($i = 0 ; $i<$datalen; $i++)
		// format into mm/dd/YYYY
		if(isset($data[$i][0]))
			$data[$i][0] = toUSTimeFormat($data[$i][0]);


	for($i = 0 ; $i<$fileLen; $i++)
		// format into mm/dd/YYYY
		if(isset($file[$i][0]))
			$file[$i][0] = toUSTimeFormat($file[$i][0]);
		

	
	if($file != ''){
		$lastday = toUSTimeFormat($file[$fileLen-1][0]);
		if(compareDate($lastday,time())	 < 0){
			// the data is longer
			// find the index in the data
			// +1 to start from next day, no repeat data
			$index = getBeginIndexFromJSONData($data,$lastday) + 1;
			if($index != -1){
				$resultArr = prepareAddedInfomation($data,$index);
				$nlen = count($resultArr);
				for($i = 0 ; $i< $nlen; $i++)
					array_push($file, $resultArr[$i]);
				return $file;
			}


		}
		//echo $lastday;
	} else {
		return $data;
	}
	return $data;
}
//echo getIndexFutureSymbol($symbol);

function prepareAddedInfomation($data,$beginIndex){
	$result = array();
	$innerResult = array();
	$innerLen = count($data[0]);
	$len = count($data);

	for($i = $beginIndex ; $i< $len; $i ++){
		for($j= 0; $j <$innerLen; $j++ )
			array_push($innerResult, $data[$i][$j]);
		// add a dummy data to make it to 7 length
		array_push($innerResult, $data[$i][$innerLen-1]);
		array_push($result, $innerResult );
		$innerResult = array();
	}
	return $result;
}

function toUSTimeFormat($str){
	$time = strtotime($str);
	return date('m/d/Y',$time);
}

function compareDate($targetDate, $today){
	return (strtotime($targetDate)-$today);
}

function getBeginIndexFromJSONData($data, $time){
	$len = count($data);
	for($i = 0 ; $i<$len; $i++){
		if(toUSTimeFormat($data[$i][0]) == $time)
			return $i;
	}
	return 0;
}

function getServerAdd($sym){
	if(strpos($sym,'IF') !== false || strpos($sym,'IH') !== false || strpos($sym,'IC') !== false)
		return ($GLOBALS['INDEXFUTURE_SERVER'].getIndexFutureSymbol($sym));
	else
		return ($GLOBALS['FUTURE_SERVER'].$sym);
	return $sym;
}

function loadContents($s){
	$file = array();
	$filename = $s;
	switch ($s) {
		case 'IF':
			$filename =  $GLOBALS['DATA_FOLDER'].'ZJIFMI.csv';
			break;
		case 'IH':
			$filename = $GLOBALS['DATA_FOLDER'].'ZJIHMI.csv';
			break;
		default:
		   $filename = $GLOBALS['DATA_FOLDER'].'F_'.$s.'.csv';
			# code...
			break;
	}

	$file = @file_get_contents($filename);

	if($file){
	$data = str_getcsv($file, "\n",',');
	foreach($data as &$Row) $Row = str_getcsv($Row, ","); 
	return $data;
	} else {
		// if(isDebug)
		// echo 'No File found, creating new';;
	return array();
	}
}

function SaveFutureData2CSV($symbol, $jsonArr){
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
			$filename = $GLOBALS['DATA_FOLDER'].'F_'.$symbol.'.csv';
			# code...
			break;
	}

	$len = count($jsonArr);
	$str = '';
	for($i = 0 ; $i< $len; $i ++)
		$str .= implode($jsonArr[$i], ',')."\n";

	file_put_contents($filename, $str);
}

function getIndexFutureSymbol($type){
	if(strpos($type,'IF') === false &&
	   strpos($type,'IH') === false &&
	   strpos($type,'IC') === false)
		return $type;
	$weekNum =  getWeeks(date('Y-m-d'), 'sunday');
	$year = date('y');
	$mon = date('m');
	$nextmon = date('m', strtotime('+1 month'));
	// 0 is sunday
	// 6 is sat
	$dayInWeek = date('w');
	if($weekNum<3){
		return $type.$year.$mon;
	} else if($weekNum>3){
		return $type.$year.$nextmon;
	} else if($weekNum == 3){
		if($dayInWeek<5) 
			return ($type.$year.$mon);
		else
			return ($type.$year.$nextmon);
	}
}

function printChinaTime(){
	echo date('Y-m-d');
}

function getWeeks($date, $rollover)
{
    $cut = substr($date, 0, 8);
    $daylen = 86400;

    $timestamp = strtotime($date);
    $first = strtotime($cut . "00");
    $elapsed = ($timestamp - $first) / $daylen;

    $weeks = 1;

    for ($i = 1; $i <= $elapsed; $i++)
    {
        $dayfind = $cut . (strlen($i) < 2 ? '0' . $i : $i);
        $daytimestamp = strtotime($dayfind);

        $day = strtolower(date("l", $daytimestamp));

        if($day == strtolower($rollover))  $weeks ++;
    }

    return $weeks;
}

?>
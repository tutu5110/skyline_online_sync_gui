<?php
	/*
	$initialPriceHS300 = 4.909;
	$initialPrice = 39.3;
	$symbol = 'CHAD';

	
	// get chad
	$result = getYahoo($symbol);
	
	$closePrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$closePercent = ($closePrice - $initialPrice) / $initialPrice * 100;



	//get hs300
	$symbol = 'sh510300';
	$_content = file_get_contents('http://qt.gtimg.cn/q=s_'.$symbol);
	$content = explode('~', $_content);
	$closePriceHS300 = $content[3];

	//GET shanghai index
	$symbol = 'sh000001';
	$_content = file_get_contents('http://qt.gtimg.cn/q=s_'.$symbol);
	$content = explode('~', $_content);
	$shIndex = $content[3];
	$shVal = $content[4];
	$shPercent = $content[5];

	$closePercentHS300 = ($closePriceHS300 -$initialPriceHS300)  / $initialPriceHS300 * 100;

	$finalPercent = $closePercent + $closePercentHS300;
	
		// get gold
	$symbol = 'Goldprice';
	$goldPrice = getGoldPrice();
	$goldPercent = 0;

		// get uwti
	$symbol = 'uwti';
	$result = getYahoo($symbol);
	$uwtiPrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$uwtiPercent = floatval($result['list']['resources'][0]['resource']['fields']['chg_percent']);


		// get xle
	$symbol = 'XLE';
	$result = getYahoo($symbol);
	
	$xlePrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$xlePercent = floatval($result['list']['resources'][0]['resource']['fields']['chg_percent']);

	
	echo toFixed($shIndex).'~'.$shVal.'~'.$shPercent.'~'.number_format($closePrice,2,'.','').'~'.number_format($finalPercent, 2, '.','').'%'.
		'~'.$uwtiPrice.'~'.toFixed($uwtiPercent).'~'.toFixed($goldPrice).'~'.toFixed($goldPercent).'~'.toFixed($xlePrice).'~'.toFixed($xlePercent);


    function getGoldPrice(){
    	$raw = file_get_contents('http://api2.goldprice.org/Service.svc/GetRaw/2');
    	$goldprice = explode(',',$raw);
    	$goldprice = $goldprice[0];
    	$begin  =   strpos($goldprice,'!')+1;
    	$end = strlen($goldprice);
    	return floatval(substr($goldprice, $begin, $end));
    }

	*/
	
	/*
	$initialPriceHS300 = 4.909;
	$initialPrice = 39.3;
	$symbol = 'CHAD';

	
	// get chad
	$result = getYahoo($symbol);
	
	$closePrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$closePercent = ($closePrice - $initialPrice) / $initialPrice * 100;



	//get hs300
	$symbol = 'sh510300';
	$_content = file_get_contents('http://qt.gtimg.cn/q=s_'.$symbol);
	$content = explode('~', $_content);
	$closePriceHS300 = $content[3];

	//GET shanghai index
	$symbol = 'sh000001';
	$_content = file_get_contents('http://qt.gtimg.cn/q=s_'.$symbol);
	$content = explode('~', $_content);
	$shIndex = $content[3];
	$shVal = $content[4];
	$shPercent = $content[5];

	$closePercentHS300 = ($closePriceHS300 -$initialPriceHS300)  / $initialPriceHS300 * 100;

	$finalPercent = $closePercent + $closePercentHS300;
	
		// get gold
	$symbol = 'Goldprice';
	$goldPrice = getGoldPrice();
	$goldPercent = 0;

		// get uwti
	$symbol = 'uwti';
	$result = getYahoo($symbol);
	$uwtiPrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$uwtiPercent = floatval($result['list']['resources'][0]['resource']['fields']['chg_percent']);


		// get xle
	$symbol = 'XLE';
	$result = getYahoo($symbol);
	
	$xlePrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$xlePercent = floatval($result['list']['resources'][0]['resource']['fields']['chg_percent']);

	
	echo toFixed($shIndex).'~'.$shVal.'~'.$shPercent.'~'.number_format($closePrice,2,'.','').'~'.number_format($finalPercent, 2, '.','').'%'.
		'~'.$uwtiPrice.'~'.toFixed($uwtiPercent).'~'.toFixed($goldPrice).'~'.toFixed($goldPercent).'~'.toFixed($xlePrice).'~'.toFixed($xlePercent);


    function getGoldPrice(){
    	$raw = file_get_contents('http://api2.goldprice.org/Service.svc/GetRaw/2');
    	$goldprice = explode(',',$raw);
    	$goldprice = $goldprice[0];
    	$begin  =   strpos($goldprice,'!')+1;
    	$end = strlen($goldprice);
    	return floatval(substr($goldprice, $begin, $end));
    }

	*/
$add =  urldecode($_GET['cadd']);

$result = file_get_contents($add);

echo $result;

exit();

function getYahoo($symbol){

	$json = file_get_contents('http://finance.yahoo.com/webservice/v1/symbols/'.$symbol.'/quote?format=json&view=detail');

	$jsonIterator = new RecursiveIteratorIterator(
    new RecursiveArrayIterator(json_decode($json, TRUE)),
    RecursiveIteratorIterator::SELF_FIRST);

	$result = array();
	foreach ($jsonIterator as $key => $val) {
	    if(is_array($val)) {
	       // echo "$key:\n";
	        $result[$key] = $val;
	    } else {
	       // echo "$key => $val\n";
	        $result[$key] = $val;
	    }
	}
	return $result;
}

function toFixed($num){
	//if($num > 0 )
		//return '+'.number_format($num,2,'.',','); 
	return number_format($num,2,'.',',');
}

function get_string_between($string, $start, $end){
	$string = ' ' . $string;
	$ini = strpos($string, $start);
	if ($ini == 0) return '';
	$ini += strlen($start);
	$len = strpos($string, $end, $ini) - $ini;
	return substr($string, $ini, $len);
}


?>

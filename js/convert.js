var hexNum = { 0:1, 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 
        A:1, B:1, C:1, D:1, E:1, F:1, 
        a:1, b:1, c:1, d:1, e:1, f:1 };

function convert2UTF8 ( argstr )
{
   argstr = argstr.replace(/\%/,"\\");  
   var s = convertEU2Hex(argstr);
   //alert(s);
   return convertHexNCR2CP(s);   
}


function convertEU2Hex(argstr)
{
    var s = argstr;
	
	s = s.replace(/\\u/g, ";&#x");
	s = s.replace(/^;/, "");
	s += ";";
    //alert(s);	
	
	return s;
}




function convertCP2UTF8 ( argstr )
{
  var outputString = "";
  argstr = argstr.replace(/^\s+/, '');
  if (argstr.length == 0) { return ""; }
  argstr = argstr.replace(/\s+/g, ' ');
  var listArray = argstr.split(' ');
  for ( var i = 0; i < listArray.length; i++ ) {
    var n = parseInt(listArray[i], 16);
    if (i > 0) { outputString += ' ';}
    if (n <= 0x7F) {
      outputString += dec2hex2(n);
    } else if (n <= 0x7FF) {
      outputString += dec2hex2(0xC0 | ((n>>6) & 0x1F)) + ' ' + dec2hex2(0x80 | (n & 0x3F));
    } else if (n <= 0xFFFF) {
      outputString += dec2hex2(0xE0 | ((n>>12) & 0x0F)) + ' ' + dec2hex2(0x80 | ((n>>6) & 0x3F)) + ' ' + dec2hex2(0x80 | (n & 0x3F));
    } else if (n <= 0x10FFFF) {
      outputString += dec2hex2(0xF0 | ((n>>18) & 0x07)) + ' ' + dec2hex2(0x80 | ((n>>12) & 0x3F)) + ' ' + dec2hex2(0x80 | ((n>>6) & 0x3F)) + ' ' + dec2hex2(0x80 | (n & 0x3F));
    } else {
      outputString += '!erreur ' + dhex(n) +'!';
    }
  }
  return( outputString );
}

function convertCP2Char ( argstr ) {
  var outputString = '';
  argstr = argstr.replace(/^\s+/, '');
  if (argstr.length == 0) { return ""; }
  	argstr = argstr.replace(/\s+/g, ' ');
  var listArray = argstr.split(' ');
  for ( var i = 0; i < listArray.length; i++ ) {
    var n = parseInt(listArray[i], 16);
    if (n <= 0xFFFF) {
      outputString += String.fromCharCode(n);
    } else if (n <= 0x10FFFF) {
      n -= 0x10000
      outputString += String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
    } else {
      outputString += 'convertCP2Char error: Code point out of range: '+dhex(n);
    }
  }
  return( outputString );
}

function convertHexNCR2CP ( argstr ) {
	CPstring = '';
	argstr += ' ';
	var tempString = '';
	var charStr = '';
	
	for (var i=0; i<argstr.length-1; i++) {   
		if (i<argstr.length-4 && argstr.charAt(i) == '&' 
			&& argstr.charAt(i+1) == '#' && argstr.charAt(i+2) == 'x'
			&& argstr.charAt(i+3) in hexNum) { // &#x
			tempString = '';
			i += 3;
			while (i<argstr.length-1 && argstr.charAt(i) in hexNum) { 
				tempString += argstr.charAt(i); 
				i++;
				}
			if (argstr.charAt(i) == ';') {
				charStr += convertCP2Char(tempString);
				}
			else { charStr += '&#x'+tempString; i--; }
			}
		else { 
			charStr += argstr.charAt(i);
			}
		} 
	 return charStr;
}


function getCPfromChar ( argstr ) {
  var codepoint = "";
  var haut = 0;
  var n = 0; 
  for (var i = 0; i < argstr.length; i++) {
    var b = argstr.charCodeAt(i); 
    if (b < 0 || b > 0xFFFF) {
      codepoint += 'Error: Initial byte out of range in getCPfromChar: '+dhex(b);
      }
    if (haut != 0) { 
      if (0xDC00 <= b && b <= 0xDFFF) {
        codepoint += dhex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)) + ' ';
        haut = 0;
        continue;
        }
      else {
        codepoint += 'Error: Second byte out of range in getCPfromChar: '+dhex(haut);
        haut = 0;
        }
      }
    if (0xD800 <= b && b <= 0xDBFF) { 
      haut = b;
      }
    else { 
      codepoint += b.toString(16).toUpperCase()+' ';
      }
    } 
  return codepoint;
  }



function  dec2hex2 ( argstr ) {
  var hexequiv = new Array ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
  return hexequiv[(argstr >> 4) & 0xF] + hexequiv[argstr & 0xF];
}
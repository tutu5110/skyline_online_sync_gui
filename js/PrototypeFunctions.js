String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};


String.prototype.removeAllAfter = function (search){
	var target = this;
	return target.substring(0,target.indexOf(search));
}

      String.prototype.contains = function(search){
          return (this.indexOf(search) != -1 ? true: false);
      }

String.prototype.toTimeStamp = function (){
      	return (new Date(this).getTime()/1000);
	}

 String.prototype.isCNMarket = function(){
    if(this.indexOf('16') != -1 ||
       this.indexOf('15') != -1 ||
       this.indexOf('60') != -1 ||
       this.indexOf('30') != -1 ||
       this.charAt(0) != '0')
      return true;
    return false;
  }
  String.prototype.isFuture = function(search){
    return this.toLowerCase().indexOf(search) != -1 ? true : false;
  }

  String.prototype.insert = function(add,search){
        var pos = a.indexOf(search);
        pos =  (pos != -1) ? pos : this.length;
        return [this.slice(0, pos), add, this.slice(pos)].join('');

  }

  String.prototype.insert = function(add,pos){
        pos =  (pos != -1) ? pos : this.length;
        return [this.slice(0, pos), add, this.slice(pos)].join('');

  }

  String.prototype.beginWith = function (target){
       return (target === this.substring(0,1)) ? true : false;
  }

  String.prototype.insertAfter = function(add, search){
        var pos = a.indexOf(search) + search.length;
        pos =  (pos != -1) ? pos : this.length;
        return [this.slice(0, pos), add, this.slice(pos)].join('');  
  }

 

  Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

String.prototype.convert2USDateFromCN = function(){
	if(this.indexOf("-")){
		var tmp = this.split("-");
		if(tmp.length == 3)
			return tmp[1]+"/" + tmp[2] + "/"+tmp[0];
		else
			return this;
	}

}
Array.prototype.removeLastN = function(num){
    for(var i = 0 ; i < num ; i ++){
             this.splice(-1, 1);
             this.join();
    }
    return this;
}
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
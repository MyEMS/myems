'use strict';
app.filter('tariffFilter', function() {
	return function(val, pidx, idx) {
		var output="";
		if(val==null || val=='-'){
			return val;
		}
		if(pidx==1){
			output=(parseFloat(val)*100).toFixed(0) +"%";
			return output;
		}else{
			if(idx>2){
				output=val.toFixed(2);
				return output;
			}else{
				return val;
			}
		}
	};
});

app.filter('decimalFilter', function() {
	return function(val, decimal,compare) {
		var output="";
		if(val=="loading"){
			return val;
		}
		if(val==null || val=='-'){
			return '-';
		}
		if(compare=="compare"){
			if(val<0){val=-val};
			output=(parseFloat(val)*100).toFixed(2) +"%";
			return output;
		}else{
			if(decimal==undefined){
				output=val.toFixed(0);
				return output;
			}else{
				output=val.toFixed(parseInt(decimal));
				return output;
			}
		}
		

	};
});

app.filter('floatFilter', function() {
	return function(val,compare,idx) {
		var output="";
		if(val==null || val=='-'){
			return '-';
		}
		if(idx==0){
			return val;
		}
		if(compare=="trend"){
			output=val.toFixed(2);
			return output;
		}else{
			if(val<0){val=-val};
			output=(parseFloat(val)*100).toFixed(2) +"%";
			return output;
		}
		

	};
});

app.filter('floatABS', function() {
	return function(val,idx, total) {
		var output="";
		if(val==null || val=='-'){
			return '-';
		}
		if(total){
			if(idx > 1){
				output=Math.abs(parseFloat(val));
				output = parseFloat(output).toFixed(2);
				return output;
			}else{
				val = parseFloat(val).toFixed(2);
				return val;
			}
		}
		if(idx == 0){
			return val;
		}
		if(idx > 2){
			output=Math.abs(parseFloat(val));
			output = parseFloat(output).toFixed(2);
			return output;
		}else{
			val = parseFloat(val).toFixed(2);
			return val;
		}

	};
});

app.filter('tableFilter', function() {
	return function(val,idx) {
		var output="";
		if(val==null || val=='-'){
			return '-';
		}
		if(idx==0){
			return val;
		}else if (idx ==1){
			output=val.toFixed(2);
			return output;
		}else{
			output=(parseFloat(val)*100).toFixed(1) +"%";
			return output;
		}

	};
});

app.filter('totalFilter', function() {
	return function(val,compare) {
		var output="";
		if(val==null || val=='-'){
			return '-';
		}
		if(compare=="trend"){
			output=val.toFixed(2);
			return output;
		}else{
			if(val<0){val=-val};
			output=(parseFloat(val)*100).toFixed(2) +"%";
			return output;
		}
		

	};
});

app.filter('productFilter', function() {
	return function(val,compare,idx,len) {
		var output="";
		if(val==null || val=='-'){
			return '-';
		}
		if(idx==0){
			return val;
		}

		if(compare=="trend"){
			if(idx==len-1){
				output=val.toFixed(4);
			}else{
				output=val.toFixed(2);
			}
			return output;
		}else{
			if(val<0){val=-val};
			if(idx==len-1){
				output=(parseFloat(val)*100).toFixed(4) +"%";
			}else{
				output=(parseFloat(val)*100).toFixed(2) +"%";
			}
			return output;
		}
		

	};
});

app.filter('productTotalFilter', function() {
	return function(val,compare,idx,len) {
		var output="";
		if(val==null || val=='-'){
			return '-';
		}
		if(compare=="trend"){
			if(idx==len-1){
				output=val.toFixed(4);
			}else{
				output=val.toFixed(2);
			}
			return output;
		}else{
			if(val<0){val=-val};
			if(idx==len-1){
				output=(parseFloat(val)*100).toFixed(4) +"%";
			}else{
				output=(parseFloat(val)*100).toFixed(2) +"%";
			}
			return output;
		}
		

	};
});



var STARTHOUR = 6;
var STARTMINUTE = 30;

if (!String.prototype.format) {
    String.prototype.format = function() {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{'+i+'\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };
}

if (!Object.entries)
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
    return resArray;
};

function getFormat(period){
	switch(period){
		case 'day':
			return "YYYY-MM-DD";
			break;
		case 'hour':
			return "YYYY-MM-DD HH:mm";
			break;
		case 'month':
			return "YYYY-MM";
			break;
		case 'year':
			return "YYYY";
			break;
	}
}

function getChartFormat(period){
	switch(period){
		case 'day':
			return '%m-%d';
			break;
		case 'hour':
			return '%m-%d %H:%M';
			break;
		case 'month':
			return '%Y-%m';
			break;
		case 'year':
			return '%Y';
			break;
	}
}

function saveAs(uri, filename) {
  var link = document.createElement('a');
  if (typeof link.download === 'string') {
    link.href = uri;
    link.download = filename;

    //Firefox requires the link to be in the body
    document.body.appendChild(link);
    
    //simulate click
    link.click();

    //remove the link when done
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
}


function SaveToDisk(blobURL, fileName) {
    var reader = new FileReader();
    reader.readAsDataURL(blobURL);
    //reader.readAsBinaryString(blobURL);
    //reader.readAsArrayBuffer(blobURL)
    reader.onload = function(event) {
        var save = document.createElement('a');
        save.href = event.target.result;
        save.download = fileName || 'unknown file';

        save.style = 'display:none;opacity:0;color:transparent;';
        (document.body || document.documentElement).appendChild(save);

        if (typeof save.click === 'function') {
            save.click();
        } else {
            save.target = '_blank';
            var event = document.createEvent('Event');
            event.initEvent('click', true, true);
            save.dispatchEvent(event);
        }

        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    };
}

function compareRange(start, end, start2, end2) {
    var period = "day", range1, range2;
    if (start.length < 5) {
        start = start + '-01-01';
        end = end + '-01-01';
        period = "year";
    } else if (start.length < 8) {
        start = start + '-01';
        end = end + '-01';
        period = "month";
    } else if (start.length < 11) {

    } else if (start.length < 20) {
        start = start.replace("-", "/").replace("T", " ");
        startNumber = new Date(start).getTime();
        end = end.replace("-", "/").replace("T", " ");
        endNumber = new Date(end).getTime();
        start2 = start2.replace("-", "/").replace("T", " ");
        startNumber2 = new Date(start2).getTime();
        end2 = end2.replace("-", "/").replace("T", " ");
        endNumber2 = new Date(end2).getTime();
        console.log(startNumber);
        return (endNumber2-endNumber)==(startNumber2-startNumber)?true:false;
    }
    
    if(start2.length<5){
        start2=start2+'-01-01';
        end2 =end2+'-01-01';
    }else if(start2.length<8){
        start2=start2+'-01';
        end2 =end2+'-01';
    }
    
    start = new Date(start.replace("-", "/").replace("-","/"));
    end = new Date(end.replace("-", "/").replace("-","/"));
    start2 = new Date(start2.replace("-", "/").replace("-","/"));
    end2 = new Date(end2.replace("-", "/").replace("-","/"));

    if(period=="day"){
        range1=end-start;
        range2=end2-start2;
    }else if(period=='month'){
        range1=(end.getFullYear()-start.getFullYear())*12+(end.getMonth()-start.getMonth());
        range2=(end2.getFullYear()-start2.getFullYear())*12+(end2.getMonth()-start2.getMonth());
    }else if(period=="year"){
        range1=end.getFullYear()-start.getFullYear();
        range2=end2.getFullYear()-start2.getFullYear();
    }

    
    return range1==range2?true:false;
}

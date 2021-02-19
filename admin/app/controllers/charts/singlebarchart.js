'use strict';

app.controller('SingleBarChartController', function($scope,highchartsNG) {

	$scope.$on('handleBroadcastLineOptionChanged', function(event, data) {
		if(angular.isDefined(data.load)){
			$scope.singleConfig.loading=true;
			$scope.dynamic=[];
		}else{
			$scope.singleConfig.series=data.line;
			$scope.singleConfig.loading=false;
			if(angular.isDefined(data.category)){
				
				angular.forEach(data.category,function(item,key){
					item.chart=$scope.getChartConfig(item);
				});
				$scope.dynamic=data.category;
			}
			
		}

		
	});

	$scope.getChartConfig=function(item){
		var newchart=angular.copy($scope.singleConfig);
		newchart.series=item.metadata;
		return newchart;
	};

	$scope.singleConfig = {
		options: {
			chart: {
				type: 'column',
				options3d: {
					enabled: true,
					alpha: 10,
					beta: 15,
					depth: 70
				}

			},

			legend: {
				enabled: false
			},

			plotOptions: {
				column: {
					depth: 25
				}
			},
			navigator: {
				xAxis: {
					type: 'datetime',
					labels: {
						formatter: function() {
							var dateStr = Highcharts.dateFormat('%m-%d', this.value);
							return dateStr;
						},
					},
				},
			},
			xAxis: {
				startOnTick: false,
				type: 'datetime',
				labels: {
					formatter: function() {
						var dateStr = Highcharts.dateFormat('%m-%d', this.value);
						return dateStr;
					},
				},
				crosshair: null
			},


		},
		loading:true,

		series: [],
		//noData: 'No data to display',

		func: function(chart) {
			$scope.mouseEvent(chart);
		}


	};

	

	$scope.mouseEvent = function(chart) {
		angular.element('.chart').bind('mousedown.hc touchstart.hc', function(eStart) {
			eStart = chart.pointer.normalize(eStart);

			var posX = eStart.pageX,
				posY = eStart.pageY,
				alpha = chart.options.chart.options3d.alpha,
				beta = chart.options.chart.options3d.beta,
				newAlpha,
				newBeta,
				sensitivity = 5; // lower is more sensitive

			angular.element(document).bind({
				'mousemove.hc touchdrag.hc': function(e) {
					// Run beta
					newBeta = beta + (posX - e.pageX) / sensitivity;
					chart.options.chart.options3d.beta = newBeta;

					// Run alpha
					newAlpha = alpha + (e.pageY - posY) / sensitivity;
					chart.options.chart.options3d.alpha = newAlpha;

					chart.redraw(false);
				},
				'mouseup touchend': function() {
					angular.element(document).unbind('.hc');
				}
			});
		});
	};
	


});
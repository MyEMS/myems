'use strict';

app.controller('PieChartController', function($scope,highchartsNG) {

	$scope.$on('handleBroadcastLineOptionChanged', function(event, data) {
		if(angular.isDefined(data.load)){
			$scope.pieConfig.loading=true;
		}else{
			$scope.pieConfig.series[0].data=data.equipment_percentage;
			$scope.pieConfig.loading=false;
		}
	});


	$scope.pieConfig = {
		options: {
			chart: {
				type: 'pie',
				options3d: {
					enabled: true,
					alpha: 45
				}

			},
			tooltip: {
				pointFormat: '</br> <b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				pie: {
					innerSize: 100,
					depth: 45,
					//allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						format: '<b>{point.name}</b>: {point.percentage:.1f} %',
						style: {
							color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
						}
					}
				}
			},
		},
		series: [{
			name: 'Percentage',
			colorByPoint: true,
			data: []
		}],

		//noData:'No data to display',
		loading:true,

		title: {
			text: null
		},
		//useHighStocks: true

	};


});
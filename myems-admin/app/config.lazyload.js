app.config([
    '$ocLazyLoadProvider',
    function($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            debug: true,
            events: true,
            modules: [{
                name: 'moment',
                files: ['js/plugins/moment/moment.min.js']
            },{
                name:'icheck',
                files:[
                    'css/plugins/iCheck/custom.css',
                    'js/plugins/iCheck/icheck.min.js'
                ]
            }, {
                name: 'ui.checkbox',
                files: [
                    'js/bootstrap/angular-bootstrap-checkbox.js',
                    'css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
                ]
            }, {
                name: 'ui.select',
                files: [
                    'js/plugins/ui-select/select.min.js', 
                    'css/plugins/ui-select/select.min.css'
                ]
            },  {
                name: 'daterangepicker',
                //serie: true,
                files: [
                    'js/daterangepicker/moment.min.js',
                    'js/daterangepicker/daterangepicker.min.js', 
                    'js/daterangepicker/daterangepicker.min.css',
                    'js/daterangepicker/angular-daterangepicker.min.js'
                ]
            },{
                name:'datepicker',
                files:[
                    'css/plugins/datapicker/angular-datapicker.css',
                    'js/plugins/datapicker/angular-datepicker.js'
                ]
            },{
                name:'datatables',
                //serie:true,
                files:[
                    'js/plugins/dataTables/datatables.min.js', 
                    'css/plugins/dataTables/datatables.min.css',
                    'js/plugins/dataTables/angular-datatables.min.js'
                ]
            },{
                name:'sparkline',
                files:[
                    'js/plugins/sparkline/jquery.sparkline.min.js'
                ]
            },{
                insertBefore: '#loadBefore',
                name: 'toaster',
                files: [
                    'js/plugins/toastr/toastr.min.js', 
                    'css/plugins/toastr/toastr.min.css'
                ]
            }, {
                insertBefore: '#loadBefore',
                name: 'ui.calendar',
                files: [
                    'css/plugins/fullcalendar/fullcalendar.css',
                    'js/plugins/fullcalendar/fullcalendar.min.js',
                    'js/plugins/fullcalendar/gcal.js',
                    'js/plugins/fullcalendar/calendar.js'
                ]
            },  {
                name: 'dropzone',
                files: [
                    'css/plugins/dropzone/basic.css',
                    'css/plugins/dropzone/dropzone.css',
                    'js/plugins/dropzone/dropzone.js'
                ]
            },{
                name: 'integralui',
                files:[
                    'js/jcui/integralui.css',
                    'js/jcui/integralui.checkbox.css',
                    'js/jcui/integralui.treeview.css',
                    'js/jcui/theme-bootstrap.css',
                    'js/jcui/tree-icon.css',
                    'js/jcui/angular.integralui.min.js',
                    'js/jcui/angular.integralui.checkbox.min.js',
                    'js/jcui/angular.integralui.lists.min.js',
                    'js/jcui/angular.integralui.treeview.min.js'
                ]
            }]
        });
    }
]);
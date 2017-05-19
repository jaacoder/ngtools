(function() {
    var ngtoolsModule = angular.module('jaacoder-ngtools')
        
    ngtoolsModule.run(['$location', function($location) {
            
            // skip resolving data in next route dispatch
            $location.skipResolving = function(vm) {
                this.vm = vm
                return this
            }
            
        }])
        
        .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
                
                // remove '!' as hash prefix
                $locationProvider.hashPrefix('')
                
                $routeProvider.when('/:module/:controller/:method?/:p0?/:p1?/:p2?/:p3?/:p4?/:p5?/:p6?/:p7?/:p8?/:p9?', {
                    resolve: {
                        data: ['$http', '$q', '$location', function($http, $q, $location) {
                                
                            if ($location.vm) {
                                var vm = $location.vm
                                $location.vm = null
                                return vm
                            }
                                
                            var deferred = $q.defer()
                            
                            $http.get($location.$$path.substr(1)).then(function(response) {
                                routeResolution = angular.isObject(response.data) ? response.data : {}
                                deferred.resolve(routeResolution)
                            })
                            
                            return deferred.promise
                        }]
                    },
                    templateUrl: function(params) {
                        return 'views/' + params.module + '/' + params.controller + '/' + params.controller + '.html'
                    }
                })
                
            }])
        
})();
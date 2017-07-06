/* global appHelper, numeral */

(function () {


    // if ui.boostrap does not exist, exit
    try {
        angular.module('ui.bootstrap')
    } catch (e) {
        return
    }
    
    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.run(['$rootScope', '$uibModal', function ($rootScope, $uibModal) {

            $rootScope.openModal = function (url, callback) {

                var parentScope = this

                if (url[0] == '/') {
                    url = url.substr(1)
                }

                var urlAndQuery = url.split('?')

                var segments = urlAndQuery[0].split('/')
                var module = segments.shift()
                var controller = segments.shift()

                var query = urlAndQuery[1]
                var querySegments = query ? query.split('&') : []
                var queryParams = {}

                for (var i in querySegments) {

                    var nameAndValue = querySegments[i].split('=')

                    if (!nameAndValue) {
                        continue
                    }

                    var paramName = unescape(nameAndValue[0])
                    var paramValue = unescape(nameAndValue[1])

                    queryParams[paramName] = paramValue
                }

                if (!module || !controller) {
                    console.log('Url should be in format: \'/{module}/{controller}/{action}/{params:.*}\'')
                    return
                }

                var view = 'views/' + module + '/' + controller + '/' + (queryParams.view || controller) + '.html'

                // prepare callback function
                var realCallback = function () {}

                if (angular.isFunction(callback)) {
                    realCallback = callback

                } else {
                    var callbackObject = null

                    if (angular.isObject(callback)) {
                        callbackObject = callback
                        //
                    } else if (angular.isString(callback)) {
                        callbackObject = eval('parentScope.' + callback)
                        if (!callbackObject) {
                            callbackObject = eval('parentScope.' + callback + ' = {}')
                        }
                    }

                    if (callbackObject) {
                        realCallback = function (object) {
                            angular.copy(object, callbackObject)
                        }
                    }
                }

                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: view,
                    bindToController: false,
                    appendTo: angular.element($('[ng-view]')),
                    controller: ['$scope', function ($scope) {
                            $scope.modal = true
                            
                            $scope.modalCallback = function () {
                                realCallback.apply(parentScope, arguments)
                                modal.close()
                            }
                            
                            $scope.closeModal = function () {
                                modal.close()
                            }

                            $scope.baseUrl = module + '/' + controller
                        }],
//                    controllerAs: 'ctrl',
                    resolve: {
                        data: ['$http', '$q', '$location', function ($http, $q, $location) {

                                if ($location.vm) {
                                    var vm = $location.vm
                                    $location.vm = null
                                    return vm
                                }

                                var deferred = $q.defer()

                                $http.get(url).then(function (response) {
                                    routeResolution = angular.isObject(response.data) ? response.data : {}
                                    deferred.resolve(routeResolution)
                                })

                                return deferred.promise
                            }]
                    },
                    size: 'lg'
                })
            }
        }])
})();
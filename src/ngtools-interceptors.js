(function () {
    
    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.factory('noCacheInterceptor', [function () {
            return {
                request: function (request) {

                    if (request.url.indexOf('.html') >= 0 && request.url.indexOf('uib/') === -1) {
                        var sign = (request.url.indexOf('?') < 0) ? '?' : '&'
                        request.url += sign + 'noCache=' + ngtoolsModule.noCache
                    }

                    return request
                }
            }
        }])

            .factory('redirectInterceptor', ['$q', function ($q) {
                    return {
                        response: function (response) {

                            if (response && angular.isObject(response.data) && response.data._redirect) {
                                var redirect = response.data._redirect

                                if (redirect.substr(0, 1) === '#') {
                                    location.hash = redirect
                                    //
                                } else {
                                    location.href = redirect
                                }

                                return $q.reject(response)
                            }

                            return response
                        }
                    }
                }])

            // interceptor: loading modal
            .factory('loadingModalInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {

                    // show loading modal
                    $rootScope.showLoadingModal = function () {
                        $('#modalLoading').modal('show')
                    };

                    // hide loading modal
                    $rootScope.hideLoadingModal = function () {
                        $('#modalLoading').modal('hide')
                    };

                    var activeRequests = 0;

                    var showLoadingModal = function () {

                        if (activeRequests == 0) {
                            $rootScope.showLoadingModal()
                        }

                        activeRequests++;
                    };

                    var hideLoadingModal = function () {

                        if (activeRequests > 0) {
                            activeRequests--
                        }

                        if (activeRequests <= 0) {
                            activeRequests = 0
                            $rootScope.hideLoadingModal()
                        }
                    };


                    return {

                        request: function (config) {
                            // confirm workaround 
                            if (!config.url.match(/backdrop\.html$/) && !config.url.match(/window\.html/)) {
                                showLoadingModal()
                            }
                            return config
                        },

                        requestError: function (rejection) {
                            setTimeout(hideLoadingModal, 100)
                            return $q.reject(rejection)
                        },

                        response: function (response) {
                            setTimeout(hideLoadingModal, 100)
                            return response
                        },

                        responseError: function (rejection) {
                            setTimeout(hideLoadingModal, 100)
                            return $q.reject(rejection)
                        }
                    };
                }])

            .config([function () {
                    // register one 'nocache' for refresh (F5)
                    ngtoolsModule.noCache = (new Date().getTime())
                }])

})();
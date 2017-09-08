(function () {
    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.run(['$rootScope', '$http', '$location', '$q', function ($rootScope, $http, $location, $q) {

            // avoid caching JS file on refresh, but caching it between refreshs
            var $ajax = $.ajax; // save the original $.ajax
            $.ajax = function (settings) { // wrap the old $.ajax so set cache to true...
                if (settings.dataType === 'script') {
                    settings.cache = true;
                    if (settings.url.indexOf('?') === -1) {
                        settings.url += '?'
                    } else {
                        settings.url += '&'
                    }

                    settings.url += 'noCache=' + ngtoolsModule.noCache
                }

                $ajax(settings); // call old $.ajax
            }

            /**
             * Process response if success.
             * 
             * @param {Object} response
             * @param {Object} config
             * @return {Object}
             */
            $rootScope.processResponse = function (response, config) {
                var scope = response.scope
                config = angular.merge({copyMethod: 'extend', dest: 'vm'}, config || {})

                if (response.data && angular.isObject(response.data)) {

                    var oldView = (scope.vm && scope.vm.view) || null;
                    if (config.copyMethod) {
                        if (!_.hasIn(scope, config.dest)) {
                            _.set(scope, config.dest, angular.isArray(response.data) ? [] : {})
                        }
                        
                        angular[config.copyMethod](_.get(scope, config.dest), response.data)
                    }

                    if (!scope.modal && response.data.view /*&& response.data.view != oldView*/) {
                        $location.skipResolving(scope.vm).path(S(response.config.url).ensureLeft('/').s)
                    }
                }

                return response
            }

            /**
             * Send ajax call.
             * 
             * @param {String} method
             * @param {String} url
             * @param {Object} data
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.send = function (method, url, data, config) {
                var scope = this
                var url = '' + url // convert url to string

                if (url.substr(0, 4) !== 'http') {
                    if (url.substr(0, 1) !== '/') {
                        url = S(scope.baseUrl + '/' + url).chompLeft('/').s
                    } else {
                        url = S(url).chompLeft('/').s
                    }
                }

                return $http[method.toLowerCase()](url, data, config).then(function (response) {

                    // save scope for custom use
                    response.scope = scope

                    if (scope.processResponse && angular.isFunction(scope.processResponse)) {
                        return scope.processResponse(response, config)
                        //
                    } else {
                        return response
                    }

                    //
                }, function (response) {

                    // save scope for custom use
                    response.scope = scope

                    if (scope.processResponse && angular.isFunction(scope.processResponse) && response.config.processingResponse !== false) {
                        return $q.reject(scope.processResponse(response, config))
                        //
                    } else {
                        return $q.reject(response)
                    }

                    return $q.reject(response)
                })
            }

            /**
             * Do a GET request.
             * 
             * @param {String} url
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.get = function (url, config) {
                return this.send('get', url, null, config)
            }

            /**
             * Do a POST request.
             * 
             * @param {String} url
             * @param {Object} data
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.post = function (url, data, config) {
                return this.send('post', url, data, config)
            }

            /**
             * Do a PUT request.
             * 
             * @param {String} url
             * @param {Object} data
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.put = function (url, data, config) {
                return this.send('put', url, data, config)
            }

            /**
             * Do a DELETE request.
             * 
             * @param {String} url
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.delete = function (url, config) {
                return this.send('delete', url, null, config)
            }

        }])

})();

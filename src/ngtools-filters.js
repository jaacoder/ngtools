angular.module('jaacoder-ngtools')

    .filter('cpf', ['formatter', function(formatter) {
        return formatter.cpf
    }])
    
    .filter('cnpj', ['formatter', function(formatter) {
        return formatter.cnpj
    }])
    
    .filter('date', ['formatter', function(formatter) {
        return formatter.date
    }])
    
    .filter('time', ['formatter', function(formatter) {
        return formatter.time
    }])
    
    .filter('cep', ['formatter', function(formatter) {
        return formatter.cep
    }])
    
    .filter('cns', ['formatter', function(formatter) {
        return formatter.cns
    }])
    
    .filter('phone', ['formatter', function(formatter) {
        return formatter.phone
    }])
    
    .filter('numeric', ['formatter', function(formatter) {
        return formatter.numeric
    }])
    
    .filter('count', ['formatter', function(formatter) {
        return formatter.count
    }])
    
    .filter('decimal', ['formatter', function(formatter) {
        return formatter.decimal
    }])
    
    .filter('currency', ['formatter', function(formatter) {
        return formatter.currency
    }])
    
    .filter('decimal4', ['formatter', function(formatter) {
        return formatter.decimal4
    }])
    
    .filter('currency4', ['formatter', function(formatter) {
        return formatter.currency4
    }])
    
    .filter('flag', ['formatter', function(formatter) {
        return formatter.flag
    }])
    
    .filter('upper', ['formatter', function(formatter) {
        return formatter.upper
    }]);
    

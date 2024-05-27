(function dsbuilder(attr){
    var params = {};

    // Set authentication values in connection string
    var authAttrValue = attr[connectionHelper.attributeAuthentication];

    // Set host information in connection string
    params["SERVER"] = attr[connectionHelper.attributeServer];
    params["PORT"] = attr[connectionHelper.attributePort];

    if (authAttrValue == "auth-integrated"){
        params["Auth"] = "AWS_SIGV4"; 
        params["Region"] = attr[v-region];
    } else if (authAttrValue == "auth-user-pass"){
        params["Auth"] = "BASIC"; 
        params["UID"] = attr[connectionHelper.attributeUsername];
        params["PWD"] = attr[connectionHelper.attributePassword];
    } else if (authAttrValue == "oauth"){
        params["Auth"] = "OAUTH2";
        params["JWT"] = attr["ACCESSTOKEN"];
    } else if (authAttrValue == "auth-none"){
        params["Auth"] = "NONE";        
    }

    // Set SSL value in connection string 
    if (attr[connectionHelper.attributeSSLMode] == "require"){
        params["useSSL"] = "1";
    } else {
        params["useSSL"] = "0";
    }

    // Format the attributes as 'key=value'
    var formattedParams = [];
    formattedParams.push(connectionHelper.formatKeyValuePair(driverLocator.keywordDriver, driverLocator.locateDriver(attr)));
    for (var key in params){
        formattedParams.push(connectionHelper.formatKeyValuePair(key, params[key]));
    }
    return formattedParams;
})
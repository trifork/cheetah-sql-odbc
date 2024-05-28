## OpenSearch - Tableau

A special note is required for Tableau that can use both JDBC and ODBC. The ODBC connector and driver is explained in detail [here](Trifork.readme.md). For Tableau ODBC connector isn still working in progres beacuse of OAuth is not working (UsernamePassword works). The ODBC project takes inspiration from an old OpenSource project [connecting OpenSearch to Tableau 2022 with ODBC](https://github.com/opensearch-project/sql/blob/1.x/sql-odbc/docs/user/tableau_support.md). Indeed, there is an old branch of OpenSearch of a [Tableau connector project](https://github.com/opensearch-project/sql/blob/remove-integtest-sh-1.x/sql-odbc/src/TableauConnector/opensearch_sql_odbc/opensearch_sql_odbc.taco) with the ODBC `.taco` file but require a specific driver from an [old open-source version of ElasticSearch archived project](https://github.com/opendistro-for-elasticsearch/sql) (read-only from 2022) that it doesn't work properly and doesn't provide `OAUTH2`. 

On development phase, Tableau Desktop will visualize the interface with the name and options defined by the `TDVT` (Tableau Data source Verification Tool as main component of `Tableau Connector SDK`). The project is in the `extensionTableauConnector` folder will be package all the file from the `extensionTableauConnector/tds` folder and package the `.taco` file inside the folder where you install the `connector-plugin-sdk`. 

There is JDBC version which is possible to explore and deepen the source code in the ufficial [OpenSearch - JDBC repo](https://github.com/opensearch-project/sql-jdbc) of the connector and the driver. This project carried by Amazon contribution is described in [OpenSearch by Amazon](https://extensiongallery.tableau.com/it-it/products/926?_ga=2.267654414.1875047423.1701090439-1605525258.1665131769) but still no `OAUTH2` provided. 

> [!IMPORTANT] 
> - JDBC connector after some local test seems that doesn't work properly in authentication/authorization to OpenSearch for example with Username: "admin" and Password: "admin":
> - From the Tableau GUI appears: "Connection error Forbidden Unable to connect to the OpenSearch by OpenSearch Project server "localhost". Check that the server is running and that you have access privileges to the requested database. Connector Class: opensearch_jdbc, Version: 1.0.1 For support, contact OpenSearch Project." 
> - From the Docker logs after an attempt to login shows " No cluster-level perm match for User [name=opendistro_security_anonymous, backend_roles=[opendistro_security_anonymous_backendrole], requestedTenant=null] Resolved [aliases=[*], allIndices=[*], types=[*], originalRequested=[*], remoteIndices=[]] [Action [cluster:monitor/main]] [RolesChecked [own_index]]. No permissions for [cluster:monitor/main]"
> - ODBC connector doesn't work properly in authentication/authorization with `OAUTH2`: "An error occurred while communicating with data source 'Untitled Data Source' Authentication failed.Error Code: 84223ADA Tableau received an OAuth error from your request. Please see the error message for more information: java.net.MalformedURLException."        

## Download and Installation JDBC

The driver is available for download from [Maven](https://repo1.maven.org/maven2/org/opensearch/driver/opensearch-sql-jdbc/), from [Artifacts page](https://opensearch.org/artifacts) on OpenSearch.org at the very bottom and from [automated CI workflow](https://github.com/opensearch-project/sql-jdbc/actions/workflows/sql-jdbc-test-and-build-workflow.yml).

## Using the driver ODBC/JDBC

The driver comes in the form of a single jar file. To use it, simply place it on the classpath of the
Java application that needs to use it.

If using with JDBC compatible BI tools, refer to the tool documentation on configuring a new JDBC driver. Typically,
all that's required is to make the tool aware of the location of the driver jar and then use it to setup database (i.e
OpenSearch) connections.

The ODBC require the modifyed ODBC driver installed by a `.msi` file that support `OAUTH2`.

### Connection URL and other settings JDBC

To setup a connection, the driver requires a JDBC connection URL. The connection URL is of the form:
```
    jdbc:opensearch://[scheme://][host][:port][/context-path]?[property-key=value]&[property-key2=value2]..&[property-keyN=valueN]
```

* scheme

  Can be one of *http* or *https*. Default is *http*.

* host

  Hostname or IP address of the target cluster. Default is *localhost*.

* port

  Port number on which the cluster's REST interface is listening. Default value depends on the *scheme* selected. For
  *http*, the default is 9200. For *https*, the default is 443.

* context-path

  The context path at which the cluster REST interface is rooted. Not needed if the REST interface is simply available on the '/' context path.

* property key=value

  The query string portion of the connection URL can contain desired connection settings in the form of one or more
  *property-key=value* pairs. The possible configuration properties are provided in the table below. The property keys and values are case insensitive and values unless otherwise indicated.

  Note that JDBC provides multiple APIs for specifying connection properties of which specifying them in the connection
  URL is just one. When directly coding with the driver you can choose any of the other options (refer sample
  code below). If you are setting up a connection via a tool, it is likely the tool will allow you to specify the
  connection URL (with just the scheme, host, port and context-path components) while the the connection properties are provided separately.
  For example, you may not wish to place the user and password in the connection URL. Check the tool you are using for
  such support.

  The configurable connection properties are:

  | Property Key           | Description                                                                                                      | Accepted Value(s) | Default value  |
  |------------------------|------------------------------------------------------------------------------------------------------------------|-------------------|----------------|
  | user                   | Connection username. mandatory if `auth` property selects a authentication scheme that mandates a username value | any string        | `null`         |
  | password               | Connection password. mandatory if `auth` property selects a authentication scheme that mandates a password value | any string        | `null`         |
  | fetchSize              | Cursor page size | positive integer value. Max value is limited by `index.max_result_window` OpenSearch setting  |   `0` (for non-paginated response) |
  | logOutput              | Location where driver logs should be emitted                                                                     | a valid file path | `null` (logs are disabled) |
  | logLevel               | Severity level for which driver logs should be emitted                                                           | in order from highest (least logging) to lowest (most logging): `OFF`, `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`, `ALL` | `OFF` (logs are disabled) |
  | auth                   | Authentication mechanism to use | `NONE` (no auth), `BASIC` (HTTP Basic), `AWS_SIGV4` (AWS SIGV4) | `basic` if username and/or password is specified, `NONE` otherwise |
  | awsCredentialsProvider | The AWS credential provider to be used when authentication mechanism is `AWS_SIGV4` (AWS SIGV4). If not set, the driver will use `DefaultAWSCredentialsProviderChain` to sign the request. The value has to be an instance of `com.amazonaws.auth.AWSCredentialsProvider` | instance of an `AWSCredentialProvider` | `DefaultAWSCredentialsProviderChain` |
  | region                 | If authentication type is `aws_sigv4`, then this is the region value to use when signing requests. Only needed if the driver can not determine the region for the host endpoint. The driver will detect the region if the host endpoint matches a known url pattern. | a valid AWS region value e.g. `us-east-1` | `null` (auto-detected if possible from the host endpoint) |
  | requestCompression     | Whether to indicate acceptance of compressed (gzip) responses when making server requests | `true` or `false` | `false` |
  | useSSL                 | Whether to establish the connection over SSL/TLS                                                                 | `true` or `false` | `false` if scheme is `http`, `true` if scheme is `https` |
  | trustStoreLocation     | Location of the SSL/TLS truststore to use                                                                        | file path or URL as appropriate to the type of truststore | `null` |
  | trustStoreType         | Type of the truststore                                                                                           | valid truststore type recognized by available Java security providers | JKS |
  | trustStorePassword     | Password to access the Trust Store                                                                               | any string        | `null`         |
  | keyStoreLocation       | Location of the SSL/TLS keystore to use                                                                          | file path or URL as appropriate to the type of keystore | `null` |
  | keyStoreType           | Type of the keystore                                                                                             | valid keystore type recognized by available Java security providers | JKS |
  | keyStorePassword       | Password to access the keystore                                                                                  | any string        | `null`         |
  | trustSelfSigned        | Shortcut way to indicate that any self-signed certificate should be accepted. A truststore is not required to be configured. | `true` or `false` | `false` |
  | hostnameVerification   | Indicate whether certificate hostname verification should be performed when using SSL/TLS                        | `true` or `false` | `true`         |
  | tunnelHost             | VPC endpoint hostname if connected through a tunnel or proxy and `AWS_SIGV4` authentication is used              | any string        | `null`         |



## Customizing the Tableau connector ODBC/JDBC
The structure of the connector can be different and this template follow the latest version as [Connection Dialog v2](https://tableau.github.io/connector-plugin-sdk/docs/mcd) of the structure and generally differ from PowerBI connector in the structure and development phases:

  - The corrispective of `PowerQuery SDK` and M language for the PowerBI in Tableau is `TDVT`, the coding language is mainly Javascript and the output is a `.taco` file.
  - The packaging phase that is made from a specific Python module and is available a step by step guide to run the [connector-packager](https://tableau.github.io/connector-plugin-sdk/docs/package-sign).

The frontend (connector) development environment is based on Python which has some requirement, installations and settings that can be explored in [TDVT](https://tableau.github.io/connector-plugin-sdk/docs/tdvt). A general explanation of the source code and specifically the [structure](https://tableau.github.io/connector-plugin-sdk/docs/) of a standard project is provided. JDBC connector has a slightly different logic to build the connection string.

## Customizing the driver JDBC
Differently from ODBC the JDBC the customizing development consist on:

   - The ODBC driver is developed in C/C++, produce `.dll` (windows case) files and will package into a `.msi` file that will install the driver.
   - The corrispective of C/C++ logic for the ODBC driver is that JDBC is developed instead in Java with Gradle over the output as `.jar` file to move into a specific folder.

The driver development environment for JDBC can be reachable in [OpenSearch - JDBC repo](https://github.com/opensearch-project/sql-jdbc), which include the source code, instructions and Gradle files for packaging.

Is possible to sign the connector as described in the [Tableau Connector SDK documentation](https://tableau.github.io/connector-plugin-sdk/docs/package-sign), so that Tableau will load only .taco files that have been signed with a currently valid certificate and also it can be used without disabling the signature check manually.

## Preparation and Test ODBC/JDBC
Is required a slightly different procedure for make the connector working.
    
1. The connector as `.taco` file should be placed in windows `C:\Users\User\Documents\My Tableau Repository\Connectors\`.
    
2. If JDBC the driver as `.jar` file, should be placed in `C:\Program Files\Tableau\Drivers`. If ODBC install the proper version of the driver with `.msi` installer.

3. Run Tableau with this shell command if the connector is not signed yet `.\tableau.exe -DDisableVerifyConnectorPluginSignature=true` otherwise will raise an error at the moment of authentication.



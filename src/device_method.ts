// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

import { RestApiClient } from 'azure-iot-http-base';
import { DeviceMethodParams } from './interfaces';
import { TripleValueCallback, tripleValueCallbackToPromise } from 'azure-iot-common';
import { versionQueryString } from './version';

/**
 * @private
 * @class                  module:azure-iothub.DeviceMethod
 * @classdesc              Constructs a DeviceMethod object that provides APIs to trigger the execution of a device method.
 * @param {Object}         params              An object describing the method and shall have the following properties:
 *                                             - methodName          The name of the method that shall be invoked.
 *                                             - payload             [optional] The payload to use for the method call.
 *                                             - timeoutInSeconds    [optional] The number of seconds IoT Hub shall wait for the device
 *                                                                   to send a response before deeming the method execution a failure.
 * @param {RestApiClient}  restApiClient       The REST client used to execute API calls.
 */
export class DeviceMethod {
  static defaultResponseTimeout: number = 30;
  static defaultConnectTimeout: number = 0;
  static defaultPayload: any = null;

  params: DeviceMethodParams;

  private _client: RestApiClient;

  constructor(params: DeviceMethodParams, restApiClient: RestApiClient) {
    if (!params) throw new ReferenceError('params cannot be \'' + params + '\'');
    /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_004: [The `DeviceMethod` constructor shall throw a `ReferenceError` if `methodName` is `null`, `undefined` or an empty string.]*/
    if (params.methodName === null || params.methodName === undefined || params.methodName === '') throw new ReferenceError('params.methodName cannot be \'' + params.methodName + '\'');
    /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_005: [The `DeviceMethod` constructor shall throw a `TypeError` if `methodName` is not a `string`.]*/
    if (typeof params.methodName !== 'string') throw new TypeError('methodName must be a string');

    this._client = restApiClient;

    this.params = params;
    /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_006: [The `DeviceMethod` constructor shall set the `DeviceMethod.params.responseTimeoutInSeconds` property value to the `responseTimeoutInSeconds` argument value or to the default (`30`) if the `responseTimeoutInSeconds` value is falsy.]*/
    this.params.responseTimeoutInSeconds = this.params.responseTimeoutInSeconds || DeviceMethod.defaultResponseTimeout;

    /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_016: [** The `DeviceMethod` constructor shall set the `DeviceMethod.params.connectTimeoutInSeconds` property value to the `params.connectTimeoutInSeconds` argument value or to the default (`0`) if the `connectTimeoutInSeconds` value is falsy.]*/
    this.params.connectTimeoutInSeconds = this.params.connectTimeoutInSeconds || DeviceMethod.defaultConnectTimeout;

    /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_015: [The `DeviceMethod` constructor shall set the `DeviceMethod.params.payload` property value to the `payload` argument value or to the default (`null`) if the `payload` argument is `null` or `undefined`.]*/
    this.params.payload = (this.params.payload === undefined || this.params.payload === null) ? DeviceMethod.defaultPayload : this.params.payload;
  }

  /**
   * @method            module:azure-iothub.DeviceMethod.invokeOn
   * @description       Invokes the method on the specified device with the specified payload.
   * @param {String}    deviceId    Identifier of the device on which the method will run.
   * @param {Function}  [done]      The optional function to call when the operation is
   *                                complete. done` will be called with three
   *                                arguments: an Error object (can be null), the
   *                                body of the response, and a transport-specific
   *                                response object useful for logging or
   *                                debugging.
   * @returns {Promise<{ device?: any, response?: any }> | void} Promise if no callback function was passed, void otherwise.
   */
  invokeOn(deviceId: string, done: TripleValueCallback<any, any>): void;
  invokeOn(deviceId: string): Promise<{ device?: any; response?: any }>;
  invokeOn(deviceId: string, done?: TripleValueCallback<any, any>): Promise<{ device?: any; response?: any }> | void {
    return tripleValueCallbackToPromise((_callback) => {
      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_008: [The `invokeOn` method shall throw a `ReferenceError` if `deviceId` is `null`, `undefined` or an empty string.]*/
      if (deviceId === null || deviceId === undefined || deviceId === '') throw new ReferenceError('deviceId cannot be \'' + deviceId + '\'');

      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_017: [The `invokeOn` method shall uri-encode the device id.]*/
      const path = '/twins/' + encodeURIComponent(deviceId) + '/methods' + versionQueryString();
      const headers = {
        'Content-Type': 'application/json; charset=utf-8'
      };

      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_011: [The `invokeOn` method shall construct an HTTP request using information supplied by the caller, as follows:
      ```
      POST /twins/<deviceId>/methods?api-version=<version> HTTP/1.1
      Authorization: <config.sharedAccessSignature>
      Content-Type: application/json; charset=utf-8
      Request-Id: <guid>
      {
        "methodName": <DeviceMethod.params.name>,
        "responseTimeoutInSeconds": <DeviceMethod.params.responseTimeoutInSeconds>,
        "connectTimeoutInSeconds": <DeviceMethod.params.connectTimeoutInSeconds>,
        "payload": <DeviceMethod.params.payload>
      }
      ```]*/
      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_009: [The `invokeOn` method shall invoke the `_callback` callback with an standard javascript `Error` object if the method execution failed.]*/
      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_16_010: [The `invokeOn` method shall invoke the `_callback` callback with a `null` first argument, a result second argument and a transport-specific response third argument if the method execution succeed**/
      const totalTimeout = (this.params.responseTimeoutInSeconds + this.params.connectTimeoutInSeconds) * 1000;
      this._client.executeApiCall('POST', path, headers, this.params, totalTimeout, _callback);
    }, (d, r) => {
      return { device: d, response: r };
    }, done);
  }


  /**
   * @method            module:azure-iothub.DeviceMethod.invokeOnModule
   * @description       Invokes the method on the specified module with the specified payload.
   * @param {String}    deviceId    Identifier of the device on which the method will run.
   * @param {String}    moduleId    Identifier of the module on which the method will run.
   * @param {Function}  [done]      The optional function to call when the operation is
   *                                complete. done` will be called with three
   *                                arguments: an Error object (can be null), the
   *                                body of the response, and a transport-specific
   *                                response object useful for logging or
   *                                debugging.
   * @returns {Promise<{ device?: any, response?: any }> | void} Promise if no callback function was passed, void otherwise.
   */
  invokeOnModule(deviceId: string, moduleId: string, done: TripleValueCallback<any, any>): void;
  invokeOnModule(deviceId: string, moduleId: string): Promise<{ device?: any; response?: any }>;
  invokeOnModule(deviceId: string, moduleId: string, done?: TripleValueCallback<any, any>): Promise<{ device?: any; response?: any }> | void {
    return tripleValueCallbackToPromise((_callback) => {
      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_18_001: [The `invokeOnModule` method shall throw a `ReferenceError` if `deviceId` or `moduleId` is falsy. ]*/
      if (!deviceId) throw new ReferenceError('deviceId cannot be \'' + deviceId + '\'');
      if (!moduleId) throw new ReferenceError('moduleId cannot be \'' + moduleId + '\'');

      const path = '/twins/' + encodeURIComponent(deviceId) + '/modules/' + encodeURIComponent(moduleId) + '/methods' + versionQueryString();
      const headers = {
        'Content-Type': 'application/json; charset=utf-8'
      };

      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_18_002: [The `invokeOnModule` method shall construct an HTTP request using information supplied by the caller, as follows:
      ```
      POST /twins/<encodeUriComponent(deviceId)>/modules/<encodeUriComponent(moduleId)>/methods?api-version=<version> HTTP/1.1
      Authorization: <config.sharedAccessSignature>
      Content-Type: application/json; charset=utf-8
      Request-Id: <guid>
      {
        "methodName": <DeviceMethod.params.name>,
        "responseTimeoutInSeconds": <DeviceMethod.params.responseTimeoutInSeconds>,
        "connectTimeoutInSeconds": <DeviceMethod.params.connectTimeoutInSeconds>,
        "payload": <DeviceMethod.params.payload>
      }
      ```
      ]*/

      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_18_003: [The `invokeOnModule` method shall invoke the `_callback` callback with an standard javascript `Error` object if the method execution failed. ]*/
      /*Codes_SRS_NODE_IOTHUB_DEVICE_METHOD_18_004: [The `invokeOnModule` method shall invoke the `_callback` callback with a `null` first argument, a result second argument and a transport-specific response third argument if the method execution succeeds. ]*/
      const totalTimeout = (this.params.responseTimeoutInSeconds + this.params.connectTimeoutInSeconds) * 1000;
      this._client.executeApiCall('POST', path, headers, this.params, totalTimeout, _callback);
    }, (d, r) => {
      return { device: d, response: r };
    }, done);
  }
}

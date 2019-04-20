/* global org */
const application = require('application');
const applicationModule = require('tns-core-modules/application');

const { NSSerialport } = org.nativescript.b360124.nsserialport;

module.exports = class {
  constructor() {
    this.intentFilters = {
      DEVICE_ATTACHED: 'android.hardware.usb.action.USB_DEVICE_ATTACHED',
      DEVICE_DETACHED: 'android.hardware.usb.action.USB_DEVICE_DETACHED',
      DEVICE_PERMISSION: 'com.android.example.USB_PERMISSION',
      DEVICE_NOT_FOUND: NSSerialport.DEVICE_NOT_FOUND,
      DEVICE_PERMISSION_GRANTED: NSSerialport.DEVICE_PERMISSION_GRANTED,
      DEVICE_PERMISSION_NOT_GRANTED: NSSerialport.DEVICE_PERMISSION_NOT_GRANTED,
      DEVICE_CONNECT: NSSerialport.DEVICE_CONNECT,
      DEVICE_DISCONNECTED: NSSerialport.DEVICE_DISCONNECTED,
      DEVICE_NOT_OPENED: NSSerialport.DEVICE_NOT_OPENED,
      DEVICE_NOT_SUPPORTED: NSSerialport.DEVICE_NOT_SUPPORTED,
      DEVICE_READ_DATA: NSSerialport.DEVICE_READ_DATA
    };

    this._receivers = [];
    this._onReceiver = {};

    const { context } = application.android;
    this._registerReceivers();
    this._nsSerialport = new NSSerialport(context);
  }

  _registerReceivers() {
    Object.values(this.intentFilters).forEach((intentFilter) => {
      const onReceiveCallback = (context, intent) => {
        const callback = this._onReceiver[intentFilter];
        if (typeof callback === 'function') callback(context, intent);
      };

      const receiver = applicationModule.android.registerBroadcastReceiver(
        intentFilter,
        onReceiveCallback
      );

      this._receivers.push(receiver);
    });
  }

  _unregisterReceiver() {
    this._receivers.forEach((receiver) => {
      applicationModule.android.unregisterBroadcastReceiver(receiver);
    });
  }

  on(event, func) {
    this._onReceiver[event] = func;
  }

  getDeviceList() {
    const deviceListJava = this._nsSerialport.getDeviceList();
    const deviceList = [];
    const count = deviceListJava.size();

    for (let i = 0; i < count; ++i) {
      const device = deviceListJava.get(i);
      const vendorId = device.getVendorId().toString(16);
      const productId = device.getProductId().toString(16);
      deviceList.push({ vendorId, productId, device });
    }

    return deviceList;
  }

  connect({ vendorId, productId, autoConncect = false }) {
    this._nsSerialport.setVendorId(vendorId);
    this._nsSerialport.setProductId(productId);
    this._nsSerialport.setAutoConnect(autoConncect);
    this._nsSerialport.connect();
  }

  destroy() {
    this._nsSerialport.disconnect();
    this._unregisterReceiver();
    this._nsSerialport = null;
  }

  writeString(text) {
    this._nsSerialport.writeString(text);
  }

  static bytesToString(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; ++i) {
      result += String.fromCharCode(bytes[i]);
    }

    return result;
  }
};

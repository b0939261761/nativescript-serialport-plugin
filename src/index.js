/* global org */
const application = require('application');
const applicationModule = require('tns-core-modules/application');

const { NSSerialport } = org.nativescript.b360124.nsserialport;

//----------------------------------------------------
const intentFilterList = {
  ACTION_USB_PERMISSION_GRANTED: NSSerialport.ACTION_USB_PERMISSION_GRANTED,
  ACTION_USB_PERMISSION_NOT_GRANTED: NSSerialport.ACTION_USB_PERMISSION_NOT_GRANTED,
  ACTION_USB_CONNECT: NSSerialport.ACTION_USB_CONNECT,
  ACTION_USB_DISCONNECTED: NSSerialport.ACTION_USB_DISCONNECTED,
  ACTION_USB_NOT_SUPPORTED: NSSerialport.ACTION_USB_NOT_SUPPORTED,
  ACTION_USB_NOT_OPENED: NSSerialport.ACTION_USB_NOT_OPENED,
  ON_READ_DATA_FROM_PORT: NSSerialport.ON_READ_DATA_FROM_PORT
};

const receivers = [];
const onReceiver = {};

const registerReceivers = () => {
  Object.values(intentFilterList).forEach((intentFilter) => {
    const onReceiveCallback = (context, intent) => {
      const callback = onReceiver[intentFilter];
      if (typeof callback === 'function') callback(context, intent);
    };

    const receiver = applicationModule.android.registerBroadcastReceiver(
      intentFilter,
      onReceiveCallback
    );

    receivers.push(receiver);
  });
};

const unregisterReceiver = () => {
  receivers.forEach((receiver) => {
    applicationModule.android.unregisterBroadcastReceiver(receiver);
  });
};

const on = (event, func) => {
  onReceiver[event] = func;
};

//----------------------------------------------------

let nsSerialport;

const getDeviceList = () => {
  const deviceListJava = nsSerialport.getDeviceList();
  const deviceList = [];
  const count = deviceListJava.size();

  for (let i = 0; i < count; ++i) {
    const device = deviceListJava.get(i);
    const vendorId = device.getVendorId().toString(16);
    const productId = device.getProductId().toString(16);
    deviceList.push({ vendorId, productId, device });
  }

  return deviceList;
};

//-------------------------------------------------------
const create = () => {
  const { context } = application.android;
  registerReceivers();
  nsSerialport = new NSSerialport(context);
  return nsSerialport;
};

const setCurrentDevice = (vendorId, productId) => {
  nsSerialport.setCurrentDevice(vendorId, productId);
};

const connect = () => {
  nsSerialport.connect();
};

const getInstance = () => nsSerialport;

const destroy = () => {
  nsSerialport.disconnect();
  unregisterReceiver();
  nsSerialport = null;
};

const writeString = (text) => {
  nsSerialport.writeString(text);
};

module.exports = {
  create,
  setCurrentDevice,
  connect,
  getInstance,
  destroy,
  writeString,
  on,
  getDeviceList
};

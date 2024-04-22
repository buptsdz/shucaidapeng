const deviceConfigs = {
	productKey: "k0wn5IfGa5O",
	deviceName: "app_dev",
	deviceSecret: "3d457bce939f51a12d8fcd379c6c01c0",
	regionId: "cn-shanghai"
}

//获取处理后的配置信息，
//调用该方法可以获取 url,options,deviceInfo
export function getConfigInfo() {
	const options = initMqttOptions(deviceConfigs);
	return {
		deviceConfig: deviceConfigs,
		url: 'wxs://' + deviceConfigs.productKey + '.iot-as-mqtt.' + deviceConfigs.regionId + '.aliyuncs.com',
		options: options
	}
}

//IoT平台mqtt连接参数初始化
function initMqttOptions(deviceConfig) {
	const params = {
		productKey: deviceConfig.productKey,
		deviceName: deviceConfig.deviceName,
		timestamp: Date.now(),
		clientId: Math.random().toString(36).substr(2),
	}
	//CONNECT参数
	const options = {
		keepalive: 60, //60s
		clean: true, //cleanSession不保持持久会话
		protocolVersion: 4 //MQTT v3.1.1
	}

	return options;
}

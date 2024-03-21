<template>
	<view>
		<view class="content">
			<text class="label-text">开关：</text>
			<switch @change="cli()"></switch>
			<text class="label-text">发送：</text>
			<button @tap="cli2()">click</button>
		</view>
	</view>
</template>

<script>
	const iot = require('../../config/alibabacloud-iot-device-sdk.js');
	// 设备证书信息。
	const productKey = 'k0wn5IfGa5O';
	const deviceName = 'app_dev';
	const deviceSecret = '3d457bce939f51a12d8fcd379c6c01c0';
	// 新版公共实例和企业版实例，必须填写实例ID，旧版公实例无需填写。
	const instanceId = 'iot-06z00dy7tlgz70q';
	// 当前产品和设备所属地域的ID。
	const regionId = 'cn-shanghai';
	const brokerUrl = instanceId ?
		`wss://${instanceId}.mqtt.iothub.aliyuncs.com:443` :
		`wss://${productKey}.iot-as-mqtt.${regionId}.aliyuncs.com:443`;
	const device = iot.device({
		productKey: `${productKey}`,
		deviceName: `${deviceName}`,
		deviceSecret: `${deviceSecret}`,
		brokerUrl: `wss://${productKey}.iot-as-mqtt.${regionId}.aliyuncs.com:443`,
		regionId: `${regionId}`
	});
	export default {
		data() {
			return {
				client: null,
				switch:false,
			}
		},
		onLoad() {

		},
		onShow() {},
		methods: {
			cli() {
				if (this.switch==false) {
					this.switch=true;
					console.log('开启连接');
					this.get();
				} else {
					this.switch=false;
					this.close();
				}
			},
			cli2() {
				var payload = {
					"params": "我是sdz"
				};
				device.publish(`/k0wn5IfGa5O/app_dev/user/update`, 'hello world!');
				device.on('message', (topic, payload) => {
					console.log(topic, payload.toString());
				});
				// 监听error事件。
				device.on('error', (error) => {
					console.error(error);
				});
			},
			get() {
				// 监听connect事件：建立MQTT连接，订阅自定义Topic，通过自定义Topic向物联网平台发送消息。
				device.on('connect', () => {
					device.subscribe(`/k0wn5IfGa5O/app_dev/user/get`); //shou
					console.log('连接监听中')
				});
			},
			close() {
				device.end();
				console.log('连接关闭')
			},
		}
	}
</script>

<style>

</style>
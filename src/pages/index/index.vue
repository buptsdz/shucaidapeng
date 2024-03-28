<template>
	<view class="content">
		<view class="switch">
			<text class="label-text">开关：</text>
			<switch @tap="cli()"></switch>
		</view>
		<view class="connect">
			连接状态：
			<view :class="['label', labelClass]">
				{{ labelText }}
			</view>
		</view>
		<view class="send">
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
				switch: false,
				state: false, //可变状态
				statecheck: 0, //防抖后状态
				timeoutId: null // 用于存储setTimeout返回的ID
			}
		},
		computed: {
			labelClass() {
				// 根据statecheck的值返回对应的类名
				switch (this.statecheck) {
					case 0:
						return 'bad'; // 断开
					case 1:
						return 'good'; // 良好
					case 2:
						return 'neutral'; // 网络差
					default:
						return '';
				}
			},
			labelText() {
				// 根据statecheck的值返回对应的文本
				switch (this.statecheck) {
					case 0:
						return '断开';
					case 1:
						return '良好';
					case 2:
						return '网络缓冲'; // 或者任何你想表示的中性状态的文本
					default:
						return '';
				}
			}
		},
		onLoad() {
			device.on('offline', () => {
				console.log("断开连接");
				this.state = false;
			});
		},
		unonLoad() {
			device.end();
		},
		watch: {
			// 监听state的变化
			state(newVal, oldVal) {
				console.log("state:", this.state)
				if (newVal !== oldVal) {
					// 如果state变化，先清除之前的倒计时（如果有）
					if (this.timeoutId !== null) {
						clearTimeout(this.timeoutId);
					}
					// 开启一个新的倒计时
					if (this.switch == true) {
						this.timeoutId = setTimeout(() => {
							// 倒计时结束后的操作
							if(newVal==0){
								this.statecheck = 2;
							}
							if(newVal==1){
								this.statecheck = 1;
							}
							console.log("statecheck:", this.statecheck)
						}, 5000); // 假设倒计时时长为3000毫秒（3秒）
					}
				}
			}
		},
		methods: {
			cli() {
				if (this.switch == false) {
					this.switch = true;
					console.log('开启连接');
					this.gettt();
				} else {
					this.switch = false;
					this.closeee();
				}
			},
			cli2() {
				if (this.statecheck == 1) {
					var payload = {
						"params": "我是sdz"
					};
					let mes = 'hello world!'
					device.publish(`/k0wn5IfGa5O/app_dev/thing/event/property/post`, mes, (res) => {
						console.log("发送消息：", mes)
					});
					device.on('error', (error) => {
						console.error(error);
					});
				} else if (this.statecheck == 2) {
					uni.showToast({
						title: "网络缓冲，请稍候",
						icon: 'none',
						duration: 2000
					})
				} else {
					uni.showToast({
						title: "您尚未连接",
						icon: 'none',
						duration: 2000
					})
				}

			},
			gettt() {
				// 监听connect事件：建立MQTT连接，订阅自定义Topic，通过自定义Topic向物联网平台发送消息。
				uni.showLoading({
					title: "连接中",
					mask: true,
				})
				let num = 0
				device.on('connect', (res) => {
					//device.subscribe(`/k0wn5IfGa5O/app_dev/user/get`, () => {}); //shou
					num++;
					if (num == 1) {
						uni.hideLoading();
						uni.showToast({
							title: "已开启连接",
							duration: 2500,
						})
					}
					console.log('连接监听中')
					if(this.switch==true){
						this.state = true;
						this.statecheck = 1;
					}
					console.log("statecheck:", this.statecheck)
				});
				device.on('message', (message) => {
					console.log('接收信息：', message);
				});
			},
			closeee() {
				this.state = false;
				this.statecheck = 0;
				console.log('连接关闭，device:', device)
			},
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
	}

	.content .switch {}

	.content .send {}

	.connect {
		display: flex;
		flex-direction: row;
	}

	.good {
		color: green;
	}

	.bad {
		color: red;
	}

	.neutral {
		color: grey;
	}
</style>
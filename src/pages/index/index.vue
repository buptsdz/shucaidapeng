<template>
	<view class="content">
		<view class="switch">
			<text class="label-text">开关：</text>
			<switch @tap="cli()" :checked="this.switch"></switch>
		
		</view>
		<view class="connect">
			连接状态：
			<view :class="['label', labelClass]">
				{{ labelText }}
			</view>
		</view>
		<view class="send">
			<text class="label-text">发送：</text>
			<button @tap="cli2()">发送浇水信息</button>
		</view>
		<view class="dapeng-data">
			<view class="temp">
				大棚温度：{{ tempFormatted }}
			</view>
			<view class="soilwet">
				土壤湿度：{{ soilHumidityFormatted }}
			</view>
			<view class="wet">
				大棚湿度：{{ airHumidityFormatted }}
			</view>
			<view class="light">
				光照强度：{{ lightFormatted }}
			</view>
			<view class="lasttime">
				数据更新时间：{{this.lasttime}}
			</view>
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
				switch: false, //开关状态
				state: false, //连接状态
				timeoutId: null, // 用于存储setTimeout返回的ID
				light: '', //光照强度
				soilHumidity: '', //土壤湿度
				airHumidity: '', //空气湿度
				temp: '', //温度
				time: null,//接收到的esp8266的时间
				publishwater:false,//是否正在发送浇水指令
			}
		},
		computed: {
			//最后一次更新时间
			lasttime() {
				if (this.time == null) {
					return null
				} else {
					const timestamp = this.time;
					// 创建 Date 对象，将时间戳传递给构造函数
					const date = new Date(timestamp);
					// 使用 Date 对象的方法获取年、月、日、时、分、秒等信息
					const year = date.getFullYear();
					const month = date.getMonth() + 1; // 月份从 0 开始，需要加 1
					const day = date.getDate();
					const hours = date.getHours();
					const minutes = date.getMinutes();
					const seconds = date.getSeconds();

					// 构造时间字符串，格式为 yyyy-MM-dd HH:mm:ss
					const formattedTime =
						`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
					return formattedTime; // 输出格式化后的时间字符串
				}
			},
			tempFormatted() {
				return this.temp ? `${this.temp.toFixed(2)}℃` : '暂无数据';
			},
			soilHumidityFormatted() {
				return this.soilHumidity ? this.soilHumidity.toFixed(2) : '暂无数据';
			},
			airHumidityFormatted() {
				return this.airHumidity ? this.airHumidity.toFixed(2) : '暂无数据';
			},
			lightFormatted() {
				return this.light ? this.light.toFixed(2) : '暂无数据';
			},
			labelClass() {
				// 根据statecheck的值返回对应的类名
				switch (this.state) {
					case false:
						return 'bad'; // 断开
					case true:
						return 'good'; // 良好
				}
				return 0
			},
			labelText() {
				// 根据statecheck的值返回对应的文本
				switch (this.state) {
					case false:
						return '断开';
					case true:
						return '良好';
				}
				return 0
			}
		},
		onLoad() {
			device.on('connect', () => {
				console.log('connect successfully!');
			});
			device.on('offline', () => {
				console.log("断开连接");
			});
			device.on('error', (error) => {
				console.error(error);
			});
			device.onProps((cmd) => {
				console.log('>>>onProps', cmd); // 打印完整的属性设置消息
				if (this.state) {
					for (var key in cmd.items) {
						switch (key) {
							case 'Light':
								this.light = cmd.items[key].value;
								break;
							case 'Soil':
								this.soilHumidity = cmd.items[key].value;
								break;
							case 'Humidity':
								this.airHumidity = cmd.items[key].value;
								break;
							case 'temperature':
								this.temp = cmd.items[key].value;
								break;
							default:
								// 如果有其他属性，可以在这里处理
								break;
						}
					}
					this.time = cmd.items['Light'].time; //从 ESP8266 设备采集的时间戳
				}
			});
		},
		unonLoad() {
			device.end();
		},
		watch: {},
		methods: {
			cli() {
				if (this.switch == false) {
					this.switch = true;
					this.gettt();
				} else {
					this.switch = false;
					this.closeee();
				}
			},
			cli2() {
				if (this.state == true) {
					//上报设备属性 post
					let mes = `{"params": {"led": 1}}`
					device.publish(`/sys/k0wn5IfGa5O/app_dev/thing/event/property/post`, mes, (res) => {
						console.log("发送消息：", mes)
						uni.showToast({
							title: "已发送浇水消息",
							icon: 'success',
							duration: 2000
						})
					});
					// 上报设备属性 物模型
					// device.postProps({
					// 	led: 0
					// }, (res) => {
					// 	console.log("发送消息：", res);
					// });
				} else {
					uni.showToast({
						title: "您尚未连接",
						icon: 'none',
						duration: 2000
					})
				}
			},
			gettt() {
				this.state = true;
				uni.showToast({
					title: "已开启连接",
					duration: 2500,
				})
				device.on('message', (message) => {
					console.log('接收信息：', message);
				});
			},
			closeee() {
				this.state = false;
				uni.showToast({
					title: "连接关闭",
					duration: 2500,
					icon: "none"
				})
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

	.content .switch {
		font-size: 18px;
	}

	.content .send {}

	.connect {
		display: flex;
		flex-direction: row;
	}

	.good {
		color: limegreen;
	}

	.bad {
		color: red;
	}

	.neutral {
		color: grey;
	}

	.dapeng-data {
		display: flex;
		flex-direction: column;
	}
</style>
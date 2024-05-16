<template>
	<view class="content">
		<!-- 页面标题 -->
		<view class="page-title">
			<text>智能温室监控系统</text>
		</view>
		
		<!-- 开关、连接状态、发送浇水信息 -->
		<view class="control-card">
			<view class="control-item">
				<text class="control-label">开关：</text>
				<switch class="control-switch" @change="cli" :checked="switchState" />
			</view>
			<view class="control-item">
				<text class="control-label">连接状态：</text>
				<text :class="['control-value', connectionStatusClass]">{{ connectionStatusLabel }}</text>
			</view>
			<view class="control-item">
				<button class="control-button" @click="cli2">发送浇水信息</button>
			</view>
		</view>
		
		<!-- 大棚温度、大棚湿度、土壤湿度、光照强度 -->
		<view class="data-cards">
			<view class="data-row">
				<view class="data-card">
					<text class="data-label">大棚温度</text>
					<text class="data-value">{{ tempFormatted }}℃</text>
				</view>
				<view class="data-card">
					<text class="data-label">大棚湿度</text>
					<text class="data-value">{{ airHumidityFormatted }}%</text>
				</view>
			</view>
			<view class="data-row">
				<view class="data-card">
					<text class="data-label">土壤湿度</text>
					<text class="data-value">{{ soilHumidityFormatted }}%</text>
				</view>
				<view class="data-card">
					<text class="data-label">光照强度</text>
					<text class="data-value">{{ lightFormatted }} lx</text>
				</view>
			</view>
		</view>
		
		<!-- 数据更新时间 -->
		<view class="update-time-card">
			<view class="update-time">
				<text class="data-label">数据更新时间：</text>
				<text class="data-value">{{ lastUpdateTime }}</text>
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
	// #ifdef H5
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
	//#endif
	// #ifdef APP-PLUS
	const brokerUrl = instanceId ?
		`wxs://${instanceId}.mqtt.iothub.aliyuncs.com:443` :
		`wxs://${productKey}.iot-as-mqtt.${regionId}.aliyuncs.com:443`;
	const device = iot.device({
		productKey: `${productKey}`,
		deviceName: `${deviceName}`,
		deviceSecret: `${deviceSecret}`,
		brokerUrl: `wxs://${productKey}.iot-as-mqtt.${regionId}.aliyuncs.com:443`,
		regionId: `${regionId}`
	});
	//#endif
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
				time: null, //接收到的esp8266的时间
				publishwater: false, //是否正在发送浇水指令
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
			openServer() {
				if (this.switch == false) {
					this.switch = true;
					this.gettt();
				} else {
					this.switch = false;
					this.closeee();
				}
			},
			sendMess() {
				if (this.state == true) {
					//上报设备属性 post
					// let mes = `{"params": {"led":1}}`
					// device.publish(`/sys/k0wn5IfGa5O/app_dev/thing/event/property/post`, mes, (res) => {
					// 	console.log("发送消息：", mes)
					// 	uni.showToast({
					// 		title: "已发送浇水消息",
					// 		icon: 'success',
					// 		duration: 2000
					// 	})
					// });
					device.subscribe(`/k0wn5IfGa5O/app_dev/user/get`, (res) => {
						console.log("获取数据", res)
						uni.showToast({
							title: "已获取最新数据",
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
				device.on('message', (res) => {
					console.log('接收信息url', res);
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
	  align-items: center;
	  padding: 20px;
	  background-color: #f8f9fa; /* 更柔和的背景色 */
	}
	
	.page-title {
	  font-size: 24px;
	  font-weight: bold;
	  color: #28a745; /* 更鲜明的标题颜色 */
	  text-align: center;
	  margin-bottom: 30px;
	}
	
	.control-card {
	  display: flex;
	  flex-wrap: wrap;
	  justify-content: center;
	  width: 100%;
	  margin-bottom: 30px;
	}
	
	.control-item {
	  display: flex;
	  align-items: center;
	  margin-bottom: 10px;
	}
	
	.control-label {
	  font-size: 16px;
	  font-weight: bold;
	  color: #333333;
	  margin-right: 10px;
	}
	
	.control-value {
	  font-size: 18px;
	  color: #555555;
	}
	
	.control-switch {
	  transform: scale(0.8);
	}
	
	.control-button {
	  background-color: #007bff;
	  color: #ffffff;
	  border: none;
	  border-radius: 8px;
	  padding: 10px 20px;
	  font-size: 16px;
	  font-weight: bold;
	  text-align: center;
	  text-decoration: none;
	  display: inline-block;
	  margin: 4px 2px;
	  cursor: pointer;
	  transition: background-color 0.3s ease; /* 按钮悬浮动画 */
	}
	
	.control-button:hover {
	  background-color: #0056b3;
	}
	
	.data-cards {
	  display: flex;
	  flex-wrap: wrap;
	  justify-content: space-between;
	  width: 100%;
	  margin-bottom: 30px;
	}
	
	.data-row {
	  display: flex;
	  justify-content: space-between;
	  width: 100%;
	  margin-bottom: 20px;
	}
	
	.data-card {
	 display: flex;
	 flex-direction: column;
	 align-items: center;
	 margin: 20px;
	 padding: 20px;
	 background-color: #ffffff;
	 box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* 更深的阴影效果 */
	 border-radius: 10px;
	 width: 30%;
	 transition: transform 0.3s ease; /* 卡片悬浮动画 */
	}
	
	.data-card:hover {
	  transform: translateY(-5px); /* 卡片悬浮动画 */
	}
	
	.data-label {
	  font-size: 18px;
	  font-weight: bold;
	  margin-bottom: 10px;
	  color: #6c757d; /* 更深的文字颜色 */
	}
	
	.data-value {
	  font-size: 15px;
	  font-weight: normal;
	  color: #28a745; /* 更鲜明的数据颜色 */
	}
	
	.update-time-card {
	  width: 100%;
	  margin-top: 20px; /* Add some space above the update time card */
	}
	
	.update-time {
	  display: flex;
	  justify-content: space-between;
	  width: 100%;
	}
	
	@media (max-width: 768px) {
	  .data-card {
	    width: 100%;
	    margin-bottom: 10px;
	  }
	}
</style>
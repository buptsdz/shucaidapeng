<!-- <template>
	<div id="container">
		<input v-model="message">
		<button @click="hello">发送信息</button>
		<label for="showtext">接收消息</label>
		<textarea id="showtext" v-text="receiveMsg"></textarea>
	</div>
</template>

<script>
	var ConfigInfo = require("../../config/ConnectAliYunUtils.js");
	var mqtt = require('../../config/alibabacloud-iot-device-sdk.js');
	export default {
		created: function() {
			console.log("created");
			var info = ConfigInfo.getConfigInfo();
			this.url = info.url;
			this.options = info.options;
			this.deviceInfo = info.deviceConfig;
			this.topic = {
				publishTopic: '/k0wn5IfGa5O/app_dev/thing/event/property/post',
				receiveTopic: '/' + this.deviceInfo.productKey + '/' + this.deviceInfo.deviceName + '/user/get'
			}
			var client = mqtt.mqtt.connect(this.url, this.options),
				receiveMsg;
			receiveMsg = this.receiveMsg
			client.on('connect', () => {
				this.receiveMsg += "连接服务器成功\n";
				client.subscribe(this.topic.receiveTopic, function(err) {
					if (!err) {
						console.log('订阅主题成功');
						receiveMsg += "订阅主题成功\n";
					} else {
						console.log("订阅主题失败\n" + err);
						receiveMsg += "订阅主题失败\n";
					}
				})
			})
			client.on('message', (topic, payload) => {
				this.receiveMsg += "message:\n" + "payload:" + payload + '\n';
			})
			this.client = client;
		},
		data() {
			return {
				// message:'{\n' +
				//   '  "id": "123",\n' +
				//   '  "version": "1.0",\n' +
				//   '  "params": {\n' +
				//   '    "LightSwitch": {\n' +
				//   '      "value": 1,\n' +
				//   '      "time": 1524448722000\n' +
				//   '    },\n' +
				//   '    "CurrentTemperature": {\n' +
				//   '      "value": 38.6,\n' +
				//   '      "time": 1524448722000\n' +
				//   '    }\n' +
				//   '  },\n' +
				//   '  "method": "thing.event.property.post"\n' +
				//   '}',
				receiveMsg: ' ',
				client: {},
				url: '',
				options: '',
				deviceInfo: '',
				topic: {
					publishTopic: '',
					receiveTopic: ''
				}
			}
		},
		methods: {
			hello() {
				var client = this.client,
					messageConsole;
				messageConsole = this.receiveMsg
				if (!client.connected) {
					client.connect(this.url, this.options);
					this.receiveMsg += '连接服务器中\n'
				} else {
					client.publish(this.topic.publishTopic, this.message, function(error) {
						if (!error) {
							console.log('发布成功')
							messageConsole += '发布成功\n'
						}
					});
				}
			}
		}
	}
</script>

<style lang="scss">
	input {
		height: 80rpx;
		width: 100%;
		padding-left: 10rpx;
		border: 1rpx solid green;
		font-size: 50rpx;
	}
	
	button {
		background: coral;
		color: white;
	}

	textarea {
		border: 1rpx solid green;
		width: 100%;
		height: 200rpx;
		padding: 10rpx;
		font-size: 50rpx;
	}
</style> -->
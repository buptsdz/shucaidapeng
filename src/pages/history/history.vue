<template>
	<view class="container">
		<view class="header">
			<text class="title">{{ title }}</text>
		</view>
		<view class="content" v-if="historicalData.length > 0">
			<scroll-view scroll-y="true" class="scroll-view">
				<view class="item" v-for="(item, index) in historicalData" :key="index">
					<text class="nowrap">
						{{ formatTimestamp(item.timestamp) }}:&nbsp;&nbsp;&nbsp;{{ item.value }}{{ danwei }}</text>
				</view>
			</scroll-view>
		</view>
		<view class="content" style="font-size: 18px;text-align: center;" v-else>
			<text>暂无历史数据</text>
		</view>
		<view style="display: flex;justify-content: center;align-items: center;">
			<button v-if="!loading" @click="updateData">刷新数据</button>
			<image v-show="loading" :src="loadingsrc" class="updatehistory">
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				type: '', // 数据类型，例如temperature, soilHumidity, airHumidity, light
				title: '', // 页面标题
				historicalData: [], // 历史数据列表
				danwei: '', //单位
				id: '',
				loadingsrc: "../../static/loading.png",
				loading: false, //是否刷新
			}
		},
		onLoad(options) {
			// 获取页面传递的参数
			if (options.type) {
				this.type = options.type;
				this.id = options.id;
				this.title = this.getTitle(this.type);
				this.danwei = this.getUnit(this.type);
				console.log(options);
				// 从缓存中获取历史数据
				uni.getStorage({
					key: 'historicalData',
					success: (res) => {
						const cachedData = res.data || [];
						const specificData = cachedData.find(item => item.id == this.id);
						console.log("specificData:", specificData)
						if (res.data) {
							this.historicalData = specificData.data[this.type];
						} else {
							console.log(`没有找到类型为 ${this.type} 的历史数据`);
						}
					},
					fail: (err) => {
						console.error(`读取缓存失败：${err}`);
					}
				});
			} else {
				console.error('未传递历史数据类型');
			}
		},
		onPullDownRefresh() {
			setTimeout(() => {
				//结束下拉刷新
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			//更新数据
			updateData() {
				this.loading = true;
				console.log("播放加载动画")
				setTimeout(() => {
					// uni.navigateBack({ // 返回上一页
					// 	delta: 1,
					// 	success: () => {
					// 		prevPage.$vm. // 调用上一页的方法,传参
					// 	}
					// })
					this.loading = false;
				}, 2000);
			},
			getTitle(type) {
				switch (type) {
					case 'temperature':
						return '温度历史数据';
					case 'soilHumidity':
						return '土壤湿度历史数据';
					case 'airHumidity':
						return '空气湿度历史数据';
					case 'light':
						return '光照历史数据';
					default:
						return '历史数据';
				}
			},
			getUnit(type) {
				switch (type) {
					case 'temperature':
						return '℃';
					case 'soilHumidity':
					case 'airHumidity':
						return '%';
					case 'light':
						return 'lx';
					default:
						return '';
				}
			},
			formatTimestamp(timestamp) {
				const date = new Date(timestamp);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				const seconds = date.getSeconds().toString().padStart(2, '0');
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			}
		}
	}
</script>

<style>
	.updatehistory {
		width: 25px;
		height: 25px;
		animation: loading 2s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	@keyframes loading {
		to {
			transform: rotate(-360deg);
		}
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.header {
		background-color: #f8f8f8;
		padding: 20rpx;
		text-align: center;
	}

	.title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.content {
		flex: 1;
		padding: 20rpx;
	}

	.scroll-view {
		height: 100%;
	}

	.item {
		margin-bottom: 20rpx;
		padding: 20rpx;
		background-color: #ffffff;
		border-radius: 10rpx;
		box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
	}

	.item .nowrap {
		white-space: nowrap;
	}
</style>
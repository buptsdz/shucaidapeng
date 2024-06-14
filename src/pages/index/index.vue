<template>
	<view>
		<view class="mynode-title">
			我的节点
		</view>
		<view class="mynode-content">
			<view v-if="this.nodes.length === 0" style="padding-bottom: 7px;">
				暂无节点
			</view>
			<view v-else>
				<view>(点击查看节点详情)</view>
				<view class="node-item" v-for="(node, index) in nodes" :key="index" @click="navigateToNode(node)">
					节点{{ index + 1 }}: {{ node.name }}
				</view>
			</view>
			<view class="add-node-button" @click="handleAddNode">
				添加节点
			</view>
			<view class="delete-node-button" @click="handleDeleteNode">
				删除节点
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				nodes: [],
			}
		},
		onShow() {
			const loggedInUser = uni.getStorageSync('loggedInUser');
			console.log("loggedInUser:", loggedInUser)
			if (loggedInUser.nodes.length > 0) {
				this.nodes = loggedInUser.nodes;
			} else {
				this.nodes = [];
			}
		},
		onPullDownRefresh() {
			const loggedInUser = uni.getStorageSync('loggedInUser');
			console.log("loggedInUser:", loggedInUser)
			if (loggedInUser.nodes.length > 0) {
				this.nodes = loggedInUser.nodes;
			} else {
				this.nodes = [];
			}
			setTimeout(() => {
				//结束下拉刷新
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			navigateToNode(node) {
				// 将对象转换为 JSON 字符串并进行 URL 编码
				const nodeStr = encodeURIComponent(JSON.stringify(node));
				console.log("当前节点对象：", nodeStr);
				uni.navigateTo({
					url: `/pages/nodes/nodes?node=${nodeStr}`
				});
			},
			handleAddNode() {
				// 获取当前用户
				const user = uni.getStorageSync('loggedInUser');
				if (user) {
					uni.showModal({
						placeholderText: "请输入DeviceSecret",
						title: '请输入设备id',
						editable: true,
						content: '',
						cancelText: "取消",
						confirmText: "确认",
						showCancel: true,
						confirmColor: '#39B54A',
						cancelColor: '#f55850',
						success: (res) => {
							if (res.confirm) {
								const deviceSecrets = {
									"7460ded8354a45ff60a8c8d5a1552df8": "esp8266_dev2",
									"e5e3e19e6dc724144b5bf1551ada329c": "esp8266_dev"
								};

								const newSecret = res.content;
								if (deviceSecrets[newSecret]) {
									const isAlreadyAdded = user.nodes.some(node => node.id === newSecret);

									if (isAlreadyAdded) {
										uni.showToast({
											title: '该设备已存在!',
											icon: "none",
											duration: 2000
										});
									} else {
										const newNode = {
											id: newSecret,
											name: deviceSecrets[newSecret]
										};
										user.nodes.push(newNode);
										const users = uni.getStorageSync('users') || [];
										const index = users.findIndex(u => u.username === user.username);
										if (index !== -1) {
											users[index] = user;
											uni.setStorageSync('users', users);
											uni.setStorageSync('loggedInUser', user);
											this.nodes = user.nodes;
										}
										uni.showToast({
											title: '添加成功',
											duration: 2200
										});
										console.log("after add users:", uni.getStorageSync("users"));
									}
								} else {
									uni.showToast({
										title: '请输入正确的设备密钥',
										icon: "none",
										duration: 2000
									});
								}
							} else {
								console.log('cancel');
							}
						}
					});
				} else {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
				}
			},
			handleDeleteNode() {
				uni.showModal({
					placeholderText: "请输入节点序号",
					title: '删除节点',
					editable: true,
					content: '',
					cancelText: "取消",
					confirmText: "确认",
					showCancel: true,
					confirmColor: '#39B54A',
					cancelColor: '#f55850',
					success: (res) => {
						if (res.confirm) {
							const nodeIndex = parseInt(res.content) - 1;
							if (!isNaN(nodeIndex) && nodeIndex >= 0 && nodeIndex < this.nodes.length) {
								const nodeName = this.nodes[nodeIndex].name;
								uni.showModal({
									title: '确认删除',
									content: `确认删除节点${nodeName}吗？`,
									cancelText: "取消",
									confirmText: "确认",
									showCancel: true,
									confirmColor: '#39B54A',
									cancelColor: '#f55850',
									success: (confirmRes) => {
										if (confirmRes.confirm) {
											this.nodes.splice(nodeIndex, 1);
											const user = uni.getStorageSync('loggedInUser');
											if (user) {
												user.nodes = this.nodes;
												const users = uni.getStorageSync('users') || [];
												const index = users.findIndex(u => u.username ===
													user.username);
												if (index !== -1) {
													users[index] = user;
													uni.setStorageSync('users', users);
													uni.setStorageSync('loggedInUser', user);
												}
												uni.showToast({
													title: '删除成功',
													duration: 2200
												});
												console.log("after delete users:", uni
													.getStorageSync("users"))
											}
										} else {
											console.log('用户取消');
											console.log("after delete users:", uni.getStorageSync(
												"users"))
										}
									}
								});
							} else {
								uni.showToast({
									title: '节点序号无效',
									icon: "none"
								});
							}
						} else {
							console.log('cancel');
						}
					}
				});
			}
		}
	}
</script>

<style>
	.mynode-title {
		font-size: 25px;
		text-align: center;
		margin-bottom: 10px;
	}

	.mynode-content {
		font-size: 18px;
		padding: 10px;
		padding-top: 0;
		text-align: center;
	}

	.node-item {
		margin-bottom: 10px;
		cursor: pointer;
		background-color: #f0f0f0;
		padding: 10px;
		border-radius: 10px;
	}

	.add-node-button {
		background-color: blue;
		color: white;
		padding: 10px 20px;
		border-radius: 5px;
		text-align: center;
		width: fit-content;
		margin: 20px auto 10px;
		cursor: pointer;
	}

	.delete-node-button {
		background-color: red;
		color: white;
		padding: 10px 20px;
		border-radius: 5px;
		text-align: center;
		width: fit-content;
		margin: 10px auto 0;
		cursor: pointer;
	}
</style>
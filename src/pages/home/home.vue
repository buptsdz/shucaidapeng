<template>
	<view class="container">
		<view class="header">
			<image class="profile-image" src="/static/tx.jpg" mode="aspectFill"></image>
			<text class="username">{{username}}</text>
		</view>
		<view class="content">
			<view class="menu-item" @click="goToSettings">
				<text class="menu-title">设置</text>
				<image class="arrow-right" src="/static/arrow-right.png" mode="widthFix"></image>
			</view>
			<view class="menu-item" @click="goToHelp">
				<text class="menu-title">帮助与反馈</text>
				<image class="arrow-right" src="/static/arrow-right.png" mode="widthFix"></image>
			</view>
			<view class="menu-item" @click="goToAbout">
				<text class="menu-title">关于我们</text>
				<image class="arrow-right" src="/static/arrow-right.png" mode="widthFix"></image>
			</view>
		</view>
		<view class="logout-button" @click="logout">
			<text class="logout-text">退出登录</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				username: '' // 假设这是用户注册时的名字
			}
		},
		onLoad() {
		    uni.getStorage({
		        key: 'loggedInUser',
		        success: res => {
		            console.log(res.data);
		            this.username = res.data.username;
		        }
		    });
		  },
		methods: {
			logout() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			}
		}
	}
</script>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: #F5F5F5;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 30%;
		background-color: #FFFFFF;
	}

	.profile-image {
		width: 100px;
		height: 100px;
		border-radius: 50px;
		margin-top: 20px;
	}

	.username {
		font-size: 20px;
		font-weight: bold;
		margin-top: 10px;
	}

	.content {
		flex: 1;
		background-color: #FFFFFF;
		padding: 0 20px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 50px;
		border-bottom: 1px solid #EAEAEA;
	}

	.menu-title {
		font-size: 16px;
	}

	.arrow-right {
		width: 20px;
	}

	.logout-button {
		position: absolute;
		bottom: 20px;
		right: 20px;
		background-color: #007bff;
		/* 更改背景颜色 */
		color: #FFFFFF;
		/* 更改文字颜色 */
		padding: 10px 20px;
		border-radius: 5px;
		text-align: center;
	}

	.logout-text {
		font-size: 16px;
	}
</style>
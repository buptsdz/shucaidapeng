<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="page-title">
			<text>智能温室监控系统</text>
		</view>
		<view class="form">
			<view class="form-item">
				<text class="label">用户名：</text>
				<input type="text" v-model="loginForm.username" placeholder="请输入用户名" />
			</view>
			<view class="form-item">
				<text class="label">密码：</text>
				<input type="password" v-model="loginForm.password" placeholder="请输入密码" />
			</view>
			<button @tap="handleLogin">登录</button>
			<!-- 添加跳转注册按钮 -->
			<button @tap="goToRegister" class="btn-register">没有账号？去注册</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loginForm: {
					username: '',
					password: ''
				}
			};
		},
		methods: {
			handleLogin() {
				// 空值校验
				if (!this.loginForm.username.trim()) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					});
					return;
				}
				if (!this.loginForm.password.trim()) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					});
					return;
				}
				const users = uni.getStorageSync('users') || [];
				const user = users.find(u => u.username === this.loginForm.username && u.password === this.loginForm
					.password);
				if (user) {
					uni.showToast({
						title: '登录成功'
					});
					uni.setStorageSync('loggedInUser', user);
					uni.switchTab({
						url: "/pages/index/index"
					});
				} else {
					uni.showToast({
						title: '用户名或密码错误',
						icon: 'none'
					});
				}
			},
			goToRegister() {
				uni.redirectTo({
					url: '/pages/register/register'
				});
			}
		}
	};
</script>

<style>
	.container {
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.page-title {
		font-size: 24px;
		font-weight: bold;
		color: #007aff;
		/* 更鲜明的标题颜色 */
		text-align: center;
		margin-bottom: 30px;
	}

	.form {
		width: 100%;
	}

	.form-item {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}

	.label {
		width: 80px;
		font-size: 14px;
	}

	input {
		flex: 1;
		height: 40px;
		border: 1px solid #eee;
		border-radius: 4px;
		padding: 0 10px;
		font-size: 14px;
	}

	button {
		margin-top: 20px;
		width: 100%;
		height: 40px;
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 16px;
	}
</style>
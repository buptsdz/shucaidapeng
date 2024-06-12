<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="page-title">
			<text>智能温室监控系统</text>
		</view>
		<view class="form">
			<view class="form-item">
				<text class="label">用户名：</text>
				<input type="text" v-model="registerForm.username" placeholder="请输入用户名" class="input" />
			</view>
			<view class="form-item">
				<text class="label">密码：</text>
				<input type="password" v-model="registerForm.password" placeholder="请输入密码" class="input" />
			</view>
			<view class="form-item">
				<text class="label">确认密码：</text>
				<input type="password" v-model="registerForm.confirmPassword" placeholder="请再次输入密码" class="input" />
			</view>
			<button @click="handleRegister" class="btn-register">注册</button>
			<!-- 添加跳转按钮 -->
			<button @click="goToLogin" class="btn-login">已有账号，去登录</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				registerForm: {
					username: '',
					password: '',
					confirmPassword: ''
				}
			};
		},
		onLoad(){
			uni.setStorage({
				key: 'users',
				data: [],
				success: function () {
					console.log('success');
				}
			});
		},
		methods: {
			// 注册方法
			handleRegister() {
			    // 空值校验
			    if (!this.registerForm.username.trim()) {
			        uni.showToast({
			            title: '请输入用户名',
			            icon: 'none'
			        });
			        return;
			    }
			    if (!this.registerForm.password.trim()) {
			        uni.showToast({
			            title: '请输入密码',
			            icon: 'none'
			        });
			        return;
			    }
			    // 检查两次输入的密码是否一致
			    if (this.registerForm.password !== this.registerForm.confirmPassword) {
			        uni.showToast({
			            title: '两次输入的密码不一致',
			            icon: 'none'
			        });
			        return;
			    }
			
			    // 获取缓存中的用户数据
			    const users = uni.getStorageSync('users') || [];
			
			    // 检查用户名是否已存在
			    const exists = users.some(user => user.username === this.registerForm.username);
			    if (exists) {
			        uni.showToast({
			            title: '用户名已存在',
			            icon: 'none'
			        });
			        return;
			    }
			
			    // 创建新用户对象，并添加node属性
			    const newUser = {
			        username: this.registerForm.username,
			        password: this.registerForm.password,
			        node: [] // 初始化node为空数组
			    };
			
			    // 将新用户添加到users数组中
			    users.push(newUser);
			
			    // 将users数组保存到缓存中
			    uni.setStorageSync('users', users);
			
			    // 提示注册成功并跳转到登录页面
			    uni.showToast({
			        title: '注册成功',
					duration:2200
			    });
			    uni.navigateTo({
			        url: '/pages/login/login'
			    });
			},
			
			// 登录方法
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
			
			    // 获取缓存中的用户数据
			    const users = uni.getStorageSync('users') || [];
			
			    // 查找用户
			    const user = users.find(user => user.username === this.loginForm.username && user.password === this.loginForm.password);
			
			    if (user) {
			        // 登录成功，存储用户信息到缓存
			        uni.setStorageSync('loggedInUser', user);
			        uni.showToast({
			            title: '登录成功',
						
			        });
			        // 跳转到首页或其他页面
			        uni.switchTab({
			            url:"/pages/index/index"
			        });
			    } else {
			        // 登录失败
			        uni.showToast({
			            title: '用户名或密码错误',
			            icon: 'none'
			        });
			    }
			},
			
			// 增删查改方法示例（以增为例）
			handleAddNode() {
			    // 获取当前用户
			    const user = uni.getStorageSync('loggedInUser');
			
			    if (user) {
			        // 假设我们添加一个新节点
			        const newNode = {
			            // 节点属性...
			        };
			
			        // 将新节点添加到当前用户的node数组中
			        user.node.push(newNode);
			
			        // 更新缓存中的用户数据
			        const users = uni.getStorageSync('users') || [];
			        const index = users.findIndex(u => u.username === user.username);
			        if (index !== -1) {
			            users[index] = user;
			            uni.setStorageSync('users', users);
			            uni.setStorageSync('loggedInUser', user); // 更新当前用户缓存
			        }
			
			        // 提示添加成功
			        uni.showToast({
			            title: '添加成功',
						duration:2200
			        });
			    } else {
			        // 用户未登录或登录过期
			        uni.showToast({
			            title: '请先登录',
			            icon: 'none'
			        });
			    }
			},
			goToLogin() {
				uni.redirectTo({
					url: '/pages/login/login'
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

	.background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
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

	.input {
		flex: 1;
		height: 40px;
		border: 1px solid #eee;
		border-radius: 4px;
		padding: 0 10px;
		font-size: 14px;
	}

	.btn-register {
		margin-top: 20px;
		width: 100%;
		height: 40px;
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 16px;
	}

	.btn-login {
		margin-top: 10px;
		background-color: #fff;
		color: #007aff;
		border: 1px solid #007aff;
		width: 100%;
		height: 40px;
		border-radius: 4px;
		font-size: 16px;
	}

	.btn-login:hover {
		background-color: #f3f4f6;
	}
</style>
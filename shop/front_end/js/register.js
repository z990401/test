var vm = new Vue({
    el :'#app',
    data:{
    	error_name:false,
		error_password:false,
		error_check_password:false,
    	error_phone:false,
		error_allow:false,
		error_image_code:false,
		error_sms_code:false,



    	username:'',
		password:'',
		password2:'',
    	mobile:'',
		image_code:'',
		sms_code:'',
		allow:false,

        image_code_url:'',//定义图片验证码的url
        image_code_id:"",//定义图片验证码的id方便后端存储
		sending_flag:false,
		sms_code_tip:'获取短信验证码',
		error_image_code_message:'请填写图片验证码',
		error_sms_code_message:'请填写短信验证码',
		error_phone_message:'',
		error_name_message:'',


    },
	mounted:function(){
    	this.image_code_id = this.generate_uuid();
    	this.generate_image_code()
	},
    methods:{
        generate_uuid: function(){
			var d = new Date().getTime();
			if(window.performance && typeof window.performance.now === "function"){
				d += performance.now(); //use high-precision timer if available
			}
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c =='x' ? r : (r&0x3|0x8)).toString(16);
			});
			return uuid;
		},
        generate_image_code:function () {
			// 生成一个编号
			// 严格一点的使用uuid保证编号不唯一，也可以使用时间戳
			this.image_code_id = this.generate_uuid();
			this.image_code_url = "http://127.0.0.1:8000" + "/image_codes/"+this.image_code_id;
        },
		check_username:function(){
        	var len=this.username.length;
			if(len<5||len>20){
				this.error_name_message='请输入5-20个字符的用户名';
				this.error_name=true
			}else {
				this.error_name=false
			}
				if (this.error_name == false){
				axios.get('http://127.0.0.1:8000/usernames/'+ this.username +'/count/',{
					responseType: 'json'
				}).then(response => {
					if (response.data.count > 0){
						this.error_name_message = '用户名已存在';
						this.error_name = true;
					}else {
						this.error_name = false;

					}
				}).catch(error => {
					console.log()
				})
			}

		},
		check_pwd:function(){
        	var len=this.password.length;
        	if(len<8||len>20){
        		this.error_password=true
			}else {
        		this.error_password=false
			}
		},
		check_cpwd:function(){
        	if(this.password!=this.password2){
        		this.error_check_password=true;
			}else {
        		this.error_check_password=false;
			}
		},
		check_phone:function(){
        	var re = /^1[3-9]\d{9}$/;
        	if(re.test(this.mobile)){
        		this.error_phone = false
			}else {
        		this.error_phone=true
				this.error_phone_message='手机验证码输入错误'
			}
			if (this.error_phone == false){  //表示手机号输入符合
				axios.get('http://127.0.0.1:8000/mobiles/'+ this.mobile +'/count/',{
					responseType:'json'

				}).then(response => {
					if (response.data.count > 0){
						this.error_phone = true;
						this.error_phone_message = '手机号已存在';
					}else {
						this.error_phone = false;
					}
                }).catch(error => {
					console.log(error.response);
				})
			}

		},
		check_image_code:function(){
        	if(!this.image_code){
        		this.error_image_code=true;
			}else {
        		this.error_image_code=false;
			}
		},
		check_sms_code:function(){
        	if(!this.sms_code){
        		this.error_sms_code=true;
        		this.error_sms_code_message='请填写短信验证码'
			}else {
        		this.error_sms_code=false
			}
		},
		check_allow:function(){
        	if(!this.allow){
        		this.error_allow=true;
			}else {
        		this.error_allow=false;
			}
		},
		send_sms_code:function () {
			this.check_phone();
			this.check_image_code();
			if (this.error_phone == true || this.error_image_code == true || this.sending_flag==true){
				return;
			}
			this.sending_flag=true;
			axios.get('http://127.0.0.1:8000/sms_codes/'+this.mobile+'/?text='+this.image_code+"&image_code_id="+this.image_code_id,{
				responseType:"json"
			}).then(response =>{
				this.generate_image_code()
				var num = 60;
				var t= setInterval(()=>{
					if(num ==1 ){
						clearInterval(t);
						this.sms_code_tip='获取短信验证码'
						this.sending_flag=false
					}else {
						num -=1
						this.sms_code_tip = num +'秒'

					}
				},1000,60)
			}).catch(error =>{
				if(error.response.status==400){
					this.error_image_code_message='图片验证码过期'
					this.error_image_code=true;
					this.generate_image_code()
					this.sending_flag=false
				}else {
					this.sending_flag=false
				}
			})
        },
        on_submit: function(){
			this.check_username();
			this.check_pwd();
			this.check_cpwd();
			this.check_phone();
			this.check_sms_code();
			this.check_allow();

			//########################################
			// 向后端去发送注册请求
			if (this.error_name == true || this.error_password == true || this.error_check_password == true || this.error_phone == true || this.error_sms_code == true||this.error_allow == true){
				return;
			}
			axios.post('http://127.0.0.1:8000/users/', {
				// vue中的字典参数都和v-model参数一致，而不是ajax中的name！！！！
				username: this.username,
				password: this.password,
				password2: this.password2,
				mobile: this.mobile,
				sms_code: this.sms_code,
				allow: this.allow,

			  })
			  .then(response => {
			  		// console.log(response.statusText);
				  	// 保存后端返回的token数据
					location.href = '/index.html';

			  })
			  .catch(error => {

				if (error.response.status == 400){
					this.error_sms_code_message = '短信验证码错误'
					this.error_sms_code = true
				}else {
					console.log(error)
				}

			  });

		},

    }
});
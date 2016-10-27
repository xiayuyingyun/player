/*
	这个文件中包含了音乐播放器的实质方法体，
	提供音乐的操控支持
	提供歌词的切换和歌曲分类的生成

*/

$(function(){

	var Data       = requestData(),//接收数据文件,0是列表，1是音乐文件
		Audio      = document.getElementById('Audio'),//获取音乐播放器
		//播放器组件
		$AudioCon  = $('#Con_music'),//获取音乐组件容器
		$PlayStop  = $('#Play'),//播放，暂停
		$Pre       = $AudioCon.find('.icon_pre'),//上一曲
		$Next      = $AudioCon.find('.icon_next'),//下一曲
		$TimeAll   = $AudioCon.find('.con_offset'),//时间轴
		$OldTime   = $AudioCon.find('.do_offset'),//已经经过的时间
		$All_time  = $AudioCon.find('.all_time'),//文字，总时间
		$Old_time  = $AudioCon.find('.over_time'),//文字，已经播放时间
		$Trumpet   = $('#icon_audio'),//喇叭
		$SoundAll  = $AudioCon.find('.all_voice'),//音量总长度
		$Sound     = $AudioCon.find('.now_voice'),//现在音量长度
		$PlayMode  = $('#PlayMode'),//播放模式
		$songName  = $AudioCon.find('.song_name'),//歌名
		$singerImg = $AudioCon.find('.singer_img'),//歌手照片
		//列表
		$SongClass = $('#music_class'),//分类列表
		$SongList  = $('#catalogue'),//歌曲列表
		$SinLyric  = $('#conB_lyric'),//歌词可视区域
		$LyricList = $('#Do_lyric'),//歌词
		//函数中用到的全局变量
		ClassIndex = 0,//播放列表
		showClass  = 0,//显示列表
		index      = NaN,//第几首,防止第一次点击分类就添加class
		AllTime    = 0,//当前歌曲的总时间
		FoverRun   = null,//不停在执行的方法
		AudioMode  = 0,//播放模式控制变量
		STimeArr   = null,//歌曲时间数组
		SLyricArr  = null,//歌词数组
		aaa        = 0;


		// 第一步，渲染数据
		//渲染歌曲分类数据
		(function(){
			var ClassList = Data[0];
			for(var i in ClassList){
				var list = '<li>'+ClassList[i]+'</li>';
				$SongClass.append(list);
			}
		})();
		//添加歌曲列表数据,根据类角标添加
		function SongListData(ClassIndex){
			var list   = Data[1][ClassIndex],
				munber = 0;
			$SongList.empty();
			for( var i in list){
				if ( i < 9 ) {
					munber = '0'+ (parseInt(i)+1);
				}else{
					munber = parseInt(i)+1;
				}
				var li = '<li><span>'+munber+'.&nbsp;&nbsp;'+list[i].Name+'</span><strong>'+list[i].Singer+'</strong><a href="'+list[i].Src+'"><img src="images1/download.png" /></a></</li>';
				$SongList.append(li);
			}

		}
		SongListData(0);

		//这个方法，渲染歌词
		function SongLyricAdd(Arr){
			$LyricList.empty();
			$LyricList.css({'top':'50%'});
			for( var i in Arr ){
				var li = '<li>'+ Arr[i] + '</li>';
				$LyricList.append(li);
			}
		}

		//第二步，分类点击切换歌曲列表
		$SongClass.find('li').click(function(){
			$(this).addClass('active').siblings().removeClass('active');
			if ( $(this).index() != showClass) {
				showClass = $(this).index();
				$SongList.stop().animate({'left':'-100%'},500);
				setTimeout(function(){
					SongListData(showClass);
					$SongList.css({'top':'0'});
					$SongList.stop().animate({'left':'0'},500);
				},500);				
			}

			if( $(this).index() == ClassIndex ){
				setTimeout(function(){
					$SongList.find('li').eq(index).addClass('active').siblings().removeClass('active');
				},501);
			}
			
		});


		//给歌曲列表添加点击事件,注意用delegate，为动态创建的节点添加方法
		$SongList.delegate('li','click',function(){
			ClassIndex = showClass;
			index = $(this).index(); 
			AudioPlay(index);
		});


		//第三步，组件方法
		$Pre.click(function(){
			index --;
			if (index < 0) {
				index = Data[1][ClassIndex].length - 1;
			}
			AudioPlay(index);
		});

		$Next.click(function(){
			index ++;
			if (index > Data[1][ClassIndex].length - 1) {
				index = 0;
			}
			AudioPlay(index);
		});

		$PlayStop.click(function(){

			if( Audio.paused ){
				Audio.play();
				AllRun();
				$PlayStop.attr({'class':'icon_stop'});
			}else{
				clearInterval(FoverRun);
				Audio.pause();
				$PlayStop.attr({'class':'icon_play'});
			}
		});


		//播放方法
		function AudioPlay(index){
			var Src       = Data[1][ClassIndex][index].Src,
			    lyric     = Dolyric(Data[1][ClassIndex][index].Lyric);
				//修改全局变量    
			    STimeArr  = lyric[0],//重新定义歌曲时间数组
			    SLyricArr = lyric[1];//重新定义歌词


			clearInterval(FoverRun);

			//改变表单样式
			$SongClass.find('li').eq(ClassIndex).addClass('bg').siblings().removeClass('bg');
			$SongList.find('li').eq(index).addClass('active').siblings().removeClass('active');
			//底部歌曲信息
			$songName.text(Data[1][ClassIndex][index].Name+'-------'+Data[1][ClassIndex][index].Singer);
			$singerImg.attr({'src':Data[1][ClassIndex][index].Img});
			//改变播放暂停样式
			$PlayStop.attr({'class':'icon_stop'});
			//更改背景
			$('body').css({'background-image':'url('+Data[1][ClassIndex][index].Img+')'});

			//歌词加载
			SongLyricAdd(SLyricArr);

			//歌曲加载
			$(Audio).attr({'src':Src});
			Audio.load();
			Audio.play();
			AllRun();
		}

		Audio.addEventListener('canplay',function(e){
			AllTime = Audio.duration;
			$All_time.text(makeTime(AllTime));
		});


		//不断在执行的方法
		function AllRun(){
			var old = 0;
			FoverRun = setInterval(function(){
				var nowTime = Audio.currentTime;
				//更新已过时间的数字
				$Old_time.text(makeTime(nowTime));
				//更新时间进度条
				$OldTime.css({'width':nowTime/AllTime*100+'%'});

				//更新歌词进度,$LyricList,STimeArr是一个时间数组，里面记录了时间
				for( var i in STimeArr){

					if( parseInt(STimeArr[i]/1000) == parseInt(nowTime)){
						$LyricList.find('li').eq(i).addClass('active').siblings().removeClass('active');
						$LyricList.css({'top':$SinLyric.height()/2-i*$LyricList.find('li').outerHeight()+'px'});
					}
					
				}

				//判断是否播放完毕
				if( Audio.ended ){
					clearInterval(FoverRun);
					ChangeMode(AudioMode)
				}

			},100);
		}

		//时间轴点击方法
		$TimeAll.click(function(e){
			var x   = e.clientX - this.offsetLeft,
			setTime = (x/$(this).width());
	       Audio.currentTime = Audio.duration*setTime;
	       $OldTime.animate({'width':setTime*100+'%'},500);
		});

		//音量控制
		$Trumpet.click(function(){
			if ( Audio.muted ) {
				Audio.muted = false;
				$(this).attr({'class':'icon_audio'});
				$Sound.animate({'width':Audio.volume*100+'%'},500);
			}else{
				Audio.muted = true;
				$(this).attr({'class':'icon_mute'});
				$Sound.animate({'width':'0'},500);
			}
		});

		$SoundAll.click(function(e){
			var x  = e.clientX - this.offsetLeft,
	        volume = (x/$(this).width()).toFixed(1);
	       
	       $Sound.animate({'width':volume*100+'%'},500); 
	       Audio.volume = volume;
		});

		//播放模式
		$PlayMode.click(function(){
			AudioMode++;
			if( AudioMode == 1) {
				$(this).attr({'class':'icon_shuffle'});
			}else
			if( AudioMode == 2) {
				$(this).attr({'class':'icon_loop'});
			}else{
				AudioMode = 0;
				$(this).attr({'class':'icon_repeat'});
			}
		});

		function ChangeMode(AudioMode){
			if (AudioMode == 0) {
	            //循环播放
	            index ++;
	            if (index > Data[1][ClassIndex].length-1) {
	                index = 0;
	            }
	            AudioPlay(index);
	        }else
	        if( AudioMode == 1){
	            //随机播放
	            index = parseInt(Math.random()*Data[1][ClassIndex].length);
	            AudioPlay(index);

	        }else{
	            //单曲循环
	            AudioPlay(index);
	        }
		}


		//时间处理方法,把秒数转成00:00
	    function makeTime(time){
	        var min = parseInt(time/60),
	           miao = parseInt((time%60).toFixed(2));

	        if( min < 10){
	            min = '0'+min;
	        } 
	        if( miao < 10){
	            miao = '0'+miao;
	        }
	        return min+':'+miao;  
	    }


	    //这个方法处理歌词，把源字符串修改成两个数组。一个是时间数组，一个是歌词数组，返回一个数组，
	    function Dolyric(string){
	        var St    = string,//接收原始字符串
	        textArr   = St.split('['),//执行第一次分割
	        timeArr   = [],//时间数组
	        lyricArr  = [],//歌词数组
	        returnArr = [];//将要返回的数组

	        //时间初步提取，歌词提取
	        for( var i in textArr){
	            var arr = textArr[i].split(']');//第二次分割
	            timeArr.push(arr[0]);
	            lyricArr.push(arr[1]);
	        }
	        //把时间处理成以毫秒为单位的时间
	        for(var i in timeArr){
	            var time        = timeArr[i].split(':');//目的获取分钟
	                minute      = parseInt(time[0])*60*1000;//分钟转化成毫秒
	                second      = parseInt(time[1])*1000,//秒转化成毫秒
	                millisecond = parseInt(parseFloat(time[1])%1*100),//获取毫秒
	                timeArr[i]  = minute + second + millisecond; //直接改变原数组的值
	        }
	        //因为timeArr，lyricArr的第一项为NaN，为了方便起见，删除第一项
	        timeArr.shift();
	        lyricArr.shift();

	        //把两个数组放到将要返回的总数组里面
	        returnArr = [timeArr,lyricArr];
	        //console.log(returnArr);
	        return returnArr;
	    }








});

/*
	目的：为播放器提供效果展示支持
	创建人：吉方玉
	
*/

$(function(){

	var $Container  = $('#Container'),//主容器
		$Con_music  = $('#Con_music'),//播放器组件容器
		$con_drag   = $('#con_drag'),//拖拽容器
		$song_clas  = $('#music_class'),//分类列表容器
		$song_clasL = $('#music_class > li');//分类项

	//页面初始化
	function info(){
		var WindowH = $(window).height();
        //初始化主页面的
		$Container.height(WindowH-$Con_music.height());
        // 初始化列表的line-height
        $song_clas.css({'line-height':$song_clasL.height()+'px'});
	}
	info();
	
	$(window).resize(function(){
		info();
		setDrag("#con_drag");
		//防止屏幕大小变化时造成空白
		//$con_drag.css({'left':'0'});
	});


	function setDrag(id){  
        var that       = $(id),
        	WinW       = $(window).width(),
            startX     = 0, //开始坐标 
            lastX      = 0,//结束坐标
            directionA = 0,//鼠标相对于窗口开始的位置，不包含目标已经有的位移
            directionB = 0,//鼠标相对于窗口开始的位置
            minX       = 0,
            drag       ={  
            down:function(e){
                startX     = e.clientX - that.position().left,
                directionA = e.clientX;  
                this.setCapture && this.setCapture();//避免IE下拖拽过快鼠标失去对象  
                that.on('mousemove',drag.move);  
                that.on('mouseup',drag.up);
                //return false;  
            },  
            move:function(e){
                //更改鼠标的样式
                $('body').css({'cursor':'move'});

                lastX = e.clientX - startX;
                direction= e.clientX - startX;
                minX = $Container.width() - that.outerWidth();//最大值  
                lastX = lastX > 400 ? 400:lastX;//根据最大值求范围  
                lastX = lastX < minX-400 ? minX-400:lastX; 
                that.css({'left':lastX+'px'});
                window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); // 防止拖动文本  
                e.stopPropagation();
                return false;  
            },

            up:function(e){
                //更改鼠标的样式
                $('body').css({'cursor':'auto'});
                
            	directionB = e.clientX-directionA; 
                if ( lastX > 0) {
                    that.stop().animate({'left':0+'px'},500);
                }else
                if (lastX < minX) {
                    that.stop().animate({'left':minX+'px'},500);
                }else{
                	// 判断拉拽的距离是否过了1/3，
                	if( directionB <= -WinW/3 ){
                		that.stop().animate({'left':-WinW+'px'},500);
                	}else
                	if ( directionB < 0 && directionB > -WinW/3 ) {
                		that.stop().animate({'left':'0'},500);
                	}else
                	if( directionB >= WinW/3 ){
                		that.stop().animate({'left':'0'},500);
                	}else
                	if ( directionB > 0 && directionB < WinW/3 ){
                		that.stop().animate({'left':-WinW+'px'},500);
                	}
                	// 判断拉拽的距离是否过了1/3，end
                }

                that.off('mousemove',drag.move);//移除on绑定的方法  
                that.off('mouseup',drag.up);
                return false;  
            }  
        };  
      
        that.on('mousedown',drag.down);   
    }  
    setDrag("#con_drag");


    //表单切换,点击改变分类的样式


    //通过按钮切换歌词页和列表页
    function On_off_lyirc(){

    	$('#lyric_on_off').click(function(){
    		if ($con_drag.position().left == 0) {
    			$con_drag.stop().animate({'left':-$(window).width()+'px'},500);
    		}else{
    			$con_drag.stop().animate({'left':'0'},500);
    		}
    	});
    }
    On_off_lyirc();


    //页面初始化时，判断是否要添加滚动条
    function AddScrollTop(){
        var $Con        = $('#con_catalogue'),//可是容器
            $container  = $('#con_catalogue'),//内容容器
            $con_scroll = $('#con_scroll');

        $Con.hover(function(){
            if ( $('#catalogue').height() > $('#con_catalogue').height() ) {
                $con_scroll.stop().animate({'opacity':'1'},500);
                ScorllTop('#con_catalogue','#catalogue','#con_scroll','#do_scroll');
            }

        },function(){
            $con_scroll.stop().animate({'opacity':'0'},500);
        });    
        
    }
    AddScrollTop();


    //竖向的滚动条，四个参数，可视区域ID，内容区域Id，滚动条区域，滚动条，
    function ScorllTop(id1,id2,id3,id4){
        var $container = $(id1),//可视区域
            $contanr   = $(id2),//内容区域
            $conScroll = $(id3),//滚动条活动区域
            $sroll     = $(id4),//滚动条
              startY   = 0,//开始位置  
              lastY    = 0,//结束位置
                YN     = false,
                  bBtn = true;//判断滚动条上滚还是下滚

            $sroll.css({'height':$container.height()*$conScroll.height()/$contanr.outerHeight()+'px'});

            $sroll.mousedown(function(e){
                startY = e.clientY - this.offsetTop;  
                this.setCapture && this.setCapture();//避免IE下拖拽过快鼠标失去对象
                YN = true;
                return false;
            });

            $sroll.mousemove(function(e){
                var maxVal = $conScroll.height() - $(this).height();
                if(YN){
                    lastY = e.clientY - startY;
                    lastY = lastY < 0 ? 0 :lastY;
                    lastY = lastY > maxVal ? maxVal : lastY;

                    $(this).css({'top':lastY+'px'});
                    $contanr.css({'top':-$conScroll.height()*lastY/$(this).height()+'px'});
                    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); // 防止拖动文本  
                    e.stopPropagation(); 
                }
                
                return false;
            });

            $sroll.mouseup(function(e){
                YN = false;
                NumY = lastY;
                return false;
            });
            //为内容区域添加滑轮滚动事件
            if($contanr[0].addEventListener){
                $contanr[0].addEventListener('DOMMouseScroll',MouseScr,false);
            }
            $contanr[0].onmousewheel = MouseScr;
            function MouseScr(ev){
                var ev = ev || window.event,
                  TopY = 0;
                if(ev.detail){
                    bBtn = ev.detail>0  ?  true : false;
                }
                else{
                    bBtn = ev.wheelDelta<0  ?  true : false;
                }
                if(bBtn){   //下
                    TopY = $contanr.position().top-10;
                }
                else{  //上
                    TopY = $contanr.position().top+10;
                }
                var maxTop = $contanr.outerHeight()-$container.outerHeight();
                TopY = TopY > 0 ? 0 : TopY;
                TopY = TopY < -maxTop ? -maxTop : TopY;
                $contanr.css({'top':TopY+'px'});
                $sroll.css({'top':$sroll.height()*Math.abs(TopY)/$conScroll.height()+'px'});

                if(ev.preventDefault){
                    ev.preventDefault();
                }
                else{
                    return false;
                }
            }
    }


});




    
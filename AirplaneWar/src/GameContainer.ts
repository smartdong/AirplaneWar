/**
 *
 * @author 
 *
 */
    class GameContainer extends egret.DisplayObjectContainer {
    
    private stageW: number;
    private stageH: number;
        
    //开始按钮
    private btnStart: egret.Bitmap;
        
    //背景
    private bg: BgMap;
    
    //我的飞机
    private myPlane: Airplane;
    //敌人飞机
    private enemyPlanes: Airplane[] = [];
    
    private enemyPlaneTimer: egret.Timer = new egret.Timer(1000);
    
    //我的子弹
    private myBullets: Bullet[] = [];
    //敌人子弹
    private enemyBullets: Bullet[] = [];
    
    //游戏分数
    private score: number = 0;
    
    //展示分数的txf
    private scoreLable: egret.TextField;
    
    //展示血量的txf
    private bloodLable: egret.TextField;
    
    private lastTime: number;
    
    
    //记录手指上一次的位置
    private lastX: number;
    private lastY: number;
    
	public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
	}
    
    private onAddToStage(event: egret.Event) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
        this.createGameScene();
    }
    
    private createGameScene(): void {
        this.stageW = this.stage.stageWidth;
        this.stageH = this.stage.stageHeight;
        
        //添加背景
        this.bg = new BgMap();
        this.addChild(this.bg);
        
        //添加分数展示
        this.scoreLable = new egret.TextField();
        this.scoreLable.text = "您的分数为：0分";
        this.scoreLable.x = 30;
        this.scoreLable.y = 30; 
        this.addChild(this.scoreLable);
        
        //添加血量展示
        this.bloodLable = new egret.TextField();
        this.bloodLable.text = "您的血量为：10";
        this.bloodLable.x = 30;
        this.bloodLable.y = 30 + this.scoreLable.height + 10; 
        this.addChild(this.bloodLable);
        
        //添加开始按钮
        this.btnStart = GameUtil.createBitmapByName("btnStart");
        this.btnStart.x = (this.stageW-this.btnStart.width)/2;
        this.btnStart.y = (this.stageH-this.btnStart.height)/2;
        this.btnStart.touchEnabled = true;
        this.btnStart.addEventListener(egret.TouchEvent.TOUCH_TAP,this.gameStart,this);
        this.addChild(this.btnStart); 
        
        //创建我的飞机
        this.myPlane = new Airplane(RES.getRes("f1"),100);
        this.myPlane.x = (this.stageW - this.myPlane.width) / 2;
        this.myPlane.y = this.stageH * 0.9 - this.myPlane.height;
        this.addChild(this.myPlane);
    }
    
    private gameStart(): void {
        
        this.removeChild(this.btnStart);
        this.bg.start();
        
        this.score = 0;
        this.scoreLable.text = "您的分数为：0分";
        
        this.bloodLable.text = "您的血量为：10";
        
        //开始发射子弹
        this.myPlane.addEventListener("createBullet",this.createBulletHandler,this);
        this.myPlane.fire();
        this.myPlane.blood = 10;
        
        //开始更新画面
        this.addEventListener(egret.Event.ENTER_FRAME,this.gameViewUpdate,this);
        
        //开始创建敌机
        this.enemyPlaneTimer.addEventListener(egret.TimerEvent.TIMER,this.createEnemyPlane,this);
        this.enemyPlaneTimer.start();
        
        //接收手指移动
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchHandler,this);
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchHandler, this);
    }
    
    private gameOver(): void {
        
        this.addChild(this.btnStart);
        this.bg.pause();
        
        this.myPlane.stopFire();
        this.myPlane.removeEventListener("createBullet",this.createBulletHandler,this);
        
        this.myPlane.x = (this.stageW - this.myPlane.width) / 2;
        
        this.removeEventListener(egret.Event.ENTER_FRAME,this.gameViewUpdate,this);
        this.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchHandler,this);
        this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN,this.touchHandler,this);
        
        this.removeEventListener(egret.TimerEvent.TIMER,this.createEnemyPlane,this);
        this.enemyPlaneTimer.stop();
        
        //清理子弹和飞机
        var i: number = 0;
        var bullet: Bullet;
        
        while (this.myBullets.length > 0) {
            bullet = this.myBullets.pop();
            this.removeChild(bullet);
            Bullet.reclaim(bullet,bullet.textureName);
        }
        
        while (this.enemyBullets.length > 0) {
            bullet = this.enemyBullets.pop();
            this.removeChild(bullet);
            Bullet.reclaim(bullet,bullet.textureName);
        }
        
        var enemyPlane: Airplane;
        while (this.enemyPlanes.length > 0) {
            enemyPlane = this.enemyPlanes.pop();
            enemyPlane.stopFire();
            enemyPlane.removeEventListener("createBullet",this.createBulletHandler,this);
            this.removeChild(enemyPlane);
            Airplane.reclaim(enemyPlane,"f2");
        }
    }
    
    //创建敌机
    private createEnemyPlane(event: egret.TimerEvent): void {
        
        var fireDelay: number = 1000;
        
        fireDelay -= (this.score / 30) * 100;
        
        if (fireDelay < 500) {
            fireDelay = 500;
        }
        
        var enemyPlane: Airplane = Airplane.produce("f2",fireDelay);
        enemyPlane.x = Math.random()*(this.stageW-enemyPlane.width);//随机坐标
        enemyPlane.y = -enemyPlane.height - (Math.random()%10)*300;//随机坐标
        enemyPlane.addEventListener("createBullet",this.createBulletHandler,this);
        enemyPlane.fire();
        this.addChildAt(enemyPlane,this.numChildren-1);
        this.enemyPlanes.push(enemyPlane);
    }
    
    //创建子弹
    private createBulletHandler(event: egret.Event): void {
        var bullet: Bullet;
        
        //我的子弹
        if (event.target == this.myPlane) {
            for (var i: number = 0;i < 2;i++) {
                bullet = Bullet.produce("b1");
                bullet.x = (i == 0) ? (this.myPlane.x + this.myPlane.width/4 - bullet.width):(this.myPlane.x+this.myPlane.width - this.myPlane.width/4);
                bullet.y = this.myPlane.y + 30;
                this.addChildAt(bullet,this.numChildren-1-this.enemyPlanes.length);
                this.myBullets.push(bullet);
            }
        } else {
            var enemyPlane: Airplane = event.target;
            bullet = Bullet.produce("b2");
            bullet.x = enemyPlane.x + enemyPlane.width / 2 - bullet.width/2;
            bullet.y = enemyPlane.y + 10;
            this.addChildAt(bullet,this.numChildren-1-this.enemyPlanes.length);
            this.enemyBullets.push(bullet);
        }
    }
    
    //更新画面
    private gameViewUpdate(event: egret.Event): void {
        
        var nowTime: number = egret.getTimer();
        var fps: number = 1000 / (nowTime-this.lastTime);
        this.lastTime = nowTime;
        
        var speedOffset: number = 60 / fps;
        
        var i: number;
        var bullet: Bullet;
        var delArr: any[] = [];
        
        //处理自己的子弹
        for (i = 0;i < this.myBullets.length;i++) {
            bullet = this.myBullets[i];
            bullet.y -= 12 * speedOffset;
            
            if (bullet.y < -bullet.height) {
                delArr.push(bullet);
            }
        }
        
        //回收自己的子弹
        for (i = 0;i < delArr.length;i++) {
            bullet = delArr[i];
            this.removeChild(bullet);
            Bullet.reclaim(bullet,"b1");
            this.myBullets.splice(this.myBullets.indexOf(bullet),1);
        }
        
        delArr = [];
        
        //处理敌人的飞机
        var enemyPlane: Airplane;
        
        for (i = 0;i < this.enemyPlanes.length;i++) {
            enemyPlane = this.enemyPlanes[i];
            enemyPlane.y += 4 * speedOffset;
            if (enemyPlane.y > this.stageH) {
                delArr.push(enemyPlane);
            }
        }
        
        //回收敌人飞机
        for (i = 0;i < delArr.length;i++) {
            enemyPlane = delArr[i];
            this.removeChild(enemyPlane);
            Airplane.reclaim(enemyPlane,"f2");
            enemyPlane.removeEventListener("createBullet",this.createBulletHandler,this);
            enemyPlane.stopFire();
            this.enemyPlanes.splice(this.enemyPlanes.indexOf(enemyPlane),1);
        }
        
        delArr = [];
        
        //处理敌人的子弹
        for (i = 0;i < this.enemyBullets.length;i++) {
            bullet = this.enemyBullets[i];
            bullet.y += 8 * speedOffset;
            if (bullet.y > this.stageH) {
                delArr.push(bullet);
            }
        }
        
        //回收敌人子弹
        for (i = 0;i < delArr.length;i++) {
            bullet = delArr[i];
            this.removeChild(bullet);
            Bullet.reclaim(bullet,"b2");
            this.enemyBullets.splice(this.enemyBullets.indexOf(bullet),1);
        }
        
        this.gameHitTest();
    }
    
    //处理手指移动
    private touchHandler(event: egret.TouchEvent): void {
        
        if (event.type == egret.TouchEvent.TOUCH_BEGIN) {
            this.lastX = event.localX;
            this.lastY = event.localY;
        }
        
        if (event.type == egret.TouchEvent.TOUCH_MOVE) {
            
            var deltaX = event.localX - this.lastX;
            var deltaY = event.localY - this.lastY;
            
            this.lastX = event.localX;
            this.lastY = event.localY;
            
            var tx: number = this.myPlane.x + deltaX;
            tx = Math.max(0,tx);
            tx = Math.min(this.stageW-this.myPlane.width,tx);
            this.myPlane.x = tx;
            
            var ty: number = this.myPlane.y + deltaY;
            ty = Math.max(0,ty);
            ty = Math.min(this.stageH-this.myPlane.height,ty);
            this.myPlane.y = ty;
        }
    }
    
    //碰撞检测
    private gameHitTest(): void {
        var i: number, j: number;
        var bullet: Bullet;
        var enemyPlane: Airplane;
        
        //需要删除的子弹和飞机
        var delBullets: Bullet[] = [];
        var delPlanes: Airplane[] = [];
        
        //我的子弹和敌人飞机检测
        for (i = 0;i < this.myBullets.length;i++) {
            bullet = this.myBullets[i];
            for (j = 0;j < this.enemyPlanes.length;j++) {
                enemyPlane = this.enemyPlanes[j];
                if (GameUtil.hitTest(bullet, enemyPlane)) {
                    enemyPlane.blood -= 2;
                    if (delBullets.indexOf(bullet) == -1) {
                        delBullets.push(bullet);
                    }
                    if ((enemyPlane.blood <= 0) && (delPlanes.indexOf(enemyPlane) == -1)) {
                        delPlanes.push(enemyPlane);
                    }
                }
            }
        }
        
        //敌人的子弹和我的检测
        for (i = 0;i < this.enemyBullets.length;i++) {
            bullet = this.enemyBullets[i];
            if (GameUtil.hitTest(bullet, this.myPlane)) {
                this.myPlane.blood -= 1;
                if (delBullets.indexOf(bullet) == -1) {
                    delBullets.push(bullet);
                }
            }
        }
        
        //敌机和我的检测
        for (i = 0;i < this.enemyPlanes.length;i++) {
            enemyPlane = this.enemyPlanes[i];
            if (GameUtil.hitTest(enemyPlane, this.myPlane)) {
                
                this.myPlane.blood -= 5;
                
                //不要出现负数 会比较尴尬
                if (this.myPlane.blood < 0) {
                    this.myPlane.blood = 0;
                }
                
                //直接干死敌机
                if (delPlanes.indexOf(enemyPlane) == -1) {
                    delPlanes.push(enemyPlane);
                }
            }
        }
        
        this.bloodLable.text = "您的血量为：" + this.myPlane.blood;
        
        //判断自己是否已经死掉
        if (this.myPlane.blood <= 0) {
            this.gameOver();
        } else {
            //回收子弹
            while (delBullets.length > 0) {
                bullet = delBullets.pop();
                this.removeChild(bullet);
                if (bullet.textureName == "b1") {
                    this.myBullets.splice(this.myBullets.indexOf(bullet),1);
                } else {
                    this.enemyBullets.splice(this.enemyBullets.indexOf(bullet),1);
                }
                Bullet.reclaim(bullet,bullet.textureName);
            }
            
            //增加分数
            this.score += delPlanes.length;
            this.scoreLable.text = "您的分数为：" + this.score + "分";
            
            //回收敌机
            while (delPlanes.length > 0) {
                enemyPlane = delPlanes.pop();
                enemyPlane.stopFire();
                enemyPlane.removeEventListener("createBullet",this.createBulletHandler,this);
                this.removeChild(enemyPlane);
                this.enemyPlanes.splice(this.enemyPlanes.indexOf(enemyPlane),1);
                Airplane.reclaim(enemyPlane,"f2");
            }
        }
    }
}



















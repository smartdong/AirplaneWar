/**
 *
 * @author 
 *
 */
class Airplane extends egret.DisplayObjectContainer {
    
    private bmp: egret.Bitmap;
    
    private fireDelay: number;
    
    private fireTimer: egret.Timer;
    
    public blood: number = 10;
    
    public constructor(texture: egret.Texture,fireDelay: number) {
        super();
        
        this.fireDelay = fireDelay;
        
        this.bmp = new egret.Bitmap(texture);
        this.addChild(this.bmp);
        
        this.fireTimer = new egret.Timer(fireDelay);
        this.fireTimer.addEventListener(egret.TimerEvent.TIMER,this.createBullet,this);
    }
    
    private createBullet(event: egret.TimerEvent): void {
        this.dispatchEventWith("createBullet");
    }
    
    public fire(): void {
        this.fireTimer.start();
    }
    
    public stopFire(): void {
        this.fireTimer.stop();
    }
    
    
    private static cacheDict: Object = {};
    
    public static produce(textureName: string,fireDelay: number): Airplane {
        
        if(Airplane.cacheDict[textureName] == null) {
            Airplane.cacheDict[textureName] = [];
        }
        
        var dict: Airplane[] = Airplane.cacheDict[textureName];
        
        var airplane: Airplane;
        
        if(dict.length > 0) {
            airplane = dict.pop();
        } else {
            airplane = new Airplane(RES.getRes(textureName),fireDelay);
        }
        
        airplane.blood = 10;
        
        return airplane;
    }
    
    public static reclaim(airplane: Airplane,textureName: string): void {
        
        if(Airplane.cacheDict[textureName] == null) {
            Airplane.cacheDict[textureName] = [];
        } 
        
        var dict: Airplane[] = Airplane.cacheDict[textureName];
        
        if(dict.indexOf(airplane) == -1) {
            dict.push(airplane);
        }
    }
}

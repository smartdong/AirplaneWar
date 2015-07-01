/**
 *
 * @author 
 *
 */
class Bullet extends egret.Bitmap{
    
    public textureName: string;
    
	public constructor(texture:egret.Texture) {
        super(texture);
	}
    
    private static cacheDict:Object = {};
    /**生产*/
    public static produce(textureName:string):Bullet {
        if (Bullet.cacheDict[textureName] == null) {
            Bullet.cacheDict[textureName] = [];
        }
        var dict:Bullet[] = Bullet.cacheDict[textureName];
        var bullet:Bullet;
        if(dict.length>0) {
            bullet = dict.pop();
        } else {
            bullet = new Bullet(RES.getRes(textureName));
        }
        bullet.textureName = textureName;
        return bullet;
    }
    /**回收*/
    public static reclaim(bullet:Bullet,textureName:string):void {
        if (Bullet.cacheDict[textureName] == null) {
            Bullet.cacheDict[textureName] = [];
        }
        var dict:Bullet[] = Bullet.cacheDict[textureName];
        if (dict.indexOf(bullet) == -1) {
            dict.push(bullet);
        }
    }
}

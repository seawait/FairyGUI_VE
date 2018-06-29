import { readdirSync, lstatSync, Stats, readFileSync, existsSync, writeFileSync, } from "fs";
import { extname, join, dirname } from "path";
import { createHash } from "crypto";

export class Tool{

    // private static _ins:Tool;
    // public static get ins():Tool{
    //     if(this._ins === undefined){
    //         this._ins = new Tool();
    //     }
    //     return this._ins;
    // }


    public static get time():string{
        return new Date().toTimeString();
    }

    public static getMD5Caches($dir:string, cache:any, unchanged:boolean=true):boolean{
        let files:string[] = readdirSync($dir);
        files.forEach((file)=>{
            let fileName:string = join($dir, file);
            let stats:Stats = lstatSync(fileName);
            let newHash:string;
            if(stats.isFile()){
                newHash = createHash('sha1').update(readFileSync(fileName)).digest('hex');
                if(unchanged && (!cache[fileName] || cache[fileName] !== newHash)){
                    unchanged = false;
                }
                cache[fileName] = newHash;
            }else if(stats.isDirectory() && file[0] !== '.'){
                if(unchanged){
                    unchanged = Tool.getMD5Caches(fileName, cache, unchanged);
                }else{
                    Tool.getMD5Caches(fileName, cache, unchanged);
                }
            }

        });
        return unchanged;
    }

    public static getProjPackChanged($proj:string):string[]|null{
        let resultPack:string[] = [];
        if(!existsSync($proj) || extname($proj) !== '.fairy'){
            return resultPack;
        }
        let confStr:string = join(dirname($proj), '.objs', 'fcache.json');
        let data:any;
        if(existsSync(confStr)){
            data = JSON.parse(readFileSync(confStr, 'utf8'));
        }else{
            data = {};
        }        
        let assetsURI:string = join(dirname($proj), 'assets'), packages:string[];
        if(existsSync(assetsURI)){
            packages = readdirSync(assetsURI);
            packages.forEach((pkg)=>{
            if(pkg[0] !== '.' && Tool.getMD5Caches(join(assetsURI, pkg), data, true) === false){
                resultPack.push(pkg);
            } 
            });
        }
        // let unchanged:boolean = Tool.getMD5Caches(dirname($proj), data, true);
        if(Tool.getMD5Caches(join(dirname($proj), 'settings'), data, true) === false){
            writeFileSync(confStr, JSON.stringify(data), 'utf8');
            return null;
        }else{
            writeFileSync(confStr, JSON.stringify(data), 'utf8');
        }
        return resultPack;
    }

    public static getFairyPackageFiles($proj:string):string[]|null{
        if(!existsSync(join(dirname($proj), 'assets')) || !existsSync($proj) || extname($proj) !== '.fairy'){
            return null;
        }
        return readdirSync(join(dirname($proj), 'assets'));
    }

    public static getFairyProjFiles($dir:string):string[]{
        let files:string[] = readdirSync($dir);
        let folder:string[] = [];
        let fairyFiles:string[] = [];
        if (files.some((file)=>{
            let stats:Stats = lstatSync(join($dir, file));
            if (stats.isFile() && extname(file) === '.fairy') {
                // projFiles.push(join($dir, file));
                fairyFiles.push(join($dir, file));
                return true;
            }else if(stats.isDirectory()){
                folder.push(join($dir, file));
            }
            return false;
        }) === false) {
            folder.forEach((file)=>{
                fairyFiles = fairyFiles.concat(Tool.getFairyProjFiles(file));
            });
        }
        return fairyFiles;
    }
}
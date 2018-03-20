import { readdirSync, lstatSync, Stats } from "fs";
import { extname, join } from "path";

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

    public static getDirFiles($dir:string):string[]{
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
                fairyFiles = fairyFiles.concat(Tool.getDirFiles(file));
            });
        }
        return fairyFiles;
    }
}
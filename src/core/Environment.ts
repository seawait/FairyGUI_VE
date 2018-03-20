import * as vscode from 'vscode';
import { existsSync, Stats, lstatSync } from 'fs';
import { basename, dirname } from 'path';

export class Environment{
    private _editorPath:string|undefined;
    private _defaultProjPath:string|undefined;
    public isRuning:boolean = false;

    public get config():vscode.WorkspaceConfiguration{
        return vscode.workspace.getConfiguration('fairygui');
    }

    public get editorPath():string|undefined{
        if(this._editorPath === undefined || this._editorPath.length === 0){
            this._editorPath = this.config.get<string>("editorPath");
        }
        return this._editorPath;
    }

    public set editorPath($value:string|undefined){
        this._editorPath = $value;
        this.config.update("editorPath", $value);
    }

    public get defaultProjPath():string|undefined{
        if(this._defaultProjPath === undefined || this._defaultProjPath.length === 0){
            this._defaultProjPath = this.config.get<string>("defaultProjectPath");
        }
        return this._defaultProjPath;
    }

    public set defaultProjPath($value:string|undefined){
        this._defaultProjPath = $value;
        this.config.update("defaultProjectPath", $value);
    }

    public async initWorkspace():Promise<string|undefined>{
        let tmpPath:string|undefined = this.editorPath;
        let msgResult:string|undefined = "确定";
        if (tmpPath === undefined || tmpPath.length === 0 || 
            basename(tmpPath, '.exe') !== 'FairyGUI-Editor' || existsSync(tmpPath) === false) {
            do {
                msgResult = undefined;
                tmpPath = await vscode.window.showInputBox({
                    prompt: "请设置FairyGUI编辑器程序完整路径:",
                    placeHolder: "fairygui.editorPath"
                });
                if(tmpPath === undefined || tmpPath.length === 0 ||
                    basename(tmpPath, '.exe') !== 'FairyGUI-Editor' || existsSync(tmpPath) === false) {
                    msgResult = await vscode.window.showWarningMessage(
                        "Fairygui编辑器路径设置无效.[确定]重设?", "确定", "取消"
                    );
                }                
            } while (msgResult === "确定");
        }
        if (tmpPath !== undefined && basename(tmpPath, '.exe') === 'FairyGUI-Editor' && existsSync(tmpPath)) {
            this.editorPath = tmpPath;
            tmpPath = this.defaultProjPath;
            if (tmpPath === undefined || tmpPath.length === 0) {
                do {
                    msgResult = undefined;
                    let f:any[]|undefined = vscode.workspace.workspaceFolders;
                    tmpPath = await vscode.window.showInputBox({
                        prompt: "请设置默认项目文件夹路径(发布时会包含文件夹下的所有fairy项目):",
                        placeHolder: "fairygui.defaultProjectPath",
                        value: (f === undefined || f.length === 0)?'':f[0].uri.fsPath
                    });
                    if (tmpPath === undefined || tmpPath.length === 0) {
                        msgResult = await vscode.window.showWarningMessage(
                            "默认Fairygui项目路径未设置.[确定]重设?", "确定", "取消"
                        );
                    }
                } while (msgResult === "确定");
            }
            if (tmpPath !== undefined && existsSync(tmpPath)) {
                let stats:Stats = lstatSync(tmpPath);
                if(stats.isFile()){
                    this.defaultProjPath = dirname(tmpPath);
                }else{
                    this.defaultProjPath = tmpPath;
                }
            }
        }
        return this._defaultProjPath;
    }
}

export default new Environment();
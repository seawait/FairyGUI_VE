'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Tool } from './core/Tool';
import { spawn, ChildProcess } from 'child_process';
import env from './core/Environment';
import { basename } from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const PACK_LABEL:string = "$(package)Fui";
    let batchPublishBtn:vscode.StatusBarItem;
    

    batchPublishBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    batchPublishBtn.text = PACK_LABEL;
    batchPublishBtn.command = "fairygui.batchPublish";
    batchPublishBtn.tooltip = "打包发布指定fairyGUI项目";
    batchPublishBtn.show();
    context.subscriptions.push(batchPublishBtn);

    let disposable = vscode.commands.registerCommand('fairygui.batchPublish', async () => {
        try {
            if(env.isRuning === true){
                vscode.window.showWarningMessage("正在发布中,请稍候操作");
                return;
            }
            env.isRuning = true;
            let folder:string|undefined = await env.initWorkspace();
            let editorPath:string|undefined = env.editorPath;
            if(editorPath === undefined || editorPath.length === 0 ||
                folder === undefined || folder.length === 0){
                vscode.window.showErrorMessage("fairygui扩展配置项设置错误!");
                env.isRuning = false;
                return;
            }
            let cmdStr: string[] = Tool.getDirFiles(folder);
            if (cmdStr.length === 0) {
                env.defaultProjPath = undefined;
                vscode.window.showErrorMessage("找不到fairygui项目文件!");
                env.isRuning = false;
                return;
            }
            // vscode.window.showInformationMessage("开始发布");
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: PACK_LABEL }, p => {
                return new Promise((resolve, reject) => {
                    let totalPackNum: number = cmdStr.length;
                    let currentPackIndex: number = 0;
                    let currentPackName: string | undefined;
                    // vscode.window.showInformationMessage(`显示进度${cmdStr.toString()}`);
                    let exitAndNext = function (code: number = 0) {
                        // vscode.window.showInformationMessage(`进度:${code},${currentPackIndex}/${totalPackNum}`);
                        if (code !== 0 || editorPath === undefined) {
                            vscode.window.showErrorMessage("fairygui发布过程出错.");
                            env.isRuning = false;
                            reject();
                            return;
                        }
                        if (currentPackIndex < totalPackNum) {
                            currentPackIndex++;
                            currentPackName = cmdStr.pop();
                            while(currentPackName === undefined && currentPackIndex < totalPackNum){
                                currentPackIndex++;
                                currentPackName = cmdStr.pop();
                            }
                            if(currentPackName === undefined){
                                vscode.window.showErrorMessage("fairygui发布过程出错,包名为空.");
                                env.isRuning = false;
                                reject();
                                return;
                            }
                            // vscode.window.showInformationMessage(`进度:${currentPackName}`);
                            let childPro:ChildProcess = spawn(editorPath, ['-p', currentPackName]);
                            childPro.on('close', ()=>setTimeout(exitAndNext, 300));
                            childPro.stderr.on('data', ($data)=>{
                                vscode.window.showInformationMessage(`执行子程序错误:${currentPackName},${$data}`);
                            });
                            childPro.stdout.on('data', ($data)=>{
                                vscode.window.showInformationMessage(`执行子程序输出:${currentPackName},${$data}`);
                            });
                            childPro.on('error', ($err)=>{
                                vscode.window.showInformationMessage(`执行子程序错误1:${currentPackName},${$err}`);
                            });
                            console.log(`${currentPackName}:(${code}|${Tool.time})`);
                            p.report({ message: `PACK【${basename(currentPackName, '.fairy')}】(${currentPackIndex}/${totalPackNum})` });
                        } else {
                            env.isRuning = false;
                            vscode.window.showInformationMessage("发布fairygui项目完成");
                            resolve();
                        }
                    };
                    exitAndNext();
                });
            });

        } catch (error) {
            vscode.window.showErrorMessage(`fairygui batch publish error:${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
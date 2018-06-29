# fairygui-ve README

## Features

在vscode状态栏右下角新增按钮用于发布指定文件夹下的所有fairygui项目文件:

![fui button](images/fui_icon.png)

点击发布按钮后,扩展程序搜索指定文件夹(fairygui.defaultProjectPath配置项设置的路径)下存在的fairygui项目
并逐个发布.

发布时在状态栏左下角显示发布进度:

![fui progress](images/fui_progress.png)

## Requirements

需要安装fairygui编辑器

## Extension Settings

* `fairygui.editorPath`: fairygui编辑器程序文件的安装地址,扩展程序使用命令行调用该程序实现批量发布
* `fairygui.defaultProjectPath`: 用于指定发布时搜索fairygui项目文件的地址

## Known Issues

* 发布前需要关闭fairygui编辑器, 否则会影响当前编辑器实例.
* 编辑器与项目地址不允许有空格, 否则有可能导致发布失败.

## Release Notes

### 0.0.5

优化发布流程,不重新发布未修改的资源包,减少发布时间

### 0.0.4

添加发布提示

### 0.0.1

实现批量发布fairygui项目功能

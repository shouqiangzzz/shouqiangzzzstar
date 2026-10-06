# 本地原创视频上传

故事、生活记录和学习心得均通过文件选择器上传本地视频。先用本地临时地址预览原片，发布时将原始 `File` 上传到 Firebase Storage；取得持久播放地址后，再等待 Firestore 保存确认。不会压缩、重录或转码，也不会将本地 `blob:` 地址保存为发布内容。

支持浏览器能够解码的 MP4、WebM、MOV，单个文件最多 100 MiB。无法解码的文件会在预览阶段提示重新选择；推荐使用 H.264/AAC 的 MP4 或兼容的 WebM。上传失败、取消以及内容保存失败都会保留草稿；保存失败后的重试会复用本次已完成的上传。切换登录账号会清除该账号的上传草稿和缓存。

## Firebase 配置

仓库中的 `firebase-applet-config.json` API key 目前为占位符。运行线上上传前，需填入该 Firebase Web 应用的有效配置，并确认其 `storageBucket` 对应已经启用的存储桶，且登录功能可用。不要将服务账号私钥放入前端。

`storage.rules` 允许普通登录用户在 `videos/{uid}/{uuid}/{filename}` 上传自己的原视频并删除自己的文件，限制文件大小及媒体类型，并禁止覆盖已有视频。该目录允许公开读取，以便其他用户播放社区内容。其余 Storage 路径默认拒绝访问；如果已有其他存储功能，需要先合并对应规则。

使用已登录目标项目的 Firebase CLI 部署存储规则：

```sh
firebase deploy --only storage --project gen-lang-client-0795490560
```

`firebase.json` 仅配置 Storage 规则，不部署前端或修改 Firestore 数据。代码同步 GitHub 不会自动部署云存储规则。现有 Firestore 规则需要允许普通登录用户创建包含其 `authorId` 的故事、记录和心得。

## 验证

```sh
node --experimental-strip-types --test-isolation=none --test tests/*.test.mjs
npm run build
```

文件验证、原始字节传输、进度、取消、上传回滚、视频元数据和保存确认有自动测试。`tests/storage.rules.test.mjs` 是可选的本地模拟器集成测试，启动独立的演示项目 Auth/Storage 模拟器并设置本地环境变量后才会执行；默认跳过。此次本地模拟器运行时下载未完成，因此没有声称云端权限测试或生产上传已经通过。

上线检查应使用一个普通账号上传原创视频，再使用另一账号打开发布内容，对比原画面、声音、时长和播放节奏，并测试刷新、重新打开、上传取消以及保存失败后的重试。

# 飞牛 OS Docker Compose 安装说明

本文用于在飞牛 OS / fnOS 上部署“墨迹写作台”Docker Web 版。

## 1. 准备条件

需要飞牛 OS 已启用 Docker 或容器管理功能。

如果你要自己在 Windows 本机打包镜像，需要：
- 安装并启动 Docker Desktop。
- Docker Desktop 左下角显示 Engine running。

如果你要把镜像上传到 GitHub Container Registry，需要：
- 一个 GitHub 仓库。
- 本地安装 Git。
- 本地安装 GitHub CLI `gh`，或准备一个 GitHub Personal Access Token。
- Token 至少需要 `repo` 和 `write:packages` 权限。

## 2. 数据保存位置

容器内固定使用：

```text
/data/moji-workspace.json
```

飞牛 OS 上建议映射到一个固定目录，例如：

```text
/vol1/1000/docker/moji-writing/data
```

只要这个目录不删，小说项目、大纲、章节和设置就不会丢。

## 3. docker-compose.yml

把下面内容保存为 `docker-compose.yml`。

把 `YOUR_GITHUB_USERNAME` 改成你的 GitHub 用户名或组织名。

```yaml
services:
  moji-writing-workbench:
    image: ghcr.io/orangewoker/moji-writing:0.1.16
    container_name: moji-writing-workbench
    restart: unless-stopped
    ports:
      - "8088:8080"
    environment:
      MOJI_DATA_DIR: /data
      PORT: 8080
    volumes:
      - /vol1/1000/docker/moji-writing/data:/data
```

启动后访问：

```text
http://飞牛OS的IP:8088
```

## 4. 飞牛 OS 操作步骤

1. 在飞牛 OS 文件管理器里创建目录：

```text
/vol1/1000/docker/moji-writing/data
```

2. 在容器管理里新建 Compose 项目。

3. 粘贴上面的 `docker-compose.yml`。

4. 修改镜像地址里的 `YOUR_GITHUB_USERNAME`。

5. 部署并启动。

6. 浏览器打开：

```text
http://飞牛OS的IP:8088
```

## 5. 本地构建镜像

如果 Docker Desktop 已启动，可以在项目目录执行：

```powershell
docker build -t ghcr.io/orangewoker/moji-writing:0.1.16 .
```

本地测试：

```powershell
docker run --rm -p 8088:8080 -v "${PWD}/moji-data:/data" ghcr.io/orangewoker/moji-writing:0.1.16
```

访问：

```text
http://127.0.0.1:8088
```

## 6. 上传 GitHub 和 GHCR

推荐流程：

```powershell
git init
git add .
git commit -m "Add Docker deployment"
git branch -M main
git remote add origin https://github.com/orangewoker/moji-writing.git
git push -u origin main
```

推送后，仓库里的 GitHub Actions 会自动构建镜像并推送到：

```text
ghcr.io/orangewoker/moji-writing:latest
ghcr.io/orangewoker/moji-writing:0.1.16
```

如果镜像是私有包，飞牛 OS 拉取前需要登录 GHCR：

```bash
docker login ghcr.io
```

用户名填 GitHub 用户名。

密码填 GitHub Personal Access Token。

Token 权限至少需要：

```text
read:packages
```

如果要推送镜像，需要：

```text
write:packages
```

## 7. 注意事项

- Docker Web 版没有 Electron 的系统目录选择弹窗。
- Web 版会自动把数据保存到映射的 `/data/moji-workspace.json`。
- 不要把 `/data` 映射到临时目录。
- 更新镜像前，建议先备份映射目录里的 `moji-workspace.json`。

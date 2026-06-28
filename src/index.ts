import "./index.scss";
import {Plugin} from "siyuan";

export default class OpenMojiPlugin extends Plugin {
    private readonly overrideStyle = document.createElement("style");

    onload() {
        this.applyFontOverrides();
        this.preloadFonts();
        console.log(this.displayName, "loaded");
    }

    onunload() {
        this.overrideStyle.remove();
        console.log(this.displayName, "unloaded");
    }

    private applyFontOverrides() {
        const emoji = '"OpenMoji", "Emojis Additional", "Emojis Reset", ';
        const fallbackHead = "BlinkMacSystemFont, Helvetica, ";
        const fallbackMid = '"Luxi Sans", "DejaVu Sans", arial, ';
        const fallbackEnd = `${emoji}sans-serif, emojis`;
        const lang = window.siyuan.config.appearance.lang; // 不能用 document.documentElement.lang，因为插件启动时这个属性可能还不存在
        let family: string;
        switch (lang) {
            case "zh-CN":
                family = `${fallbackHead}"PingFang SC", ${fallbackMid}"Microsoft Yahei", "Hiragino Sans GB", "Source Han Sans SC", ${fallbackEnd}`;
                break;
            case "zh-TW":
                family = `${fallbackHead}"PingFang TC", ${fallbackMid}"Microsoft Jhenghei", "Hiragino Sans TC", "Source Han Sans TC", ${fallbackEnd}`;
                break;
            case "ja":
                family = `${fallbackHead}${fallbackMid}"Yu Gothic UI", arial, ${fallbackEnd}`;
                break;
            default:
                family = `${fallbackHead}${fallbackMid}${fallbackEnd}`;
                break;
        }
        const rules = [
            `:root:lang(${lang}) { --b3-font-family: ${family} !important; }`,
            `:root { --b3-font-family-emoji: ${emoji}emojis !important; }`,
        ];

        // id 以 snippetCSS 开头的 style 元素会被添加到导出 PDF 中
        // https://github.com/siyuan-note/siyuan/commit/4318aa446369eaf4ea85982ba4919b5d47340552
        // https://github.com/siyuan-note/siyuan/commit/0361599aba79a200c410aa9de5873da4a52b2667
        this.overrideStyle.id = "snippetCSS-" + this.name + "-override";
        this.overrideStyle.textContent = rules.join("\n");
        if (!this.overrideStyle.isConnected) {
            document.head.appendChild(this.overrideStyle);
        }
    }

    private preloadFonts() {
        if (!document.fonts || typeof document.fonts.load !== "function") {
            return;
        }
        setTimeout(() => {
            try {
                document.fonts.load('400 16px "OpenMoji"', "😀");
            } catch {
                // 预加载失败不影响插件功能
            }
        }, 0);
    }
}

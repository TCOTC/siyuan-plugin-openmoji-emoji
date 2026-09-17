import "./index.scss";
import {Plugin} from "siyuan";

// SiYuan 3.8.3 起字体栈由 --b3-font-family-emoji-reset 等变量拼成，只改写 emoji 前缀即可让
// OpenMoji 优先渲染表情符号，同时保留「设置 - 外观」中的全局默认字体与编辑器字体
// https://github.com/siyuan-note/siyuan/issues/16923
// https://github.com/siyuan-note/siyuan/issues/19148
const EMOJI_PREFIX = '"OpenMoji", "Emojis Additional", "Emojis Reset"';

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
        const rules = [
            `:root { --b3-font-family-emoji-reset: ${EMOJI_PREFIX} !important; }`,
            `:root { --b3-font-family-emoji: ${EMOJI_PREFIX}, emojis !important; }`,
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

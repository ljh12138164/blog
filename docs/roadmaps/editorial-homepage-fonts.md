# 编辑型首页与字体体系 roadmap

## Context

Related development document: [编辑型首页与字体体系](../development/editorial-homepage-fonts.md)

## Next

### 消除文章表格导致的移动端页面横向溢出

- Value: 让窄屏读者只在表格容器内部横向滚动，避免整个文章页面出现横向滚动条。
- Evidence: 390px 代表文章实测中，文档内容宽 375px，但表格右边界达到 449px；溢出元素均来自该表格的 `table`、`thead`、`tr`、`th` 和 `td`。
- Dependencies: 需要确认 Nextra MDX 表格的统一包装方式，并验证长 URL、代码片段和普通表格在桌面端不退化。
- Completion signal: 代表文章在 390px 下满足 `documentElement.scrollWidth === documentElement.clientWidth`，宽表格可在自身容器内滚动，桌面表格布局保持不变。

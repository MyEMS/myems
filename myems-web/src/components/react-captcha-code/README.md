# react-captcha-code

基于 `React` 和 `canvas` 的一个验证码组件

## 安装

```
npm install react-captcha-code --save
```

## 需要用户自己安装的依赖

同级依赖:

| 依赖名称       |     版本      |
| :------------- | :-----------: |
| ｜ `react`     | `^16.13.1` ｜ |
| ｜ `react-dom` | `^16.13.1` ｜ |

## APIS

|    名称     |            类型             | 是否必填 | 默认值    | 描述                                                                                                                                    |
| :---------: | :-------------------------: | :------: | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
|  `height`   |          `number`           |   `否`   | `40`      | 验证码的高度                                                                                                                            |
|   `width`   |          `number`           |   `否`   | `100`     | 验证码的宽度                                                                                                                            |
|  `bgColor`  |          `string`           |   `否`   | `#DFF0D8` | 背景颜色                                                                                                                                |
|  `charNum`  |          `number`           |   `否`   | `4`       | 字符个数                                                                                                                                |
| `fontSize`  |          `number`           |   `否`   | `25`      | 字体大小                                                                                                                                |
| `code`  |          `string`           |   `否`   |      | 要展示的验证码（受控） |
| `onChange`  | `(captcha: string) => void` |   `否`   |           | 点击验证码的回调函数, 用来传递验证码（会在页面初始加载和点击验证码时调用）                                                              |
| `onClick`  | `() => void` |   `否`   |           | 点击验证码的回调函数                                             |
|   `onRef`   |    `(ref: any) => void`     |   `否`   |           | ~~在验证码组件初次挂载时调用，返回 canvas DOM（可主动调用 canvas.click() 来刷新验证码）~~ `不推荐使用，推荐使用下面的 ref 获取刷新接口` |
|    `ref`    |             `-`             |   `否`   |           | 推荐使用 ref 获取刷新接口`canvasRef.current.refresh()` 组件内部通过过`useImperativeHandle` 暴露 refresh 接口                            |
| `className` |          `string`           |   `否`   |           | 样式名                                                                                                                                  |

## 基本用法

### 代码示例

```jsx
import React, { useCallback, useRef } from 'react';
import Captcha from 'react-captcha-code';

export const Basic = () => {
  const handleChange = useCallback((captcha) => {
    console.log('captcha:', captcha);
  }, []);

  const captchaRef = useRef<HTMLCanvasElement>();

  const handleClick = () => {
    // 刷新验证码
    (captchaRef as any).current.refresh();
  };

  return (
    <>
      <Captcha ref={captchaRef} charNum={6} onChange={handleChange} />
      <div>
        <button onClick={handleClick}>更换验证码</button>
      </div>
    </>
  );
};

```

### 效果

[![Edit zen-paper-9yish](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/zen-paper-9yish?fontsize=14&hidenavigation=1&theme=dark)

# 更新日志

## [1.0.5] - 2021-01-07

### Features

- 暴露`refresh`接口来刷新验证码

### Fix

- `onRef` 改为可选

## [1.0.6] - 2021-02-03

### Features

- 验证码组件支持受控

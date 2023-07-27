import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as S from './style';
import { originalCharacter, randomColor, randomNum } from './utils';
import { isFunction } from 'lodash';
import cs from 'classnames';

export interface ICaptchaProps {
  /**
   * 高度
   */
  height?: number;
  /**
   * 宽度
   */
  width?: number;
  /**
   * 背景颜色
   */
  bgColor?: string;
  /**
   * 字符个数
   */
  charNum?: number;
  /**
   * 字体大小
   */
  fontSize?: number;
  /**
   * 改变验证码的回调函数, 用来传递验证码（会在页面初始加载和点击验证码时调用）
   * @memberof ICaptchaProps
   */
  onChange?: (captcha: string) => void;
  /**
   * 点击验证码的回调函数, 用来传递验证码（会在页面初始加载和点击验证码时调用）
   * @memberof ICaptchaProps
   */
  onClick?: () => void;
  /**
   * 数组类型，传入用来展示的验证码
   */
  code?: string;
  /**
   * 样式名
   */
  className?: string;
  /**
   * 用来获取组件的props
   */
  onRef?: (ref: any) => void;
}

export interface canvasRefProps {
  /**
   * 主动刷新验证码接口
   */
  refresh(): void;
}

const Captcha = forwardRef<canvasRefProps, ICaptchaProps>(
  (
    {
      height = 40,
      width = 100,
      bgColor = '#DFF0D8',
      charNum = 4,
      fontSize = 25,
      onChange,
      onClick,
      className,
      onRef,
      code = ''
    },
    ref,
  ) => {
    const canvas = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      onRef && onRef(canvas);
    }, []);

    useImperativeHandle(ref, () => ({
      refresh() {
        (canvas.current as HTMLCanvasElement).click();
      },
    }));

    // 生成原始的数据
    const generateSourceCode = useCallback(() => {
      const array = []
      if (code) {
        return code.split('')
      }
      for (let i = 0; i < charNum; i++) {
        const temp = originalCharacter[randomNum(0, originalCharacter.length - 1)]
        array.push(temp)
      }
      return array;
    }, [code, charNum]);

    const generateCaptcha = useCallback(() => {
      let checkCode = '';
      if (canvas.current) {
        const ctx = canvas.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.beginPath();
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
          const sourceCode = generateSourceCode();
          for (let i = 0; i < sourceCode.length; i++) {
            const charGap = Math.round(width / charNum);
            const offset = Math.round(charGap / 2) - 6;
            const code = sourceCode[i]
            checkCode += code;
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.strokeStyle = randomColor();
            ctx.font = `${fontSize}px serif`;
            ctx.rotate((Math.PI / 180) * randomNum(-5, 5));
            ctx.strokeText(code, offset + i * charGap, height / 2 + 8);
            ctx.beginPath();
            ctx.moveTo(randomNum(0, width), randomNum(0, height));
            ctx.lineTo(randomNum(0, width), randomNum(0, height));
            ctx.stroke();
            ctx.restore();
          }
          return checkCode;
        } else {
          return '';
        }
      } else {
        return '';
      }
    }, [code]);

    const handleClick = useCallback(() => {
      if (isFunction(onChange) && !code) {
        const captcha = generateCaptcha();
        onChange(captcha);
      }
      if (isFunction(onClick)) {
        onClick()
      }
    }, [onChange, code]);

    useEffect(() => {
      const captcha = generateCaptcha();
      if (isFunction(onChange) && !code) {
        onChange(captcha);
      }
    }, [code]);

    return (
      <S.SCaptcha
        className={cs('react-captcha', className)}
        onClick={handleClick}
        height={height}
        width={width}
        ref={canvas}
      />
    );
  },
);

export default Captcha;

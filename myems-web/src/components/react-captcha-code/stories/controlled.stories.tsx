import React, { useCallback, useState } from 'react';
import Captcha from '../../react-captcha-code';
import { randomNum, originalCharacter } from './utils';


export const Controlled = () => {

  const [code, setCode] = useState('3456');
  console.log('code: ', code);

  const handleClick = useCallback(() => {
    let str = ''
    for (let i = 0; i < 4; i++) {
      const temp = originalCharacter[randomNum(0, originalCharacter.length - 1)]
      str = `${str}${temp}`
    }
    setCode(str)
  }, [])

  return (
    <span>
      <Captcha onClick={handleClick} code={code} />
      <div>
        <button onClick={handleClick}>更换验证码</button>
      </div>
    </span>
  );
};

Controlled.story = {
  name: 'Controlled',
};

export default { title: 'Controlled' };

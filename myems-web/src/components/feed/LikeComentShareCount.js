import React, { Fragment } from 'react';
import classNames from 'classnames';
import { isIterableArray } from '../../helpers/utils';

const LikeCommentShareCountText = ({ count, text }) => (
  <a className="text-700" href="#!">
    {count} {text}
    {count !== 1 && 's'}
  </a>
);

const LikeCommentShareCount = ({ countLCS, comments = [] }) => {
  const { like = 0, share = 0 } = countLCS;
  const countLCSArray = [like, comments.length, share];
  const countLCSObj = {};

  countLCSArray.map((count, index) => {
    if (count) {
      countLCSObj[
        classNames({
          Like: index === 0,
          Comment: index === 1,
          Share: index === 2
        })
      ] = count;
    }
    return countLCSObj;
  });

  const keys = Object.keys(countLCSObj);

  return isIterableArray(keys) ? (
    <div className="border-bottom border-200 fs--1 py-3">
      {keys.map((key, index) => (
        <Fragment key={index}>
          <LikeCommentShareCountText count={countLCSObj[key]} text={key} />
          {index < keys.length - 1 && ' • '}
        </Fragment>
      ))}
    </div>
  ) : null;
};
export default LikeCommentShareCount;

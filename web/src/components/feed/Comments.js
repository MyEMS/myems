import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Media } from 'reactstrap';
import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';
import createMarkup from '../../helpers/createMarkup';

const Comments = ({ comments, loadComment }) => {
  return (
    <Fragment>
      {comments.map(({ id, avatarSrc, name, content, postTime }) => (
        <Fragment key={id}>
          <Media className="mt-3">
            <Avatar src={avatarSrc} size="xl" />
            <Media body className="ml-2 fs--1">
              <p className="mb-1 bg-200 rounded-soft p-2">
                <Link className="font-weight-semi-bold" to="/pages/profile">
                  {name}
                </Link>
                <span className="ml-1" dangerouslySetInnerHTML={createMarkup(content)} />
              </p>
              <div className="px-2">
                <a href="#!">Like</a> • <a href="#!">Reply</a> • {postTime}
              </div>
            </Media>
          </Media>
        </Fragment>
      ))}
      {!!loadComment && (
        <a className="fs--1 text-700 d-inline-block mt-2" href="#!">
          Load more comments ({loadComment})
        </a>
      )}
    </Fragment>
  );
};

Comments.propTypes = {
  comments: PropTypes.array.isRequired,
  loadComment: PropTypes.string
};

export default Comments;

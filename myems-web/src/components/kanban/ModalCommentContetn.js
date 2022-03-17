import React from 'react';
import { Media, Form, Input, Button } from 'reactstrap';
import Avatar from '../common/Avatar';
import users from '../../data/dashboard/users';
import Flex from '../common/Flex';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const ModalCommentContent = () => {
  return (
    <>
      <Media>
        <Avatar src={users[3].avatar.src} className="mr-2" size="l" />
        <Media body className="fs--1">
          <div className="position-relative border rounded mb-3">
            <Form
              onSubmit={e => {
                e.preventDefault();
              }}
            >
              <Input type="textarea" className="border-0 rounded-bottom-0 resize-none" rows={3} />
              <Flex justify="between" align="center" className="bg-light rounded-bottom p-2 mt-1">
                <Button size="sm" color="primary" type="submit">
                  Save
                </Button>
                <ul className="list-inline mb-0">
                  <li className="list-inline-item mr-1">
                    <Link to="#!" className="text-600 p-2 transition-base hover-200 rounded">
                      <FontAwesomeIcon icon="paperclip" />
                    </Link>
                  </li>
                  <li className="list-inline-item mr-1">
                    <Link to="#!" className="text-600 p-2 transition-base hover-200 rounded">
                      <FontAwesomeIcon icon="at" />
                    </Link>
                  </li>
                  <li className="list-inline-item mr-1">
                    <Link to="#!" className="text-600 p-2 transition-base hover-200 rounded">
                      <FontAwesomeIcon icon="image" />
                    </Link>
                  </li>
                </ul>
              </Flex>
            </Form>
          </div>
        </Media>
      </Media>
      <Media className="mb-3">
        <Link to="pages/profile">
          <Avatar src={users[3].avatar.src} size="l" />
        </Link>
        <Media body className="ml-2 fs--1">
          <p className="mb-1 bg-200 rounded-soft p-2">
            <Link to="pages/profile" className="font-weight-semi-bold">
              Rowan
            </Link>{' '}
            This time we should finish the task before the deadline
          </p>
          <Link to="#!">Like</Link>
          <span> &bull; </span>
          <Link to="#!">Reply</Link>
          <span> &bull; 23min</span>
        </Media>
      </Media>
      <Media>
        <Link to="pages/profile">
          <Avatar src={users[0].avatar.src} size="l" />
        </Link>
        <Media body className="ml-2 fs--1">
          <p className="mb-1 bg-200 rounded-soft p-2">
            <Link to="pages/profile" className="font-weight-semi-bold">
              Emma
            </Link>{' '}
            We have more task to do
          </p>
          <Link to="#!">Like</Link>
          <span> &bull; </span>
          <Link to="#!">Reply</Link>
          <span> &bull; 2hour</span>
        </Media>
      </Media>
    </>
  );
};

export default ModalCommentContent;

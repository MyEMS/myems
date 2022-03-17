import React, { useState } from 'react';
import { Modal, ModalBody } from 'reactstrap';

import { attachments } from '../../data/kanban/kanbanItems';
import FalconLightBox from '../common/FalconLightBox';
import { Link } from 'react-router-dom';
import Background from '../common/Background';
import { Media } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ModalAttachmentsContent = () => {
  const [nestedModal, setNestedModal] = useState(false);
  const toggleNested = () => {
    setNestedModal(!nestedModal);
  };
  const externalCloseBtn = (
    <button
      className="close text-secondary p-3"
      style={{ position: 'absolute', top: '15px', right: '15px' }}
      onClick={toggleNested}
    >
      <FontAwesomeIcon icon="times" transform="right-0.3 down-0.3" />
    </button>
  );

  return (
    <>
      {attachments.map((item, index) => {
        return (
          <Media key={index} className={index !== item.length - 1 && 'mb-3'}>
            <div className="bg-attachment mr-3">
              {item.image ? (
                <>
                  {item.type !== 'video' ? (
                    <FalconLightBox imgSrc={item.image}>
                      <Background image={item.image} className="rounded" />
                    </FalconLightBox>
                  ) : (
                    <>
                      <Link to="#!" onClick={() => setNestedModal(true)}>
                        <Background image={item.image} className="rounded" />
                      </Link>
                      <div className="icon-play">
                        <FontAwesomeIcon icon="play" />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <span className="text-uppercase font-weight-bold">{item.type}</span>
              )}
            </div>

            <Media body className="fs--2">
              <h6 className="mb-1 text-primary">
                {item.image ? (
                  <>
                    {item.type !== 'video' && (
                      <FalconLightBox imgSrc={item.image}>
                        <Link to="#!" className="text-decoration-none">
                          {item.title}
                        </Link>
                      </FalconLightBox>
                    )}
                    {item.type === 'video' && (
                      <Link to="#!" onClick={() => setNestedModal(true)}>
                        {item.title}
                      </Link>
                    )}
                  </>
                ) : (
                  <a href="#!" className="text-decoration-none">
                    {item.title}
                  </a>
                )}
              </h6>
              <Link className="text-600 font-weight-semi-bold" to="#!">
                Edit
              </Link>
              <span className="mx-1">|</span>
              <Link className="text-600 font-weight-semi-bold" to="#!">
                Remove
              </Link>
              <p className="mb-0">Uploaded at{item.date} </p>
            </Media>
            <Modal
              isOpen={nestedModal}
              toggle={toggleNested}
              external={externalCloseBtn}
              size="xl"
              centered
              contentClassName="bg-transparent border-0"
            >
              <ModalBody className="p-0 rounded overflow-hidden">
                <div class="embed-responsive embed-responsive-16by9">
                  <video poster={item.image} controls autoPlay>
                    <source src={item.src} type="video/mp4" />
                    {/* <source src="movie.ogg" type="video/ogg" /> */}
                    Your browser does not support the video tag.
                  </video>
                </div>
              </ModalBody>
            </Modal>
          </Media>
        );
      })}
    </>
  );
};

export default ModalAttachmentsContent;

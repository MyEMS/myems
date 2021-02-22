import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { isIterableArray } from '../../../helpers/utils';
import { Button, Col, Form, FormGroup, Label, Row, Table } from 'reactstrap';
import StarCount from '../product/StarCount';
import FalconInput from '../../common/FalconInput';

function offset(el) {
  const rect = el.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

const ProductDetailsFooter = () => {
  const [activeTab, setActiveTab] = useState('description');
  const [indicatorLeft, setIndicatorLeft] = useState(null);
  const [indicatorRight, setIndicatorRight] = useState(null);
  const [currentTabIndex, setCurrentTabIndex] = useState(null);
  const [isReverse, setIsReverse] = useState(false);

  const updateIndicator = id => {
    const navbar = document.getElementById('fancy-tab-footer');
    const tabnavCurrentItem = document.getElementById(id);
    const navbarLeft = offset(navbar).left;
    const left = offset(tabnavCurrentItem).left - navbarLeft;
    const right = navbar.offsetWidth - (left + tabnavCurrentItem.offsetWidth);
    setIndicatorLeft(left);
    setIndicatorRight(right);
  };

  const handleActiveTab = ({ target }) => {
    const { id, tabIndex } = target;
    setActiveTab(id);
    updateIndicator(id);
    setIsReverse(currentTabIndex > tabIndex);
    setCurrentTabIndex(tabIndex);
  };

  const specifications = {
    Processor: '2.3GHz quad-core Intel Core i5,',
    Memory: '8GB of 2133MHz LPDDR3 onboard memory',
    Brand: 'Name	Apple',
    Model: 'Mac Book Pro',
    Display: '13.3-inch (diagonal) LED-backlit display with IPS technology',
    Storage: '512GB SSD',
    Graphics: 'Intel Iris Plus Graphics 655',
    Weight: '7.15 pounds',
    Finish: 'Silver, Space Gray'
  };

  useEffect(() => {
    handleActiveTab({ target: { id: 'description', tabIndex: 1 } });
    // eslint-disable-next-line
  }, []);

  return (
    <div className="row">
      <div className="col-12">
        <div className="fancy-tab overflow-hidden mt-4" id="fancy-tab-footer">
          <div className="nav-bar">
            <div className={classNames('nav-bar-item pl-0 pr-2 pr-sm-4', { active: activeTab === 'description' })}>
              <div className="mt-1 fs--1" id="description" tabIndex={1} onClick={handleActiveTab}>
                Description
              </div>
            </div>
            <div className={classNames('nav-bar-item px-2 px-sm-4', { active: activeTab === 'specifications' })}>
              <div className="mt-1 fs--1" id="specifications" tabIndex={2} onClick={handleActiveTab}>
                Specifications
              </div>
            </div>
            <div className={classNames('nav-bar-item px-2 px-sm-4', { active: activeTab === 'reviews' })}>
              <div className="mt-1 fs--1" id="reviews" tabIndex={3} onClick={handleActiveTab}>
                Reviews
              </div>
            </div>
            <div
              className={classNames('tab-indicator', {
                'transition-reverse': isReverse
              })}
              style={{ left: indicatorLeft, right: indicatorRight }}
            />
          </div>
          <div className="tab-contents">
            <div className={classNames('tab-content', { active: activeTab === 'description' })}>
              <p>
                Over the years, Apple has built a reputation for releasing its products with a lot of fanfare – but that
                didn’t exactly happen for the MacBook Pro 2018. Rather, Apple’s latest pro laptop experienced a subdued
                launch, in spite of it offering a notable spec upgrade over the 2017 model – along with an improved
                keyboard. And, as with previous generations the 15-inch MacBook Pro arrives alongside a 13-inch model.
              </p>
              <p>
                Apple still loves the MacBook Pro though, despite the quiet release. This is because, while the iPhone
                XS and iPad, along with the 12-inch MacBook, are aimed at everyday consumers, the MacBook Pro has always
                aimed at the creative and professional audience. This new MacBook Pro brings a level of performance (and
                price) unlike its more consumer-oriented devices.{' '}
              </p>
              <p>
                Still, Apple wants mainstream users to buy the MacBook Pro, too. So, if you’re just looking for the most
                powerful MacBook on the market, you’ll love this new MacBook Pro. Just keep in mind that, while the
                keyboard has been updated, there are still some issues with it.
              </p>
              <p>
                There’s enough of a difference between the two sizes when it comes to performance to warrant two
                separate reviews, and here we’ll be looking at how the flagship 15-inch MacBook Pro performs in 2019.
              </p>
              <p>
                It's build quality and design is batter than elit. Numquam excepturi a debitis, sint voluptates, nam
                odit vel delectus id repellendus vero reprehenderit quidem totam praesentium vitae nesciunt deserunt.
                Sint, veniam?
              </p>
            </div>
            <div className={classNames('tab-content', { active: activeTab === 'specifications' })}>
              {isIterableArray(Object.keys(specifications)) && (
                <Table bordered className="fs--1">
                  <tbody>
                    {Object.keys(specifications).map((specification, index) => (
                      <tr key={index}>
                        <td className="bg-100" style={{ width: '30%' }}>
                          {specification}
                        </td>
                        <td>{specifications[specification]}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
            <div className={classNames('tab-content', { active: activeTab === 'reviews' })}>
              <Row>
                <Col lg={6} className="mb-4 mb-lg-0">
                  <div className="mb-1">
                    <StarCount stars={4.5} />
                    <span className="ml-3 text-dark font-weight-semi-bold">
                      Awesome support, great code{' '}
                      <span role="img" aria-label="emoji">
                        😍
                      </span>
                    </span>
                  </div>
                  <p className="fs--1 mb-2 text-600">By Drik Smith • October 14, 2019</p>
                  <p className="mb-0">
                    You shouldn't need to read a review to see how nice and polished this theme is. So I'll tell you
                    something you won't find in the demo. After the download I had a technical question, emailed the
                    team and got a response right from the team CEO with helpful advice.
                  </p>
                  <hr className="my-4" />
                  <div className="mb-1">
                    <StarCount stars={3.5} />
                    <span className="ml-3 text-dark font-weight-semi-bold">Outstanding Design, Awesome Support</span>
                  </div>
                  <p className="fs--1 mb-2 text-600">By Liane • December 14, 2019</p>
                  <p className="mb-0">
                    This really is an amazing template - from the style to the font - clean layout. SO worth the money!
                    The demo pages show off what Bootstrap 4 can impressively do. Great template!! Support response is
                    FAST and the team is amazing - communication is important.
                  </p>
                  <hr className="my-4" />
                </Col>
                <Col lg={6} className="pl-lg-5">
                  <Form
                    onSubmit={e => {
                      e.preventDefault();
                      console.log('Submitted!');
                    }}
                  >
                    <h5 className="mb-3">Write your Review</h5>
                    <FormGroup>
                      <Label>Rating:</Label>
                      <br />
                      <StarCount stars={0} />
                    </FormGroup>
                    <FormGroup>
                      <FalconInput label="Name:" onChange={({ target }) => console.log(target.value)} />
                    </FormGroup>
                    <FormGroup>
                      <FalconInput label="Email:" onChange={({ target }) => console.log(target.value)} type="email" />
                    </FormGroup>
                    <FormGroup>
                      <FalconInput
                        label="Review:"
                        onChange={({ target }) => console.log(target.value)}
                        type="textarea"
                        rows="2"
                      />
                    </FormGroup>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </Form>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsFooter;

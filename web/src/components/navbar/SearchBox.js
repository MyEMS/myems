import React, { Fragment, useEffect, useState } from 'react';
import { DropdownItem, DropdownMenu, Form, Input, Dropdown, DropdownToggle, Badge, Media } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Fuse from 'fuse.js/dist/fuse.esm';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { isIterableArray } from '../../helpers/utils';
import Flex from '../common/Flex';

const MediaSearchContent = ({ item }) => {
  return (
    <DropdownItem className="px-card py-2" tag={Link} to={item.url}>
      <Media className="align-item-center">
        {item.file && (
          <div className="file-thumbnail">
            <img src={item.img} alt="" className={item.imgAttrs.class} />
          </div>
        )}
        {item.icon && <Avatar src={item.icon.img} size="l" className={item.icon.status} />}

        <Media body className="ml-2">
          <h6 className="mb-0">{item.title}</h6>
          <p className="fs--2 mb-0" dangerouslySetInnerHTML={{ __html: item.text || item.time }} />
        </Media>
      </Media>
    </DropdownItem>
  );
};

const SearchBox = ({ autoCompleteItem }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [resultItem, setResultItem] = useState(autoCompleteItem);

  const fuseJsOptions = {
    includeScore: true,
    keys: ['title', 'text', 'breadCrumbTexts']
  };

  let searchResult = new Fuse(autoCompleteItem, fuseJsOptions).search(searchInputValue).map(item => item.item);

  const recentlyBrowsedItems = resultItem.filter(item => item.catagories === 'recentlyBrowsedItems');

  const suggestedFilters = resultItem.filter(item => item.catagories === 'suggestedFilters');

  const suggestionFiles = resultItem.filter(item => item.catagories === 'suggestionFiles');

  const suggestionMembers = resultItem.filter(item => item.catagories === 'suggestionMembers');

  const toggle = () => setDropdownOpen(prevState => !prevState);

  useEffect(() => {
    if (searchInputValue) {
      setResultItem(searchResult);
      isIterableArray(searchResult) ? setDropdownOpen(true) : setDropdownOpen(false);
    } else {
      setResultItem(autoCompleteItem);
    }

    // eslint-disable-next-line
  }, [searchInputValue]);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle} className="search-box">
      <DropdownToggle tag="div" data-toggle="dropdown" aria-expanded={dropdownOpen}>
        <Form>
          <Input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="rounded-pill search-input"
            value={searchInputValue}
            onChange={({ target }) => setSearchInputValue(target.value)}
            onClick={() => setDropdownOpen(false)}
          />
          <FontAwesomeIcon icon="search" className="position-absolute text-400 search-box-icon" />
        </Form>
        {searchInputValue && (
          <button className="close" onClick={() => setSearchInputValue('')}>
            <FontAwesomeIcon icon="times" />
          </button>
        )}
      </DropdownToggle>
      <DropdownMenu>
        <div className="scrollbar py-3" style={{ maxHeight: '24rem' }}>
          {isIterableArray(recentlyBrowsedItems) && (
            <>
              <DropdownItem className="px-card pt-0 pb-2" header>
                Recently Browsed{' '}
              </DropdownItem>
              {recentlyBrowsedItems.map((item, index) => (
                <DropdownItem
                  tag={Link}
                  to={item.url}
                  className="fs--1 px-card py-1 hover-primary text-base"
                  key={index}
                >
                  <Flex align="center">
                    <FontAwesomeIcon icon="circle" className="mr-2 text-300 fs--2" />
                    <div className="font-weight-normal">
                      {item.breadCrumbTexts.map((breadCrumbText, index) => {
                        return (
                          <Fragment key={index}>
                            {breadCrumbText}
                            {item.breadCrumbTexts.length - 1 > index && (
                              <FontAwesomeIcon
                                icon="chevron-right"
                                className="mx-1 text-500 fs--2"
                                transform="shrink 2"
                              />
                            )}
                          </Fragment>
                        );
                      })}
                    </div>
                  </Flex>
                </DropdownItem>
              ))}
              {(isIterableArray(suggestedFilters) ||
                isIterableArray(suggestionFiles) ||
                isIterableArray(suggestionMembers)) && <hr className="border-200" />}
            </>
          )}

          {isIterableArray(suggestedFilters) && (
            <>
              <DropdownItem className="px-card pt-0 pb-2" header>
                Suggested Filter
              </DropdownItem>
              {suggestedFilters.map((item, index) => (
                <DropdownItem tag={Link} to={item.url} className=" px-card py-1 fs-0" key={index}>
                  <Flex align="center">
                    <Badge color={`soft-${item.type}`} className="font-weight-medium text-decoration-none mr-2">
                      {item.key}:{' '}
                    </Badge>
                    <div className="flex-1 fs--1">{item.text}</div>
                  </Flex>
                </DropdownItem>
              ))}
              {(isIterableArray(suggestionFiles) || isIterableArray(suggestionMembers)) && (
                <hr className="border-200" />
              )}
            </>
          )}

          {isIterableArray(suggestionFiles) && (
            <>
              <DropdownItem className="px-card pt-0 pb-2" header>
                Files
              </DropdownItem>
              {suggestionFiles.map((item, index) => (
                <MediaSearchContent item={item} key={index} />
              ))}
              {isIterableArray(suggestionMembers) && <hr className="border-200" />}
            </>
          )}

          {isIterableArray(suggestionMembers) && (
            <>
              <DropdownItem className="px-card pt-0 pb-2" header>
                Members
              </DropdownItem>
              {suggestionMembers.map((item, index) => (
                <MediaSearchContent item={item} key={index} />
              ))}
            </>
          )}
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default SearchBox;

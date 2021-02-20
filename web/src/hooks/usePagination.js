import { useState, useEffect } from 'react';
import chunk from 'lodash/chunk';
import { isIterableArray } from '../helpers/utils';

const usePagination = (items, defaultItemsPerPage = 5) => {
  const [data, setData] = useState([]);
  const [itemsChunk, setItemsChunk] = useState([]);
  const [total, setTotal] = useState(0);
  const [lastPageNo, setLastPageNo] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [pageNo, setPageNo] = useState(null);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(itemsPerPage);
  const [prevPageNo, setPrevPageNo] = useState(true);
  const [nextPageNo, setNextPageNo] = useState(true);

  useEffect(() => {
    setData(isIterableArray(itemsChunk[pageNo - 1]) ? itemsChunk[pageNo - 1] : []);
  }, [setData, itemsPerPage, itemsChunk, pageNo]);

  useEffect(() => {
    setItemsChunk(chunk(items, itemsPerPage));
    setPageNo(1);
    setTotal(items.length);
  }, [itemsPerPage, setPageNo, items]);

  useEffect(() => {
    setFrom(itemsPerPage * (pageNo - 1) + 1);
    setTo(itemsPerPage * (pageNo - 1) + data.length);
    setPrevPageNo(pageNo > 1 ? pageNo - 1 : null);
    setNextPageNo(pageNo < lastPageNo ? pageNo + 1 : null);
  }, [itemsPerPage, pageNo, data, lastPageNo]);

  useEffect(() => {
    setLastPageNo(itemsChunk.length);
  }, [itemsChunk]);

  const handleNextPage = () => setPageNo(pageNo + 1);
  const handlePrevPage = () => setPageNo(pageNo - 1);

  return {
    data,
    meta: { total, pageNo, lastPageNo, itemsPerPage, from, to, nextPageNo, prevPageNo },
    handler: {
      nextPage: handleNextPage,
      prevPage: handlePrevPage,
      currentPage: setPageNo,
      perPage: setItemsPerPage
    }
  };
};

export default usePagination;

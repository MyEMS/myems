import { useEffect, useState } from 'react';

const useBulkSelect = items => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  const toggleSelectedItem = id => {
    const isAlreadySelected = selectedItems.find(item => item === id);
    if (isAlreadySelected) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleIsAllSelected = () => {
    if (isAllSelected || isIndeterminate) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items);
    }
  };

  const isSelectedItem = id => {
    return !!selectedItems.find(item => item === id);
  };

  useEffect(() => {
    setIsAllSelected(selectedItems.length === items.length);
    setIsIndeterminate(!!selectedItems.length && selectedItems.length < items.length);
  }, [selectedItems, items]);

  return { selectedItems, isAllSelected, isIndeterminate, toggleSelectedItem, toggleIsAllSelected, isSelectedItem };
};

export default useBulkSelect;

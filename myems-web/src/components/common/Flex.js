import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Flex = ({ justify, align, inline, column, wrap, className, tag: Tag, children, ...rest }) => {
  return (
    <Tag
      className={classNames(
        {
          'd-flex': !inline,
          'd-inline-flex': inline,
          [`justify-content-${justify}`]: justify,
          [`align-items-${align}`]: align,
          'flex-column': column,
          'flex-wrap': wrap
        },
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

Flex.propTypes = {
  children: PropTypes.node.isRequired,
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around']),
  inline: PropTypes.bool,
  align: PropTypes.oneOf(['start', 'center', 'end']),
  column: PropTypes.bool,
  wrap: PropTypes.bool,
  className: PropTypes.string,
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
};

Flex.defaultProps = {
  tag: 'div',
  column: false,
  inline: false,
  wrap: false
};

export default Flex;

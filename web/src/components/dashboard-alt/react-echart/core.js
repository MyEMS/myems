import React from 'react';
import PropTypes from 'prop-types';
import elementResizeEvent from 'element-resize-event';

export default class ReactEcharts extends React.Component {
  constructor(props) {
    super(props);
    this.echartsInstance = this.props.echarts; // the echarts object.
    this.echartsElement = null; // echarts div element
    this.previousTheme = '';
  }

  // first add
  componentDidMount() {
    this.previousTheme = this.props.theme;
    const echartObj = this.renderEchartDom();
    const onEvents = this.props.onEvents || {};

    this.bindEvents(echartObj, onEvents);
    // on chart ready
    if (typeof this.props.onChartReady === 'function') this.props.onChartReady(echartObj);

    // on resize
    elementResizeEvent(this.echartsElement, () => {
      echartObj.resize();
    });
  }

  // update
  componentDidUpdate() {
    if (this.previousTheme !== this.props.theme) {
      this.echartsInstance.dispose(this.echartsElement);
      this.previousTheme = this.props.theme;
    }
    this.renderEchartDom();
    this.bindEvents(this.getEchartsInstance(), this.props.onEvents || []);
  }

  // remove
  componentWillUnmount() {
    if (this.echartsElement) {
      // if elementResizeEvent.unbind exist, just do it.
      if (typeof elementResizeEvent.unbind === 'function') {
        elementResizeEvent.unbind(this.echartsElement);
      }
      this.echartsInstance.dispose(this.echartsElement);
    }
  }
  // return the echart object
  getEchartsInstance = () =>
    this.echartsInstance.getInstanceByDom(this.echartsElement) ||
    this.echartsInstance.init(this.echartsElement, this.props.theme);

  // bind the events
  bindEvents = (instance, events) => {
    const _bindEvent = (eventName, func) => {
      // ignore the event config which not satisfy
      if (typeof eventName === 'string' && typeof func === 'function') {
        // binding event
        // instance.off(eventName); // 已经 dispose 在重建，所以无需 off 操作
        instance.on(eventName, param => {
          func(param, instance);
        });
      }
    };

    // loop and bind
    for (const eventName in events) {
      if (Object.prototype.hasOwnProperty.call(events, eventName)) {
        _bindEvent(eventName, events[eventName]);
      }
    }
  };

  // render the dom
  renderEchartDom = () => {
    // init the echart object
    const echartObj = this.getEchartsInstance();
    // set the echart option
    echartObj.setOption(this.props.option, this.props.notMerge || false, this.props.lazyUpdate || false);
    // set loading mask
    if (this.props.showLoading) echartObj.showLoading(this.props.loadingOption || null);
    else echartObj.hideLoading();

    return echartObj;
  };

  render() {
    const style = this.props.style || {
      height: '300px'
    };
    // for render
    return (
      <div
        ref={e => {
          this.echartsElement = e;
        }}
        style={style}
        className={this.props.className}
      />
    );
  }
}

ReactEcharts.propTypes = {
  option: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  echarts: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  notMerge: PropTypes.bool,
  lazyUpdate: PropTypes.bool,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  className: PropTypes.string,
  theme: PropTypes.string,
  onChartReady: PropTypes.func,
  showLoading: PropTypes.bool,
  loadingOption: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onEvents: PropTypes.object // eslint-disable-line react/forbid-prop-types
};

ReactEcharts.defaultProps = {
  echarts: {},
  notMerge: false,
  lazyUpdate: false,
  style: {
    height: '300px'
  },
  className: '',
  theme: null,
  onChartReady: () => {},
  showLoading: false,
  loadingOption: null,
  onEvents: {}
};

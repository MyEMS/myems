import React, { Component } from 'react';
import Charts from './charts';
export const Dialog = props => {
  if (props.type === 'charts') {
    const data = props.data;
    return (
      <div
        style={{
          display: props.display,
          width: '100%',
          height: '100%',
          backgroundColor: '#061423',
          color: '#fff',
          position: 'fixed !important',
          top: '0',
          bottom: '0',
          right: '0',
          left: '0',
          background: 'rgb(0,0,0,0.5)'
        }}
      >
        <div
          style={{
            position: 'fixed',
            height: '600px',
            width: '1600px',
            left: '50%',
            top: '60%',
            backgroundColor: 'rgb(186, 186, 186)',
            transform: 'translate(-50%,-50%)'
          }}
        >
          <button onClick={props.hide} style={{ position: 'absolute', right: '0', zIndex: '99999', color: '#000' }}>
            &times;
          </button>
          <div>
            <Charts data={data} pointid={props.pointid} pointname={props.pointname} />
          </div>
        </div>
      </div>
    );
  }
  return <div />;
};
export default Dialog;

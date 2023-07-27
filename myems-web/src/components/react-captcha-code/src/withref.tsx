import React, { forwardRef, ComponentType, Component } from 'react';
// import { ICaptchaProps } from './captcha';

function withRef<T>(WrappedComponent: ComponentType<T>) {
  // const HOC: React.FC<T & { forwardedRef: any }> = ({ forwardedRef, ...restProps }) => {
  //   return (
  //     <WrappedComponent ref={forwardedRef} {...restProps as T}/>
  //   )
  // }
  // return forwardRef((props, ref: any) => {
  //   console.log('props:', props);
  //   return (
  //     <HOC {...props as T} forwardedRef={ref} />
  //   )
  // })

  class HOC extends Component<T & { forwardedRef: any }> {
    
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <WrappedComponent ref={forwardedRef} {...restProps as T}/>
      )
    }
  }

  return forwardRef((props: T, ref) => {
    return (
      <HOC {...props as T} forwardedRef={ref} />
    ) 
  })

}

export default withRef;
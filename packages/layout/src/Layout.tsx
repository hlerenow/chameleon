import React from 'react';
import styles from './Layout.module.scss';
import {
  DesignRender,
  DesignRenderProp,
  ReactAdapter,
} from '@chameleon/render';

export type LayoutPropsType = Omit<DesignRenderProp, 'adapter'>;

class Layout extends React.Component<LayoutPropsType> {
  designRenderRef: React.RefObject<DesignRender>;
  constructor(props: LayoutPropsType) {
    super(props);
    this.designRenderRef = React.createRef<DesignRender>();
  }

  componentDidMount(): void {
    console.log(this.designRenderRef);
  }

  render() {
    const { designRenderRef } = this;
    const { page, pageModel, components } = this.props;
    return (
      <div className={styles.layoutContainer}>
        我是layout
        <DesignRender
          pageModel={pageModel}
          page={page}
          components={components}
          ref={designRenderRef}
          adapter={ReactAdapter}
        />
      </div>
    );
  }
}

export default Layout;
